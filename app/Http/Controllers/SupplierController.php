<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::with('branch');

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }
        if ($branch = $request->get('branch')) {
            $query->where('branch_id', $branch);
        }
        if ($search = $request->get('q')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->orderByDesc('id')->paginate(10)->withQueryString();

        return Inertia::render('supplier/index', [
            'suppliers' => $suppliers,
            'branches' => Branch::select('id','name')->get(),
            'filters' => [
                'status' => $status ?? null,
                'branch' => $branch ?? null,
                'q' => $search ?? null,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:suppliers,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'contract_start_date' => 'nullable|date',
            'contract_end_date' => 'nullable|date|after_or_equal:contract_start_date',
            'status' => 'nullable|string|in:active,inactive,suspended',
            'payment_terms' => 'nullable|string|max:255',
            'branch_id' => 'required|exists:branches,id',
        ]);

        $supplier = Supplier::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'contract_start_date' => $request->contract_start_date,
            'contract_end_date' => $request->contract_end_date,
            'status' => $request->status ?? 'active',
            'payment_terms' => $request->payment_terms,
            'branch_id' => $request->branch_id,
        ]);

        return redirect()->route('suppliers.index')->with('success', 'Supplier created successfully.');
    }

    public function show($id)
    {
        $supplier = Supplier::with(['branch', 'products', 'invoices'])->findOrFail($id);

        return Inertia::render('Suppliers/Show', [
            'supplier' => $supplier,
        ]);
    }

    public function edit($id)
    {
        $supplier = Supplier::findOrFail($id);

        return Inertia::render('Suppliers/Edit', [
            'supplier' => $supplier,
            'branches' => Branch::all(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $request->validate([
            'status' => 'required|string|in:active,inactive,suspended',
        ]);

        $supplier->update($request->all());

        return redirect()->route('suppliers.index')->with('success', 'Supplier updated successfully.');
    }

    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();

        return redirect()->route('suppliers.index')->with('success', 'Supplier deleted successfully.');
    }

    public function search(Request $request)
    {
        $query = $request->get('query');

        $suppliers = Supplier::with('branch')
            ->where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->orWhere('phone', 'like', "%{$query}%")
            ->paginate(10);

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
            'query' => $query,
        ]);
    }

    public function getByBranch($branchId)
    {
        $suppliers = Supplier::where('branch_id', $branchId)->get();

        return response()->json($suppliers);
    }
}
