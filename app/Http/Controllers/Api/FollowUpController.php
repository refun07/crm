<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FollowUp;
use App\Models\Lead;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class FollowUpController extends Controller
{
    /**
     * Get follow-ups for the authenticated user
     */
    public function index(Request $request)
    {
        $query = FollowUp::with(['lead', 'agent', 'creator'])
            ->where('user_id', auth()->id());

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        // Get today's follow-ups
        if ($request->has('today')) {
            $query->whereDate('scheduled_at', now()->toDateString());
        }

        // Get overdue follow-ups
        if ($request->has('overdue')) {
            $query->where('scheduled_at', '<', now())
                ->where('status', 'pending');
        }

        $followUps = $query->orderBy('scheduled_at')->paginate(50);

        return response()->json(['follow_ups' => $followUps]);
    }

    /**
     * Create a new follow-up
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'scheduled_at' => 'required|date|after:now',
            'priority' => 'required|in:low,medium,high,hot',
            'notes' => 'nullable|string',
        ]);

        $lead = Lead::findOrFail($validated['lead_id']);

        // Check access
        if ($lead->assigned_to !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $followUp = FollowUp::create([
            'lead_id' => $validated['lead_id'],
            'user_id' => auth()->id(),
            'created_by' => auth()->id(),
            'scheduled_at' => $validated['scheduled_at'],
            'priority' => $validated['priority'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        // Update lead status
        $lead->update(['status' => 'follow_up']);

        // Log activity
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'follow_up.created',
            'subject_type' => FollowUp::class,
            'subject_id' => $followUp->id,
            'properties' => [
                'lead_id' => $lead->id,
                'scheduled_at' => $validated['scheduled_at'],
                'priority' => $validated['priority'],
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Follow-up scheduled successfully',
            'follow_up' => $followUp->load('lead'),
        ], 201);
    }

    /**
     * Claim a follow-up
     */
    public function claim(FollowUp $followUp)
    {
        if ($followUp->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($followUp->status !== 'pending') {
            return response()->json(['message' => 'Follow-up already claimed or completed'], 400);
        }

        $followUp->update([
            'status' => 'claimed',
            'claimed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Follow-up claimed successfully',
            'follow_up' => $followUp,
        ]);
    }

    /**
     * Complete a follow-up
     */
    public function complete(Request $request, FollowUp $followUp)
    {
        if ($followUp->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'outcome_notes' => 'required|string',
        ]);

        $followUp->update([
            'status' => 'completed',
            'completed_at' => now(),
            'outcome_notes' => $validated['outcome_notes'],
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'follow_up.completed',
            'subject_type' => FollowUp::class,
            'subject_id' => $followUp->id,
            'properties' => [
                'outcome_notes' => $validated['outcome_notes'],
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Follow-up completed successfully',
            'follow_up' => $followUp,
        ]);
    }
}
