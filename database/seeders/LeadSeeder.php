<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Lead;
use App\Models\User;
use App\Models\ImportBatch;
use Illuminate\Support\Facades\Crypt;
use Carbon\Carbon;

class LeadSeeder extends Seeder
{
    private $firstNames = [
        'Sarah',
        'Jessica',
        'Emily',
        'Ashley',
        'Amanda',
        'Jennifer',
        'Michelle',
        'Lisa',
        'Karen',
        'Nancy',
        'Michael',
        'David',
        'James',
        'Robert',
        'John',
        'William',
        'Richard',
        'Thomas',
        'Christopher',
        'Daniel',
        'Maria',
        'Patricia',
        'Linda',
        'Barbara',
        'Elizabeth',
        'Susan',
        'Margaret',
        'Dorothy',
        'Betty',
        'Helen'
    ];

    private $lastNames = [
        'Smith',
        'Johnson',
        'Williams',
        'Brown',
        'Jones',
        'Garcia',
        'Miller',
        'Davis',
        'Rodriguez',
        'Martinez',
        'Hernandez',
        'Lopez',
        'Gonzalez',
        'Wilson',
        'Anderson',
        'Thomas',
        'Taylor',
        'Moore',
        'Jackson',
        'Martin',
        'Lee',
        'Perez',
        'Thompson',
        'White',
        'Harris',
        'Sanchez',
        'Clark',
        'Ramirez',
        'Lewis',
        'Robinson'
    ];

    private $cities = [
        ['city' => 'New York', 'state' => 'NY', 'zip' => '10001'],
        ['city' => 'Los Angeles', 'state' => 'CA', 'zip' => '90001'],
        ['city' => 'Chicago', 'state' => 'IL', 'zip' => '60601'],
        ['city' => 'Houston', 'state' => 'TX', 'zip' => '77001'],
        ['city' => 'Phoenix', 'state' => 'AZ', 'zip' => '85001'],
        ['city' => 'Philadelphia', 'state' => 'PA', 'zip' => '19101'],
        ['city' => 'San Antonio', 'state' => 'TX', 'zip' => '78201'],
        ['city' => 'San Diego', 'state' => 'CA', 'zip' => '92101'],
        ['city' => 'Dallas', 'state' => 'TX', 'zip' => '75201'],
        ['city' => 'San Jose', 'state' => 'CA', 'zip' => '95101'],
    ];

    private $sources = ['Website', 'Facebook', 'Instagram', 'Google Ads', 'Referral', 'Walk-in', 'Phone Inquiry', 'Email Campaign'];
    private $statuses = ['new', 'assigned', 'called', 'interested', 'follow_up', 'not_interested', 'invalid', 'converted'];
    private $qualityTags = ['good', 'medium', 'poor', null];

