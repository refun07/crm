<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadAssignment;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeadController extends Controller
{
    /**
     * Display a listing of assigned leads for the authenticated agent
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Lead::with(['assignedAgent', 'callLogs', 'followUps']);

        // If user is agent, only show assigned leads
        if (!$user->hasAnyRole(['super_admin', 'manager'])) {
            $query->where('assigned_to', $user->id);
        }

        // Search Filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%") // For unencrypted legacy data
                    ->orWhere('phone_last_4', 'like', "%{$search}%") // Matches if user types "5176"
                    ->orWhere('phone_first_4', 'like', "%{$search}%"); // Matches if user types "0192"

                // If search looks like a phone number, match the last 4 digits AND first 4 digits
                // This allows searching by full number "01921805176" -> matches "5176" or "0192"
                $cleanPhone = preg_replace('/[^0-9]/', '', $search);
                if (strlen($cleanPhone) >= 4) {
                    $last4 = substr($cleanPhone, -4);
                    $first4 = substr($cleanPhone, 0, 4);
                    $q->orWhere('phone_last_4', 'like', "%{$last4}%")
                        ->orWhere('phone_first_4', 'like', "%{$first4}%");
                }
            });
        }

        // Status Filter
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        // Date Range Filter (Optional, based on 'Today' dropdown in UI)
        if ($request->filled('date_range')) {
            $range = $request->input('date_range');
            if ($range === 'today') {
                $query->whereDate('created_at', today());
            } elseif ($range === 'yesterday') {
                $query->whereDate('created_at', today()->subDay());
            } elseif ($range === 'this_week') {
                $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
            } elseif ($range === 'this_month') {
                $query->whereMonth('created_at', now()->month);
            }
        }

        if ($request->has('quality_tag')) {
            $query->where('quality_tag', $request->quality_tag);
        }

        $leads = $query->latest()
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Leads/Index', [
            'leads' => $leads,
            'filters' => $request->only(['search', 'status', 'date_range', 'quality_tag']),
        ]);
    }

    /**
     * Display the specified lead
     */
    public function show(Lead $lead)
    {
        // Check if user has access to this lead
        if ($lead->assigned_to !== auth()->id() && !auth()->user()->hasRole(['super_admin', 'manager'])) {
            abort(403, 'Unauthorized access to this lead');
        }

        $lead->load(['assignedAgent', 'callLogs.agent', 'followUps', 'order']);

        return Inertia::render('Leads/Show', [
            'lead' => $lead,
        ]);
    }

    /**
     * Update the specified lead
     */
    public function update(Request $request, Lead $lead)
    {
        // Check if user has access to this lead
        if ($lead->assigned_to !== auth()->id() && !auth()->user()->hasRole(['super_admin', 'manager'])) {
            abort(403, 'Unauthorized access to this lead');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|nullable',
            'phone' => 'sometimes|string|nullable',
            'status' => 'sometimes|in:new,assigned,called,interested,follow_up,converted,invalid,not_interested',
            'quality_tag' => 'sometimes|in:good,medium,poor',
            'notes' => 'sometimes|string|nullable',
            'source' => 'sometimes|string|nullable',
        ]);

        $oldData = $lead->toArray();
        $lead->update($validated);

        // Log the activity
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'lead.updated',
            'subject_type' => Lead::class,
            'subject_id' => $lead->id,
            'properties' => [
                'old' => $oldData,
                'new' => $lead->fresh()->toArray(),
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Lead updated successfully');
    }

    /**
     * Get today's assigned leads for the agent
     */
    public function todaysLeads(Request $request)
    {
        $user = $request->user();
        $today = now()->toDateString();

        $assignments = LeadAssignment::with('lead')
            ->where('user_id', $user->id)
            ->whereDate('assigned_date', $today)
            ->where('status', '!=', 'recycled')
            ->get();

        return response()->json([
            'assignments' => $assignments,
            'total' => $assignments->count(),
        ]);
    }

    /**
     * Lock a lead after first call
     */
    public function lockLead(Lead $lead)
    {
        if ($lead->assigned_to !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $lead->update([
            'is_locked' => true,
            'last_called_at' => now(),
            'call_count' => $lead->call_count + 1,
        ]);

        return response()->json(['message' => 'Lead locked successfully']);
    }
}
