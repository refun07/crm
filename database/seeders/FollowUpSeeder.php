<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Lead;
use App\Models\FollowUp;
use Carbon\Carbon;

class FollowUpSeeder extends Seeder
{
    private $priorities = ['low', 'medium', 'high', 'hot'];
    private $statuses = ['pending', 'claimed', 'completed'];

    public function run(): void
    {
        // Get leads that need follow-ups
        $leads = Lead::whereIn('status', ['interested', 'follow_up'])
            ->whereNotNull('assigned_to')
            ->get();

        $this->command->info("Creating follow-ups for {$leads->count()} leads...");

        $totalFollowUps = 0;

        foreach ($leads as $lead) {
            // Create 1-3 follow-ups per lead
            $followUpCount = rand(1, 3);

            for ($i = 0; $i < $followUpCount; $i++) {
                $status = $this->statuses[array_rand($this->statuses)];
                $priority = $this->priorities[array_rand($this->priorities)];

                // Determine scheduling
                $daysAhead = rand(-2, 7); // Some overdue, some upcoming
                $scheduledAt = now()->addDays($daysAhead)->setHour(rand(9, 17))->setMinute([0, 15, 30, 45][array_rand([0, 15, 30, 45])]);

                $followUp = FollowUp::create([
                    'lead_id' => $lead->id,
                    'user_id' => $lead->assigned_to,
                    'created_by' => $lead->assigned_to,
                    'scheduled_at' => $scheduledAt,
                    'priority' => $priority,
                    'notes' => $this->getFollowUpNote($priority),
                    'status' => $status,
                    'claimed_at' => in_array($status, ['claimed', 'completed']) ? $scheduledAt->copy()->subMinutes(rand(5, 30)) : null,
                    'completed_at' => $status === 'completed' ? $scheduledAt->copy()->addMinutes(rand(10, 60)) : null,
                    'outcome_notes' => $status === 'completed' ? $this->getOutcomeNote() : null,
                ]);

                $totalFollowUps++;
            }
        }

        $this->command->info("✅ Successfully created {$totalFollowUps} follow-ups!");
        $this->command->info("📅 Some are overdue, some are upcoming, and some are completed.");
    }

    private function getFollowUpNote($priority)
    {
        $notes = [
            'hot' => [
                'Very interested! Call ASAP',
                'Ready to buy, just needs final details',
                'Hot lead - wants to order today',
                'Urgent: Customer waiting for callback',
            ],
            'high' => [
                'Interested in premium collection',
                'Wants to discuss bulk order',
                'Asked for manager callback',
                'Needs pricing for custom order',
            ],
            'medium' => [
                'Follow up on product inquiry',
                'Wants to compare options',
                'Requested more information',
                'General interest, needs nurturing',
            ],
            'low' => [
                'Just browsing, check back later',
                'Might be interested in future',
                'Low priority follow-up',
                'Casual inquiry',
            ],
        ];

        return $notes[$priority][array_rand($notes[$priority])];
    }

    private function getOutcomeNote()
    {
        $outcomes = [
            'Successfully contacted, moving to order',
            'Rescheduled for next week',
            'Still interested, will call back',
            'Converted to order!',
            'Not ready yet, follow up next month',
            'Customer busy, left voicemail',
        ];

        return $outcomes[array_rand($outcomes)];
    }
}
