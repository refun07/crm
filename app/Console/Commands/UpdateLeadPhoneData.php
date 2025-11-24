<?php

namespace App\Console\Commands;

use App\Models\Lead;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;

class UpdateLeadPhoneData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'leads:update-phone-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update phone_last_4 for existing leads';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating lead phone data...');

        $leads = Lead::whereNull('phone_last_4')
            ->orWhereNull('phone_first_4')
            ->orWhere('phone_last_4', '')
            ->orWhere('phone_first_4', '')
            ->get();

        $count = 0;
        foreach ($leads as $lead) {
            try {
                $encrypted = $lead->getRawOriginal('phone_encrypted');

                if ($encrypted) {
                    try {
                        $phone = Crypt::decryptString($encrypted);

                        // Update last 4 digits
                        $lead->phone_last_4 = substr($phone, -4);

                        // Update first 4 digits (excluding country code)
                        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
                        // If starts with 880, skip it (Bangladesh country code)
                        if (substr($cleanPhone, 0, 3) === '880') {
                            $cleanPhone = substr($cleanPhone, 3);
                        }
                        $lead->phone_first_4 = substr($cleanPhone, 0, 4);

                        // Save directly to avoid triggering the mutator
                        $lead->timestamps = false;
                        $lead->save();
                        $lead->timestamps = true;

                        $count++;
                    } catch (\Exception $e) {
                        $this->error("Could not decrypt phone for lead ID: {$lead->id}");
                    }
                }
            } catch (\Exception $e) {
                $this->error("Error processing lead ID: {$lead->id} - " . $e->getMessage());
            }
        }

        $this->info("Updated {$count} leads.");
    }
}
