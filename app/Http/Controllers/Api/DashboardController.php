<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\CallLog;
use App\Models\Order;
use App\Models\Commission;
use App\Models\FollowUp;
use App\Models\LeadAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get agent dashboard data
     */
    public function agentDashboard(Request $request)
    {
        $user = $request->user();
        $today = now()->toDateString();
        $currentMonth = now()->format('Y-m');

        // Today's assigned leads
        $todaysAssignments = LeadAssignment::where('user_id', $user->id)
            ->whereDate('assigned_date', $today)
            ->where('status', '!=', 'recycled')
            ->count();

        // Total calls completed today
        $todaysCalls = CallLog::where('user_id', $user->id)
            ->whereDate('called_at', $today)
            ->count();

        // Follow-up reminders for today
        $todaysFollowUps = FollowUp::where('user_id', $user->id)
            ->whereDate('scheduled_at', $today)
            ->where('status', 'pending')
            ->count();

        // Overdue follow-ups
        $overdueFollowUps = FollowUp::where('user_id', $user->id)
            ->where('scheduled_at', '<', now())
            ->where('status', 'pending')
            ->count();

        // Converted orders this month
        $monthlyOrders = Order::where('user_id', $user->id)
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();

        // Monthly commission
        $monthlyCommission = Commission::where('user_id', $user->id)
            ->where('month_year', $currentMonth)
            ->sum('commission_amount');

        // Estimated commission (pending)
        $pendingCommission = Commission::where('user_id', $user->id)
            ->where('month_year', $currentMonth)
            ->where('status', 'pending')
            ->sum('commission_amount');

        // Leaderboard ranking (by monthly conversions)
        $leaderboard = User::withCount([
            'orders' => function ($query) {
                $query->whereYear('created_at', now()->year)
                    ->whereMonth('created_at', now()->month);
            }
        ])
            ->orderBy('orders_count', 'desc')
            ->take(10)
            ->get();

        $userRank = $leaderboard->search(function ($item) use ($user) {
            return $item->id === $user->id;
        });

        // Recent activity
        $recentLeads = Lead::where('assigned_to', $user->id)
            ->with([
                'callLogs' => function ($query) {
                    $query->latest()->limit(1);
                }
            ])
            ->latest('updated_at')
            ->limit(10)
            ->get();

        return response()->json([
            'stats' => [
                'todays_assignments' => $todaysAssignments,
                'todays_calls' => $todaysCalls,
                'todays_follow_ups' => $todaysFollowUps,
                'overdue_follow_ups' => $overdueFollowUps,
                'monthly_orders' => $monthlyOrders,
                'monthly_commission' => $monthlyCommission,
                'pending_commission' => $pendingCommission,
            ],
            'leaderboard' => $leaderboard,
            'user_rank' => $userRank !== false ? $userRank + 1 : null,
            'recent_leads' => $recentLeads,
        ]);
    }

    /**
     * Get admin dashboard data
     */
    public function adminDashboard(Request $request)
    {
        $today = now()->toDateString();
        $currentMonth = now()->format('Y-m');

        // Total leads
        $totalLeads = Lead::count();
        $newLeads = Lead::where('status', 'new')->count();
        $assignedLeads = Lead::where('status', 'assigned')->count();
        $convertedLeads = Lead::where('status', 'converted')->count();

        // Today's stats
        $todaysAssignments = LeadAssignment::whereDate('assigned_date', $today)->count();
        $todaysCalls = CallLog::whereDate('called_at', $today)->count();
        $todaysConversions = Order::whereDate('created_at', $today)->count();

        // Monthly stats
        $monthlyConversions = Order::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();

        $monthlyRevenue = Order::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->sum('total_amount');

        // Conversion rate
        $totalCalls = CallLog::count();
        $conversionRate = $totalCalls > 0 ? ($convertedLeads / $totalCalls) * 100 : 0;

        // Agent performance
        $agentPerformance = User::withCount([
            'orders' => function ($query) use ($currentMonth) {
                $query->where('created_at', '>=', now()->startOfMonth());
            },
            'callLogs' => function ($query) use ($today) {
                $query->whereDate('called_at', $today);
            }
        ])
            ->orderBy('orders_count', 'desc')
            ->limit(10)
            ->get();

        // Lead distribution by status
        $leadsByStatus = Lead::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // Daily call volume (last 7 days)
        $dailyCallVolume = CallLog::select(
            DB::raw('DATE(called_at) as date'),
            DB::raw('count(*) as count')
        )
            ->where('called_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'stats' => [
                'total_leads' => $totalLeads,
                'new_leads' => $newLeads,
                'assigned_leads' => $assignedLeads,
                'converted_leads' => $convertedLeads,
                'todays_assignments' => $todaysAssignments,
                'todays_calls' => $todaysCalls,
                'todays_conversions' => $todaysConversions,
                'monthly_conversions' => $monthlyConversions,
                'monthly_revenue' => $monthlyRevenue,
                'conversion_rate' => round($conversionRate, 2),
            ],
            'agent_performance' => $agentPerformance,
            'leads_by_status' => $leadsByStatus,
            'daily_call_volume' => $dailyCallVolume,
        ]);
    }
}
