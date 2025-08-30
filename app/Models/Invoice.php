<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    /** @use HasFactory<\Database\Factories\InvoiceFactory> */
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'type',
        'total_amount',
        'tax_amount',
        'discount',
        'customer_id',
        'customer_name',
        'due_date',
        'payment_method',
        'status',
        'notes',
        'branch',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    // Supplier removed: invoices are sales-only

    public function sales()
    {
        return $this->belongsToMany(Sale::class, 'invoice_sale')->withTimestamps()->withPivot('line_total');
    }

    // Convenience accessor: total number of sales lines
    public function salesCount(): int
    {
        return $this->sales()->count();
    }
}
