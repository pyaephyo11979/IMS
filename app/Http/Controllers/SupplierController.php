<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index()
    {
        return Inertia::render('supplier/index', [
            'suppliers' => Supplier::with('branch')->orderByDesc('id')->get(),
            'branches' => Branch::all(),
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
