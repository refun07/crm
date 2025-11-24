<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ImportBatch;
use App\Models\ImportError;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\LeadsImport;
use Inertia\Inertia;

class ImportController extends Controller
{
    /**
     * Show import page
     */
    public function index()
    {
        $batches = ImportBatch::with('uploader')
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Import/Index', [
            'batches' => $batches,
        ]);
    }

    /**
     * Upload and process Excel/CSV file
     */
    public function upload(Request $request)
    {
        // Only super admin can upload
        if (!$request->user()->hasRole('super_admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // 10MB max
        ]);

        try {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();

            // Store the file
            $filePath = $file->storeAs('imports', $fileName, 'imports');

            // Verify file was stored
            $fullPath = storage_path('app/' . $filePath);
            if (!file_exists($fullPath)) {
                throw new \Exception('File upload failed - file not found at: ' . $fullPath);
            }

            // Generate batch number
            $batchNumber = 'BATCH-' . date('Ymd') . '-' . strtoupper(Str::random(6));

            // Create import batch record
            $batch = ImportBatch::create([
                'batch_number' => $batchNumber,
                'uploaded_by' => auth()->id(),
                'file_name' => $fileName,
                'file_path' => $filePath,
                'status' => 'pending',
            ]);

            // Process the import in background (you can use queues for this)
            $this->processImport($batch);

            return response()->json([
                'message' => 'File uploaded successfully. Processing started.',
                'batch' => $batch,
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Import upload failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process the import
     */
    private function processImport(ImportBatch $batch)
    {
        try {
            $batch->update([
                'status' => 'processing',
                'started_at' => now(),
            ]);

            $filePath = storage_path('app/' . $batch->file_path);
            $data = Excel::toArray(new LeadsImport, $filePath);

            if (empty($data) || empty($data[0])) {
                throw new \Exception('No data found in file');
            }

            $rows = $data[0];
            $header = array_shift($rows); // Remove header row

            $totalRows = count($rows);
            $successfulRows = 0;
            $failedRows = 0;
            $duplicateRows = 0;

            foreach ($rows as $index => $row) {
                try {
                    // Map columns (adjust based on your Excel structure)
                    $leadData = [
                        'name' => $row[0] ?? null,
                        'email' => $row[1] ?? null,
                        'phone' => $row[2] ?? null,
                        'address' => $row[3] ?? null,
                        'city' => $row[4] ?? null,
                        'state' => $row[5] ?? null,
                        'zip_code' => $row[6] ?? null,
                        'source' => $row[7] ?? 'import',
                    ];

                    // Validate required fields
                    if (empty($leadData['name']) || empty($leadData['phone'])) {
                        throw new \Exception('Name and phone are required');
                    }

                    // Check for duplicate phone number
                    $last4 = substr($leadData['phone'], -4);
                    $candidates = Lead::where('phone_last_4', $last4)->get();
                    $existingLead = null;

                    foreach ($candidates as $candidate) {
                        if ($candidate->phone === $leadData['phone']) {
                            $existingLead = $candidate;
                            break;
                        }
                    }

                    if ($existingLead) {
                        $duplicateRows++;
                        ImportError::create([
                            'batch_id' => $batch->id,
                            'row_number' => $index + 2, // +2 because of header and 0-index
                            'row_data' => $row,
                            'error_message' => 'Duplicate phone number',
                        ]);
                        continue;
                    }

                    // Create lead
                    Lead::create([
                        'name' => $leadData['name'],
                        'email' => $leadData['email'],
                        'phone' => $leadData['phone'], // Will be encrypted by model accessor
                        'address' => $leadData['address'],
                        'city' => $leadData['city'],
                        'state' => $leadData['state'],
                        'zip_code' => $leadData['zip_code'],
                        'source' => $leadData['source'],
                        'batch_id' => $batch->id,
                        'status' => 'new',
                    ]);

                    $successfulRows++;
                } catch (\Exception $e) {
                    $failedRows++;
                    ImportError::create([
                        'batch_id' => $batch->id,
                        'row_number' => $index + 2,
                        'row_data' => $row,
                        'error_message' => $e->getMessage(),
                    ]);
                }
            }

            $batch->update([
                'total_rows' => $totalRows,
                'successful_rows' => $successfulRows,
                'failed_rows' => $failedRows,
                'duplicate_rows' => $duplicateRows,
                'status' => 'completed',
                'completed_at' => now(),
            ]);
        } catch (\Exception $e) {
            $batch->update([
                'status' => 'failed',
                'completed_at' => now(),
                'error_summary' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get batch details with errors
     */
    public function show(ImportBatch $batch)
    {
        $batch->load(['uploader', 'errors', 'leads']);

        return Inertia::render('Admin/Import/Show', [
            'batch' => $batch,
        ]);
    }

    /**
     * Download error report
     */
    public function downloadErrors(ImportBatch $batch)
    {
        $errors = $batch->errors;

        $csv = "Row Number,Error Message,Data\n";
        foreach ($errors as $error) {
            $csv .= $error->row_number . ',"' . $error->error_message . '","' . implode(',', $error->row_data) . "\"\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="errors_' . $batch->batch_number . '.csv"');
    }
}
