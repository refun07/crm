<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Lead;
use App\Models\Commission;
use App\Models\CommissionRule;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Convert a lead to an order
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'products' => 'required|array',
            'products.*.name' => 'required|string',
            'products.*.quantity' => 'required|integer|min:1',
            'products.*.price' => 'required|numeric|min:0',
            'customer_address' => 'required|string',
            'payment_method' => 'required|string',
            'offer_applied' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $lead = Lead::findOrFail($validated['lead_id']);

        // Check access
        if ($lead->assigned_to !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if lead is already converted
        if ($lead->status === 'converted') {
            return response()->json(['message' => 'Lead already converted'], 400);
        }

        // Calculate total amount
        $totalAmount = collect($validated['products'])->sum(function ($product) {
            return $product['quantity'] * $product['price'];
        });

        // Generate order number
        $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        // Create order
        $order = Order::create([
            'order_number' => $orderNumber,
            'lead_id' => $validated['lead_id'],
            'user_id' => auth()->id(),
            'products' => $validated['products'],
            'total_amount' => $totalAmount,
            'customer_address' => $validated['customer_address'],
            'payment_method' => $validated['payment_method'],
            'offer_applied' => $validated['offer_applied'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Update lead status
        $lead->update(['status' => 'converted']);

        // Calculate and create commission
        $this->createCommission($order);

        // Sync to main site
        $this->syncToMainSite($order);

        // Log activity
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'order.created',
            'subject_type' => Order::class,
            'subject_id' => $order->id,
            'properties' => [
                'order_number' => $orderNumber,
                'total_amount' => $totalAmount,
                'lead_id' => $lead->id,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order->load('lead', 'agent', 'commission'),
        ], 201);
    }

    /**
     * Get orders for the authenticated user
     */
    public function index(Request $request)
    {
        $query = Order::with(['lead', 'commission'])
            ->where('user_id', auth()->id());

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $orders = $query->latest()->paginate(50);

        return response()->json(['orders' => $orders]);
    }

    /**
     * Create commission for an order
     */
    private function createCommission(Order $order)
    {
        // Get active commission rule
        $rule = CommissionRule::where('is_active', true)
            ->where('is_default', true)
            ->first();

        if (!$rule) {
            // Fallback to fixed commission
            $commissionAmount = 100; // Default fixed amount
            $calculationType = 'fixed';
            $rateValue = 100;
        } else {
            $commissionAmount = $rule->calculateCommission($order->total_amount);
            $calculationType = $rule->type;
            $rateValue = $rule->type === 'percentage' ? $rule->percentage_value : $rule->fixed_amount;
        }

        Commission::create([
            'user_id' => $order->user_id,
            'order_id' => $order->id,
            'order_amount' => $order->total_amount,
            'commission_amount' => $commissionAmount,
            'calculation_type' => $calculationType,
            'rate_value' => $rateValue,
            'month_year' => now()->format('Y-m'),
            'status' => 'pending',
        ]);
    }

    /**
     * Sync order to main Klassy Missy website
     */
    private function syncToMainSite(Order $order)
    {
        try {
            $mainSiteUrl = config('services.klassy_missy.api_url');
            $apiKey = config('services.klassy_missy.api_key');

            if (!$mainSiteUrl || !$apiKey) {
                // API not configured, skip sync
                return;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Accept' => 'application/json',
            ])->post($mainSiteUrl . '/api/orders/create', [
                        'order_number' => $order->order_number,
                        'customer_name' => $order->lead->name,
                        'customer_email' => $order->lead->email,
                        'customer_phone' => $order->lead->phone,
                        'customer_address' => $order->customer_address,
                        'products' => $order->products,
                        'total_amount' => $order->total_amount,
                        'payment_method' => $order->payment_method,
                        'offer_applied' => $order->offer_applied,
                        'notes' => $order->notes,
                    ]);

            if ($response->successful()) {
                $order->update([
                    'synced_to_main_site' => true,
                    'synced_at' => now(),
                    'sync_response' => $response->json(),
                ]);
            } else {
                $order->update([
                    'sync_response' => [
                        'error' => $response->body(),
                        'status' => $response->status(),
                    ],
                ]);
            }
        } catch (\Exception $e) {
            $order->update([
                'sync_response' => [
                    'error' => $e->getMessage(),
                ],
            ]);
        }
    }
}
