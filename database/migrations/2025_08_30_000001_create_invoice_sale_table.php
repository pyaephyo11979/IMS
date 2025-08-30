<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_sale', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->decimal('line_total', 12, 2)->nullable(); // optional cached line total
            $table->timestamps();
            $table->unique(['invoice_id', 'sale_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_sale');
    }
};
