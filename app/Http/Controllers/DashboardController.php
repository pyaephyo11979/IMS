<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Branch;
use App\Models\Supplier;
use App\Models\StockNotification;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;


class DashboardController extends Controller
{
    public function index()
    {
        // Throttled low-stock scan: runs at most once per 60s across all users.
        if (Cache::add('low-stock-scan-lock', true, 20)) {
            // For immediate availability of notifications on first page load use call();
            // For non-blocking defer to queue(). Here we choose queue for responsiveness.
            try {
                Artisan::queue('stock:check-low');
            } catch (\Throwable $e) {
                // Silently ignore to not break dashboard; optionally log
                report($e);
            }
        }

        $sales = Sale::with(['product', 'customer', 'branch'])->get();
        $products = Product::with(['category', 'supplier', 'branch'])->get();
        $customers = Customer::all();
        $branches = Branch::all();
        $suppliers = Supplier::all();
        $stockNotifications = StockNotification::all();
        $users = User::all();

        return Inertia::render('dashboard', [
            'sales' => $sales,
            'products' => $products,
            'customers' => $customers,
            'branches' => $branches,
            'suppliers' => $suppliers,
            'users' => $users,
            'stockNotifications' => $stockNotifications,
        ]);
    }
}
