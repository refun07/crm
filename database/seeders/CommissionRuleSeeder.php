<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CommissionRule;

class CommissionRuleSeeder extends Seeder
{
    public function run(): void
    {
        // Default fixed commission
        CommissionRule::create([
            'name' => 'Default Fixed Commission',
            'type' => 'fixed',
            'fixed_amount' => 100.00,
            'percentage_value' => null,
            'min_order_value' => null,
            'max_order_value' => null,
            'is_active' => true,
            'is_default' => true,
        ]);

        // Percentage-based commission
        CommissionRule::create([
            'name' => '5% Commission',
            'type' => 'percentage',
            'fixed_amount' => null,
            'percentage_value' => 5.00,
            'min_order_value' => null,
            'max_order_value' => null,
            'is_active' => false,
            'is_default' => false,
        ]);

        // Hybrid commission
        CommissionRule::create([
            'name' => 'Hybrid Commission (50 + 3%)',
            'type' => 'hybrid',
            'fixed_amount' => 50.00,
            'percentage_value' => 3.00,
            'min_order_value' => null,
            'max_order_value' => null,
            'is_active' => false,
            'is_default' => false,
        ]);

        // Tiered commission for high-value orders
        CommissionRule::create([
            'name' => 'High Value Orders (10%)',
            'type' => 'percentage',
            'fixed_amount' => null,
            'percentage_value' => 10.00,
            'min_order_value' => 10000.00,
            'max_order_value' => null,
            'is_active' => false,
            'is_default' => false,
        ]);

        $this->command->info('Commission rules seeded successfully!');
    }
}
