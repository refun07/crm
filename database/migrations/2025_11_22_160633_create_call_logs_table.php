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
        Schema::create('call_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Agent who made the call
            $table->enum('outcome', ['connected', 'not_connected', 'wrong_number', 'no_interest', 'interested', 'follow_up_scheduled', 'converted'])->nullable();
            $table->text('notes')->nullable();
            $table->integer('duration_seconds')->nullable(); // Call duration
            $table->timestamp('called_at');
            $table->timestamps();

            $table->index(['lead_id', 'user_id']);
            $table->index('called_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('call_logs');
    }
};
