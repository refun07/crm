<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Lead;
use App\Models\CallLog;
use App\Models\ActivityLog;
use Carbon\Carbon;

class CallLogSeeder extends Seeder
{
    private $outcomes = [
        'connected' => ['Spoke with customer', 'Had a good conversation', 'Discussed product details', 'Answered questions'],
        'not_connected' => ['No answer', 'Voicemail left', 'Phone busy', 'Call dropped'],
        'wrong_number' => ['Wrong person answered', 'Number disconnected', 'Business number'],
        'no_interest' => ['Not interested at this time', 'Already purchased elsewhere', 'Too expensive'],
        'interested' => ['Very interested!', 'Wants to think about it', 'Asked for more details', 'Requested callback'],
        'follow_up_scheduled' => ['Will call back tomorrow', 'Scheduled for next week', 'Wants to discuss with spouse'],
        'converted' => ['Ready to purchase!', 'Placing order now', 'Confirmed order details'],
    ];

    public function run(): void
    {
        // Get leads that have been called (not new or just assigned)
        $leads = Lead::whereIn('status', ['called', 'interested', 'follow_up', 'converted', 'not_interested'])
            ->whereNotNull('assigned_to')
            ->get();

        $this->command->info("Creating call logs for {$leads->count()} leads...");

        $totalCallLogs = 0;

        foreach ($leads as $lead) {
            // Create 1-5 call logs per lead
            $callCount = rand(1, min(5, $lead->call_count ?: 1));

            for ($i = 0; $i < $callCount; $i++) {
                // Determine outcome based on lead status
                $outcome = $this->getOutcomeForStatus($lead->status, $i, $callCount);
                $notes = $this->outcomes[$outcome][array_rand($this->outcomes[$outcome])];

                $callLog = CallLog::create([
                    'lead_id' => $lead->id,
                    'user_id' => $lead->assigned_to,
                    'outcome' => $outcome,
                    'notes' => $notes,
                    'duration_seconds' => $outcome === 'not_connected' ? rand(5, 30) : rand(60, 600),
                    'called_at' => now()->subDays(rand(0, 14))->subHours(rand(8, 18))->subMinutes(rand(0, 59)),
                ]);

                // Create activity log
                ActivityLog::create([
                    'user_id' => $lead->assigned_to,
                    'action' => 'call_logged',
                    'subject_type' => 'App\\Models\\Lead',
                    'subject_id' => $lead->id,
                    'properties' => json_encode([
                        'outcome' => $outcome,
                        'duration' => $callLog->duration_seconds,
                    ]),
                    'ip_address' => '192.168.1.' . rand(1, 255),
                    'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                ]);

                $totalCallLogs++;
            }
        }

        $this->command->info("✅ Successfully created {$totalCallLogs} call logs!");
    }

    private function getOutcomeForStatus($status, $callIndex, $totalCalls)
    {
        // Last call determines the final status
        if ($callIndex === $totalCalls - 1) {
            switch ($status) {
                case 'called':
                    return ['connected', 'not_connected'][array_rand(['connected', 'not_connected'])];
                case 'interested':
                    return 'interested';
                case 'follow_up':
                    return 'follow_up_scheduled';
                case 'converted':
                    return 'converted';
                case 'not_interested':
                    return 'no_interest';
                default:
                    return 'connected';
            }
        }

        // Earlier calls can be varied
        return ['connected', 'not_connected', 'interested'][array_rand(['connected', 'not_connected', 'interested'])];
    }
}
