<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\StockNotification;

class CheckLowStock extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stock:check-low';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check low stock products';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $lowStocks = Product::with('branch')->where('stock_quantity', '<=', 10)->where('low_stock_notified',false)->get();

        foreach ($lowStocks as $product) {
            StockNotification::create([
                'product_id' => $product->id,
                'type' => 'low_stock',
                'message' => "Low stock alert for product {$product->name} in branch {$product->branch->name}. Current stock: {$product->stock_quantity}",
            ]);

            $product->low_stock_notified = true;
            $product->save();
        }

        Product::where('stock_quantity', '>', 10)->where('low_stock_notified', true)->update(['low_stock_notified' => false]);

        return Command::SUCCESS;
    }
}
