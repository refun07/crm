<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LeadAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeadAssignmentController extends Controller
{
    /**
     * Auto-distribute leads to agents
     */
    public function autoDistribute(Request $request)
    {
        // Only super admin and managers can distribute
        if (!$request->user()->hasAnyRole(['super_admin', 'manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $today = now()->toDateString();

        // Get active agents
        $agents = User::where('is_active', true)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'agent');
            })
            ->get();

        if ($agents->isEmpty()) {
            return response()->json(['message' => 'No active agents found'], 400);
        }

        // Get unassigned new leads
        $newLeads = Lead::where('status', 'new')
            ->whereNull('assigned_to')
            ->get();

        if ($newLeads->isEmpty()) {
            return response()->json(['message' => 'No new leads to assign'], 400);
        }

        $assignmentsMade = 0;
        $agentIndex = 0;
        $agentCount = $agents->count();

        foreach ($newLeads as $lead) {
            $agent = $agents[$agentIndex % $agentCount];

            // Check if agent has reached daily limit
            $todaysAssignments = LeadAssignment::where('user_id', $agent->id)
                ->whereDate('assigned_date', $today)
                ->where('status', '!=', 'recycled')
                ->count();

            if ($todaysAssignments >= $agent->daily_lead_limit) {
                $agentIndex++;
                continue;
            }

            // Assign lead
            $lead->update([
                'assigned_to' => $agent->id,
                'status' => 'assigned',
            ]);

            // Create assignment record
            LeadAssignment::create([
                'lead_id' => $lead->id,
                'user_id' => $agent->id,
                'assigned_date' => $today,
                'status' => 'pending',
                'is_auto_assigned' => true,
            ]);

            $assignmentsMade++;
            $agentIndex++;
        }

        return response()->json([
            'message' => "Successfully assigned {$assignmentsMade} leads to {$agentCount} agents",
            'assignments_made' => $assignmentsMade,
        ]);
    }

    /**
     * Manually assign leads to a specific agent
     */
    public function manualAssign(Request $request)
    {
        if (!$request->user()->hasAnyRole(['super_admin', 'manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'lead_ids' => 'required|array',
            'lead_ids.*' => 'exists:leads,id',
            'agent_id' => 'required|exists:users,id',
        ]);

        $agent = User::findOrFail($validated['agent_id']);
        $today = now()->toDateString();
        $assignmentsMade = 0;

        foreach ($validated['lead_ids'] as $leadId) {
            $lead = Lead::find($leadId);

            if ($lead && ($lead->status === 'new' || $lead->status === 'assigned')) {
                $lead->update([
                    'assigned_to' => $agent->id,
                    'status' => 'assigned',
                ]);

                LeadAssignment::create([
                    'lead_id' => $lead->id,
                    'user_id' => $agent->id,
                    'assigned_date' => $today,
                    'status' => 'pending',
                    'is_auto_assigned' => false,
                    'assigned_by' => auth()->id(),
                ]);

                $assignmentsMade++;
            }
        }

        return response()->json([
            'message' => "Successfully assigned {$assignmentsMade} leads to {$agent->name}",
            'assignments_made' => $assignmentsMade,
        ]);
    }

    /**
     * Recycle unworked leads
     */
    public function recycleLeads(Request $request)
    {
        if (!$request->user()->hasAnyRole(['super_admin', 'manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $today = now()->toDateString();

        // Find assignments that are still pending (not worked on)
        $pendingAssignments = LeadAssignment::with('lead')
            ->whereDate('assigned_date', '<', $today)
            ->where('status', 'pending')
            ->get();

        $recycledCount = 0;

        foreach ($pendingAssignments as $assignment) {
            // Mark assignment as recycled
            $assignment->update(['status' => 'recycled']);

            // Reset lead to new status
            if ($assignment->lead) {
                $assignment->lead->update([
                    'assigned_to' => null,
                    'status' => 'new',
                ]);
                $recycledCount++;
            }
        }

        return response()->json([
            'message' => "Recycled {$recycledCount} unworked leads back to pool",
            'recycled_count' => $recycledCount,
        ]);
    }

    /**
     * Get assignment statistics
     */
    public function stats(Request $request)
    {
        $today = now()->toDateString();

        $stats = [
            'total_leads' => Lead::count(),
            'unassigned_leads' => Lead::where('status', 'new')->whereNull('assigned_to')->count(),
            'assigned_today' => LeadAssignment::whereDate('assigned_date', $today)->count(),
            'agents_active' => User::where('is_active', true)
                ->whereHas('roles', function ($query) {
                    $query->where('name', 'agent');
                })
                ->count(),
        ];

        // Agent-wise assignment breakdown
        $agentBreakdown = User::withCount([
            'leadAssignments' => function ($query) use ($today) {
                $query->whereDate('assigned_date', $today)
                    ->where('status', '!=', 'recycled');
            }
        ])
            ->where('is_active', true)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'agent');
            })
            ->get();

        return response()->json([
            'stats' => $stats,
            'agent_breakdown' => $agentBreakdown,
        ]);
    }
}
