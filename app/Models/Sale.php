<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    /** @use HasFactory<\Database\Factories\SaleFactory> */
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'customer_name',
        'product_id',
        'quantity',
        'tax',
        'discount',
        'branch_id',
        'total_amount',
        'status',
        'loyalty_points',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }


    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    protected static function boot()
    {
        parent::boot();

        // Update product stock when sale is created
        static::created(function ($sale) {
            $sale->updateProductStock();
        });

        // Restore product stock when sale is deleted
        static::deleting(function ($sale) {
            $sale->restoreProductStock();
        });
    }

    public function updateProductStock()
    {
        $product = Product::find($this->product_id);
        if ($product) {
            $product->decrement('stock_quantity', $this->quantity);
        }
    }

    public function restoreProductStock()
    {
        $product = Product::find($this->product_id);
        if ($product) {
            $product->increment('stock_quantity', $this->quantity);
        }
    }
}
