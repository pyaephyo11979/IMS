<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockNotification extends Model
{
    /** @use HasFactory<\Database\Factories\StockNotificationFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'type',
        'message',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
