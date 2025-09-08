<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function updateBranch(Request $request, $id)
    {
        $branchId = (int) $request->query('branch_id');
        $request->merge(['branch_id' => $branchId]);
        $request->validate([
            'branch_id' => 'required|exists:branches,id',
        ]);
        $product = Product::findOrFail($id);
        $product->branch_id = $branchId;
        $product->save();
        return redirect()->back()->with('success', 'Product branch updated successfully. (branch_id: ' . $branchId . ')');
    }

    public function updateStock(Request $request, $id)
    {
        $request->validate([
            'stock_quantity' => 'required|integer|min:0',
        ]);
        $product = Product::findOrFail($id);
        $product->stock_quantity = $request->stock_quantity;
        $product->save();
        return redirect()->back()->with('success', 'Product stock updated successfully.');
    }
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'stock_quantity' => 'required|integer|min:0',
            'description' => 'nullable|string|max:1000',
            'supplier_id' => 'required|exists:suppliers,id',
            'branch_id' => 'required|exists:branches,id',
            'is_active' => 'nullable|boolean' ?: true,
        ]);

        Product::create($request->all());

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    public function destroy(Request $request, $id)
    {

        Product::destroy($id);

        return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
    }

    public function index()
    {
        return Inertia::render('product/index', [
            'products' => Product::with(['category', 'supplier', 'branch'])->paginate(10),
            'categories' => Category::all(),
            'suppliers' => Supplier::all(),
            'branches' => Branch::all(),
        ]);
    }

    public function indexBranch(Request $request)
    {
        $branchId = $request->user()->branch_id;

        return Inertia::render('product/pos-index', [
            'products' => Product::with(['category', 'supplier', 'branch'])->where('branch_id', $branchId)->paginate(10),
        ]);
    }

    public function search(Request $request)
    {
        $queryString = $request->get('query');
        $query = Product::with(['category', 'supplier', 'branch']);

        if ($queryString) {
            $query->where(function ($q) use ($queryString) {
                $q->where('name', 'like', "%{$queryString}%")
                    ->orWhere('description', 'like', "%{$queryString}%")
                    ->orWhereHas('category', function ($q) use ($queryString) {
                        $q->where('name', 'like', "%{$queryString}%");
                    })
                    ->orWhereHas('supplier', function ($q) use ($queryString) {
                        $q->where('name', 'like', "%{$queryString}%");
                    });
            });
        }

        return Inertia::render('products/index', [
            'products' => $query->paginate(10),
            'query' => $queryString,
        ]);
    }

    public function getLowStock($threshold = 10)
    {
        $products = Product::with(['category', 'supplier', 'branch'])
            ->where('stock_quantity', '<=', $threshold)
            ->where('is_active', true)
            ->get();

        return response()->json($products);
    }
}