    public function run(): void
    {
        // Get agents
        $agents = User::role('agent')->get();

        if ($agents->isEmpty()) {
            $this->command->error('No agents found. Please run RolePermissionSeeder first.');
            return;
        }

        // Create an import batch
        $batch = ImportBatch::create([
            'batch_number' => 'BATCH-' . date('Ymd') . '-001',
            'uploaded_by' => User::role('super_admin')->first()->id,
            'file_name' => 'sample_leads_' . date('Ymd') . '.xlsx',
            'file_path' => 'imports/sample_leads_' . date('Ymd') . '.xlsx',
            'total_rows' => 100,
            'successful_rows' => 95,
            'failed_rows' => 3,
            'duplicate_rows' => 2,
            'status' => 'completed',
            'started_at' => now()->subHours(2),
            'completed_at' => now()->subHours(1),
        ]);

        $this->command->info('Creating 100 leads...');

        // Create 100 leads with varied data
        for ($i = 1; $i <= 100; $i++) {
            $firstName = $this->firstNames[array_rand($this->firstNames)];
            $lastName = $this->lastNames[array_rand($this->lastNames)];
            $name = $firstName . ' ' . $lastName;
            $email = strtolower($firstName . '.' . $lastName . rand(1, 999) . '@example.com');
            $phone = '1' . rand(200, 999) . rand(100, 999) . rand(1000, 9999);
            $location = $this->cities[array_rand($this->cities)];

            // Determine status based on distribution
            $statusRand = rand(1, 100);
            if ($statusRand <= 20) {
                $status = 'new';
                $assignedTo = null;
            } elseif ($statusRand <= 50) {
                $status = 'assigned';
                $assignedTo = $agents->random()->id;
            } elseif ($statusRand <= 65) {
                $status = 'called';
                $assignedTo = $agents->random()->id;
            } elseif ($statusRand <= 75) {
                $status = 'interested';
                $assignedTo = $agents->random()->id;
            } elseif ($statusRand <= 85) {
                $status = 'follow_up';
                $assignedTo = $agents->random()->id;
            } elseif ($statusRand <= 92) {
                $status = 'converted';
                $assignedTo = $agents->random()->id;
            } elseif ($statusRand <= 97) {
                $status = 'not_interested';
                $assignedTo = $agents->random()->id;
            } else {
                $status = 'invalid';
                $assignedTo = $agents->random()->id;
            }

            $lead = Lead::create([
                'name' => $name,
                'email' => $email,
                'phone_encrypted' => Crypt::encryptString($phone),
                'phone_last_4' => substr($phone, -4),
                'address' => rand(100, 9999) . ' ' . ['Main St', 'Oak Ave', 'Maple Dr', 'Park Blvd', 'Cedar Ln'][array_rand(['Main St', 'Oak Ave', 'Maple Dr', 'Park Blvd', 'Cedar Ln'])],
                'city' => $location['city'],
                'state' => $location['state'],
                'zip_code' => $location['zip'],
                'source' => $this->sources[array_rand($this->sources)],
                'status' => $status,
                'quality_tag' => $this->qualityTags[array_rand($this->qualityTags)],
                'notes' => rand(0, 1) ? 'Interested in ' . ['summer collection', 'winter sale', 'new arrivals', 'premium products'][array_rand(['summer collection', 'winter sale', 'new arrivals', 'premium products'])] : null,
                'assigned_to' => $assignedTo,
                'batch_id' => $batch->id,
                'is_locked' => $status !== 'new' && $status !== 'assigned' ? (bool) rand(0, 1) : false,
                'call_count' => $status === 'new' ? 0 : rand(0, 5),
                'last_called_at' => $status !== 'new' ? now()->subDays(rand(0, 7))->subHours(rand(0, 23)) : null,
                'created_at' => now()->subDays(rand(0, 30)),
            ]);

            // Create lead assignment for assigned leads
            if ($assignedTo) {
                $lead->assignments()->create([
                    'user_id' => $assignedTo,
                    'assigned_date' => now()->subDays(rand(0, 7))->format('Y-m-d'),
                    'status' => in_array($status, ['converted', 'not_interested', 'invalid']) ? 'completed' : 'working',
                    'is_auto_assigned' => (bool) rand(0, 1),
                    'assigned_by' => User::role('super_admin')->first()->id,
                    'completed_at' => in_array($status, ['converted', 'not_interested', 'invalid']) ? now()->subDays(rand(0, 3)) : null,
                ]);
            }

            if ($i % 20 == 0) {
                $this->command->info("Created {$i} leads...");
            }
        }

        $this->command->info('✅ Successfully created 100 leads with varied statuses!');
        $this->command->info('📊 Distribution:');
        $this->command->info('   - New: ~20 leads');
        $this->command->info('   - Assigned: ~30 leads');
        $this->command->info('   - Called: ~15 leads');
        $this->command->info('   - Interested: ~10 leads');
        $this->command->info('   - Follow-up: ~10 leads');
        $this->command->info('   - Converted: ~7 leads');
        $this->command->info('   - Not Interested: ~5 leads');
        $this->command->info('   - Invalid: ~3 leads');
    }
}
