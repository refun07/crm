<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Lead;
use App\Models\Order;
use App\Models\Commission;
use App\Models\CommissionRule;
use App\Models\ActivityLog;
use Carbon\Carbon;

class OrderSeeder extends Seeder
{
    private $products = [
        ['name' => 'Premium Dress', 'price_range' => [89.99, 149.99]],
        ['name' => 'Designer Handbag', 'price_range' => [129.99, 299.99]],
        ['name' => 'Luxury Shoes', 'price_range' => [79.99, 199.99]],
        ['name' => 'Elegant Scarf', 'price_range' => [39.99, 89.99]],
        ['name' => 'Fashion Jewelry', 'price_range' => [49.99, 149.99]],
        ['name' => 'Designer Sunglasses', 'price_range' => [99.99, 249.99]],
        ['name' => 'Leather Jacket', 'price_range' => [199.99, 399.99]],
        ['name' => 'Silk Blouse', 'price_range' => [69.99, 129.99]],
    ];

    private $paymentMethods = ['cash', 'card', 'bank_transfer', 'mobile_payment'];
    private $offers = ['SUMMER25', 'WELCOME10', 'VIP15', null, null]; // Some orders without offers

    public function run(): void
    {
        // Get converted leads
        $convertedLeads = Lead::where('status', 'converted')
            ->whereNotNull('assigned_to')
            ->get();

        $this->command->info("Creating orders for {$convertedLeads->count()} converted leads...");

        // Get default commission rule
        $commissionRule = CommissionRule::where('is_default', true)->first();

        if (!$commissionRule) {
            $this->command->warn('No default commission rule found. Creating one...');
            $commissionRule = CommissionRule::create([
                'name' => 'Default Commission',
                'type' => 'fixed',
                'fixed_amount' => 100.00,
                'is_active' => true,
                'is_default' => true,
            ]);
        }

        $totalOrders = 0;
        $totalRevenue = 0;

        foreach ($convertedLeads as $lead) {
            // Create 1-2 orders per converted lead
            $orderCount = rand(1, 2);

            for ($i = 0; $i < $orderCount; $i++) {
                // Generate products for this order
                $orderProducts = [];
                $productCount = rand(1, 4);
                $totalAmount = 0;

                for ($p = 0; $p < $productCount; $p++) {
                    $product = $this->products[array_rand($this->products)];
                    $quantity = rand(1, 3);
                    $price = round(rand($product['price_range'][0] * 100, $product['price_range'][1] * 100) / 100, 2);

                    $orderProducts[] = [
                        'name' => $product['name'],
                        'quantity' => $quantity,
                        'price' => $price,
                        'subtotal' => $quantity * $price,
                    ];

                    $totalAmount += $quantity * $price;
                }

                $order = Order::create([
                    'order_number' => 'ORD-' . date('Ymd') . '-' . str_pad($totalOrders + 1, 4, '0', STR_PAD_LEFT),
                    'lead_id' => $lead->id,
                    'user_id' => $lead->assigned_to,
                    'products' => $orderProducts,
                    'total_amount' => $totalAmount,
                    'customer_address' => implode(', ', array_filter([
                        $lead->address,
                        $lead->city,
                        $lead->state,
                        $lead->zip_code
                    ])),
                    'payment_method' => $this->paymentMethods[array_rand($this->paymentMethods)],
                    'offer_applied' => $this->offers[array_rand($this->offers)],
                    'notes' => rand(0, 1) ? 'Customer requested ' . ['express shipping', 'gift wrapping', 'special packaging', 'delivery on weekend'][array_rand(['express shipping', 'gift wrapping', 'special packaging', 'delivery on weekend'])] : null,
                    'synced_to_main_site' => (bool) rand(0, 1),
                    'synced_at' => rand(0, 1) ? now()->subDays(rand(0, 5)) : null,
                    'sync_response' => null,
                    'created_at' => now()->subDays(rand(0, 30)),
                ]);

                // Calculate commission
                $commissionAmount = $commissionRule->calculateCommission($totalAmount);

                Commission::create([
                    'user_id' => $lead->assigned_to,
                    'order_id' => $order->id,
                    'order_amount' => $totalAmount,
                    'commission_amount' => $commissionAmount,
                    'calculation_type' => $commissionRule->type,
                    'rate_value' => $commissionRule->type === 'fixed' ? $commissionRule->fixed_amount : $commissionRule->percentage_value,
                    'month_year' => $order->created_at->format('Y-m'),
                    'status' => ['pending', 'approved', 'paid'][array_rand(['pending', 'approved', 'paid'])],
                    'paid_at' => rand(0, 1) ? now()->subDays(rand(0, 15)) : null,
                ]);

                // Create activity log
                ActivityLog::create([
                    'user_id' => $lead->assigned_to,
                    'action' => 'order_created',
                    'subject_type' => 'App\\Models\\Order',
                    'subject_id' => $order->id,
                    'properties' => json_encode([
                        'order_number' => $order->order_number,
                        'total_amount' => $totalAmount,
                        'commission' => $commissionAmount,
                    ]),
                    'ip_address' => '192.168.1.' . rand(1, 255),
                    'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                ]);

                $totalOrders++;
                $totalRevenue += $totalAmount;
            }
        }

        $this->command->info("✅ Successfully created {$totalOrders} orders!");
        $this->command->info("💰 Total Revenue: $" . number_format($totalRevenue, 2));
        $this->command->info("📦 Average Order Value: $" . number_format($totalRevenue / $totalOrders, 2));
    }
}
