<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FollowUp extends Model
{
    protected $fillable = [
        'lead_id',
        'user_id',
        'created_by',
        'scheduled_at',
        'priority',
        'notes',
        'status',
        'claimed_at',
        'completed_at',
        'outcome_notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'claimed_at' => 'datetime',
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

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
