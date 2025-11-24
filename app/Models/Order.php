<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'lead_id',
        'user_id',
        'products',
        'total_amount',
        'customer_address',
        'payment_method',
        'offer_applied',
        'notes',
        'synced_to_main_site',
        'synced_at',
        'sync_response',
    ];

    protected $casts = [
        'products' => 'array',
        'synced_to_main_site' => 'boolean',
        'synced_at' => 'datetime',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function commission()
    {
        return $this->hasOne(Commission::class);
    }
}
