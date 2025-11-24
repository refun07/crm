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
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Agent
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->decimal('order_amount', 15, 2);
            $table->decimal('commission_amount', 10, 2);
            $table->enum('calculation_type', ['fixed', 'percentage', 'hybrid'])->default('fixed');
            $table->decimal('rate_value', 10, 2)->nullable(); // Fixed amount or percentage
            $table->string('month_year'); // e.g., "2025-11"
            $table->enum('status', ['pending', 'approved', 'paid'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'month_year']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
