<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CallLog extends Model
{
    protected $fillable = [
        'lead_id',
        'user_id',
        'outcome',
        'notes',
        'duration_seconds',
        'called_at',
    ];

    protected $casts = [
        'called_at' => 'datetime',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
