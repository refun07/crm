<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImportBatch extends Model
{
    protected $fillable = [
        'batch_number',
        'uploaded_by',
        'file_name',
        'file_path',
        'total_rows',
        'successful_rows',
        'failed_rows',
        'duplicate_rows',
        'status',
        'started_at',
        'completed_at',
        'error_summary',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function leads()
    {
        return $this->hasMany(Lead::class, 'batch_id');
    }

    public function errors()
    {
        return $this->hasMany(ImportError::class, 'batch_id');
    }
}
