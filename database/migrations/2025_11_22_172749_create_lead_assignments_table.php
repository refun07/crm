<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lead_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Agent
            $table->date('assigned_date');
            $table->enum('status', ['pending', 'working', 'completed', 'recycled'])->default('pending');
            $table->boolean('is_auto_assigned')->default(true);
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete(); // For manual assignments
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'assigned_date']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_assignments');
    }
};
