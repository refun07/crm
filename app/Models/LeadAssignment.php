<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadAssignment extends Model
{
    protected $fillable = [
        'lead_id',
        'user_id',
        'assigned_date',
        'status',
        'is_auto_assigned',
        'assigned_by',
        'completed_at',
    ];

    protected $casts = [
        'assigned_date' => 'date',
        'is_auto_assigned' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
