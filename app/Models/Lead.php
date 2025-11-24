<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Crypt;

class Lead extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'phone_encrypted',
        'phone_last_4',
        'address',
        'city',
        'state',
        'zip_code',
        'source',
        'status',
        'quality_tag',
        'notes',
        'assigned_to',
        'batch_id',
        'is_locked',
        'last_called_at',
        'call_count',
    ];

    protected $casts = [
        'is_locked' => 'boolean',
        'last_called_at' => 'datetime',
    ];

    protected $appends = ['phone'];

    // Encrypt phone number when setting
    public function setPhoneAttribute($value)
    {
        if ($value) {
            $this->attributes['phone_encrypted'] = Crypt::encryptString($value);
            $this->attributes['phone_last_4'] = substr($value, -4);
            // Store first 4 digits (excluding country code if present)
            // Assuming country code is +880 or 880, we skip it
            $cleanPhone = preg_replace('/[^0-9]/', '', $value);
            // If starts with 880, skip it (Bangladesh country code)
            if (substr($cleanPhone, 0, 3) === '880') {
                $cleanPhone = substr($cleanPhone, 3);
            }
            $this->attributes['phone_first_4'] = substr($cleanPhone, 0, 4);
        } else {
            $this->attributes['phone_encrypted'] = null;
            $this->attributes['phone_last_4'] = null;
            $this->attributes['phone_first_4'] = null;
        }
    }

    // Decrypt phone number when getting
    public function getPhoneAttribute()
    {
        if (isset($this->attributes['phone_encrypted'])) {
            try {
                return Crypt::decryptString($this->attributes['phone_encrypted']);
            } catch (\Exception $e) {
                return null;
            }
        }
        return null;
    }

    public function assignedAgent()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function batch()
    {
        return $this->belongsTo(ImportBatch::class, 'batch_id');
    }

    public function assignments()
    {
        return $this->hasMany(LeadAssignment::class);
    }

    public function callLogs()
    {
        return $this->hasMany(CallLog::class);
    }

    public function followUps()
    {
        return $this->hasMany(FollowUp::class);
    }

    public function order()
    {
        return $this->hasOne(Order::class);
    }

    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'subject');
    }
}
