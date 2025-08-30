<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with(['customer', 'branch', 'product']);

        // Role restriction
        if (! $request->user()->isAdmin()) {
            $query->where('branch_id', $request->user()->branch_id);
        }

        // Filters
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }
        if ($product = $request->get('product')) {
            $query->where('product_id', $product);
        }
        if ($customer = $request->get('customer')) {
            $query->where(function ($q) use ($customer) {
                $q->where('customer_name', 'like', "%{$customer}%")
                    ->orWhereHas('customer', fn ($cq) => $cq->where('name', 'like', "%{$customer}%"));
            });
        }
        if ($search = $request->get('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('id', $search)
                    ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }
        if ($dateFrom = $request->get('from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->get('to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $sales = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('sale/index', [
            'sales' => $sales,
            'filters' => [
                'status' => $status ?? null,
                'product' => $product ?? null,
                'customer' => $customer ?? null,
                'q' => $search ?? null,
                'from' => $dateFrom ?? null,
                'to' => $dateTo ?? null,
            ],
        ]);
    }

    public function show($id)
    {
        $sale = Sale::with(['customer', 'branch', 'items'])->findOrFail($id);

        return response()->json($sale);
    }

    public function create(Request $request, $pid)
    {
        $customers = Customer::where('branch_id', $request->user()->branch_id)->get();
        $products = Product::find($pid);
        $user = $request->user();

        return Inertia::render('sale/create', [
            'customers' => $customers,
            'product' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'customer_name' => 'nullable|string|max:255',
            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'status' => 'required|string|in:pending,paid,canceled',
            'total_amount' => 'required|numeric|min:0',
        ]);

        $customer = Customer::find($request->customer_id);
        $customer_name = $request->customer_id ? $customer->name : $request->customer_name;
        $branch_id = auth()->user()->branch_id;

        $tax = $request->tax ?? 0;
        $discount = $request->discount ?? 0;
        $total = $request->price * $request->quantity;
        $total_amount = $total - ($total * $discount / 100) + ($total * $tax / 100);

        $sale = Sale::create([
            'customer_id' => $request->customer_id,
            'branch_id' => $branch_id,
            'product_id' => $request->product_id,
            'customer_name' => $customer_name,
            'tax' => $request->tax ?? 0,
            'discount' => $request->discount ?? 0,
            'total_amount' => $total_amount,
            'status' => $request->status,
            'quantity' => $request->quantity,
        ]);

        return redirect()->route('sales.index')->with('success', 'Sale created successfully.');
    }

    public function update(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);

        $request->validate([
            'status' => 'required|string|in:pending,paid,canceled',
        ]);

        $sale->update([
            'status' => $request->status,
        ]);

        return back()->with('success', 'Sale updated successfully.');
    }

    public function destroy($id)
    {
        $sale = Sale::findOrFail($id);
        $sale->delete();

        return back()->with('success', 'Sale deleted successfully.');
    }
}
