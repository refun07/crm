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
        Schema::create('follow_ups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Agent responsible
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete(); // Who scheduled it
            $table->dateTime('scheduled_at');
            $table->enum('priority', ['low', 'medium', 'high', 'hot'])->default('medium');
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'claimed', 'completed', 'missed', 'returned_to_pool'])->default('pending');
            $table->timestamp('claimed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('outcome_notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'scheduled_at']);
            $table->index(['status', 'priority']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('follow_ups');
    }
};
