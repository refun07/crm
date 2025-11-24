<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CallLog;
use App\Models\Lead;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class CallLogController extends Controller
{
    /**
     * Store a new call log
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'outcome' => 'required|in:connected,not_connected,wrong_number,no_interest,interested,follow_up_scheduled,converted',
            'notes' => 'nullable|string',
            'duration_seconds' => 'nullable|integer|min:0',
        ]);

        $lead = Lead::findOrFail($validated['lead_id']);

        // Check if user has access to this lead
        if ($lead->assigned_to !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Create call log
        $callLog = CallLog::create([
            'lead_id' => $validated['lead_id'],
            'user_id' => auth()->id(),
            'outcome' => $validated['outcome'],
            'notes' => $validated['notes'] ?? null,
            'duration_seconds' => $validated['duration_seconds'] ?? null,
            'called_at' => now(),
        ]);

        // Update lead status and lock it
        $lead->update([
            'status' => $this->getLeadStatusFromOutcome($validated['outcome']),
            'is_locked' => true,
            'last_called_at' => now(),
            'call_count' => $lead->call_count + 1,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'call.made',
            'subject_type' => Lead::class,
            'subject_id' => $lead->id,
            'properties' => [
                'outcome' => $validated['outcome'],
                'call_log_id' => $callLog->id,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Call logged successfully',
            'call_log' => $callLog->load('lead', 'agent'),
        ], 201);
    }

    /**
     * Get call logs for a lead
     */
    public function index(Request $request, $leadId)
    {
        $lead = Lead::findOrFail($leadId);

        // Check access
        if ($lead->assigned_to !== auth()->id() && !auth()->user()->hasRole(['super_admin', 'manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $callLogs = CallLog::with('agent')
            ->where('lead_id', $leadId)
            ->latest('called_at')
            ->get();

        return response()->json(['call_logs' => $callLogs]);
    }

    /**
     * Map call outcome to lead status
     */
    private function getLeadStatusFromOutcome($outcome)
    {
        return match ($outcome) {
            'connected', 'not_connected' => 'called',
            'interested' => 'interested',
            'follow_up_scheduled' => 'follow_up',
            'converted' => 'converted',
            'wrong_number' => 'invalid',
            'no_interest' => 'not_interested',
            default => 'called',
        };
    }
}
