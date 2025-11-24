<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommissionRule extends Model
{
    protected $fillable = [
        'name',
        'type',
        'fixed_amount',
        'percentage_value',
        'min_order_value',
        'max_order_value',
        'is_active',
        'is_default',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    public function calculateCommission($orderAmount)
    {
        switch ($this->type) {
            case 'fixed':
                return $this->fixed_amount;
            case 'percentage':
                return ($orderAmount * $this->percentage_value) / 100;
            case 'hybrid':
                return $this->fixed_amount + (($orderAmount * $this->percentage_value) / 100);
            default:
                return 0;
        }
    }
}
