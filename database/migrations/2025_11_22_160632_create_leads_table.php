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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone_encrypted'); // Encrypted phone number
            $table->string('phone_last_4')->nullable(); // Last 4 digits for display
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip_code')->nullable();
            $table->string('source')->nullable(); // Where lead came from
            $table->enum('status', ['new', 'assigned', 'called', 'interested', 'follow_up', 'converted', 'invalid', 'not_interested'])->default('new');
            $table->enum('quality_tag', ['good', 'medium', 'poor'])->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('batch_id')->nullable()->constrained('import_batches')->nullOnDelete();
            $table->boolean('is_locked')->default(false); // Locked after first call
            $table->timestamp('last_called_at')->nullable();
            $table->integer('call_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('assigned_to');
            $table->index('phone_encrypted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
