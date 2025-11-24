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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Agent who converted
            $table->json('products'); // Array of products with quantities
            $table->decimal('total_amount', 15, 2);
            $table->text('customer_address');
            $table->string('payment_method');
            $table->string('offer_applied')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('synced_to_main_site')->default(false);
            $table->timestamp('synced_at')->nullable();
            $table->text('sync_response')->nullable();
            $table->timestamps();

            $table->index('order_number');
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
