<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\StockNotificationController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/', [AuthenticatedSessionController::class, 'create'])
        ->name('login');
    Route::post('/', [AuthenticatedSessionController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
    Route::get('/sales', [SaleController::class, 'index'])->name('sales.index');
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::post('/customers/delete/{id}', [CustomerController::class, 'destroy'])->name('customers.delete');
    Route::post('/sales/{id}', [SaleController::class, 'destroy'])->name('sales.destroy');

    // Invoices viewable by any authenticated user (admins only watch; branch cashiers get create in role:1 group below)
    Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/invoices/{id}', [InvoiceController::class, 'show'])->whereNumber('id')->name('invoices.show');

});
Route::middleware(['auth', 'role:2'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::post('/users/delete/{id}', [UserController::class, 'destroy'])->name('users.delete');

    // Branch management (admin)
    Route::get('/branches', [BranchController::class, 'index'])->name('branches.index');
    Route::post('/branches', [BranchController::class, 'store'])->name('branches.store');
    Route::post('/branches/update/{id}', [BranchController::class, 'update'])->name('branches.update');
    Route::post('/branches/status/{id}', [BranchController::class, 'updateStatus'])->name('branches.status');
    Route::post('/branches/delete/{id}', [BranchController::class, 'destroy'])->name('branches.delete');

    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::post('/products/delete/{id}', [ProductController::class, 'destroy'])->name('products.destroy');

    // Supplier management (admin)
    Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
    Route::get('/suppliers/create', [SupplierController::class, 'create'])->name('suppliers.create');
    Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
    Route::get('/suppliers/{id}', [SupplierController::class, 'show'])->name('suppliers.show');
    Route::get('/suppliers/{id}/edit', [SupplierController::class, 'edit'])->name('suppliers.edit');
    Route::post('/suppliers/update/{id}', [SupplierController::class, 'update'])->name('suppliers.update');
    Route::post('/suppliers/{id}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');
    Route::get('/suppliers/search/query', [SupplierController::class, 'search'])->name('suppliers.search');

    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::post('/notifications/{id}/read', [StockNotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/{id}', [StockNotificationController::class, 'delete'])->name('notifications.delete');
});

Route::middleware(['auth', 'role:1'])->group(function () {

    Route::get('/pos', [ProductController::class, 'indexBranch'])->name('pos.index');
    Route::get('/sales/create/{pid}', [SaleController::class, 'create'])->name('sales.create');
    Route::post('/sales', [SaleController::class, 'store'])->name('sales.store');
    Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::post('/sales/update/{id}', [SaleController::class, 'update'])->name('sales.update');

    // Branch cashiers can create invoices
    Route::get('/invoices/create', [InvoiceController::class, 'create'])->name('invoices.create');
    Route::post('/invoices', [InvoiceController::class, 'store'])->name('invoices.store');
    Route::post('/invoices/update/{id}', [InvoiceController::class, 'update'])->name('invoices.update');
    Route::post('/invoices/{id}', [InvoiceController::class, 'destroy'])->name('invoices.destroy');
    // (Optional) allow deletion/update if needed later: Route::post('/invoices/{id}', ...) etc.
});
