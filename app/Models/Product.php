<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock_quantity',
        'is_active',
        'supplier_id',
        'category_id',
        'branch_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'low_stock_notified' => 'boolean',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function searchByName($name)
    {
        return $this->where('name', 'like', "%{$name}%")->get();
    }

    public function searchByCategory($category)
    {
        $categoryId = Category::where('name', $category)->value('id');

        return $this->where('category_id', $categoryId)->get();
    }

    public function searchBySupplier($supplier)
    {
        $supplierId = Supplier::where('name', $supplier)->value('id');

        return $this->where('supplier_id', $supplierId)->get();
    }

    public function searchByBranch($branchId)
    {
        return $this->where('branch_id', $branchId)->get();
    }

    public function notifications()
    {
        return $this->hasMany(StockNotification::class);
    }

    public function isLowStock():bool
    {
        return $this->stock_quantity < 10;
    }
}
