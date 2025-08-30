<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function create(Request $request)
    {
        $customers = Customer::all();
        $suppliers = Supplier::all();

        return Inertia::render('Invoices/Create', [
            'customers' => $customers,
            'suppliers' => $suppliers,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'required|string|in:pending,paid,canceled',
            'customer_name' => 'nullable|string|max:255',
            'sale_id' => 'nullable|exists:sales,id',
            'notes' => 'nullable|string|max:1000',
            'type' => 'required|string|in:purchase,sale',
            'due_date' => 'nullable|date',
            'tax_amount' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
        ]);

        $invoiceNumber = 'INV-'.strtoupper(uniqid());
        $customerName = null;

        if ($request->customer_id) {
            $customer = Customer::find($request->customer_id);
            $customerName = $customer->name;
        }

        // Get branch name - assuming user has branch_id or default branch
        $branchName = null;
        if ($request->user() && $request->user()->branch_id) {
            $branchName = Branch::find($request->user()->branch_id)?->name;
        }

        $invoice = Invoice::create([
            'invoice_number' => $invoiceNumber,
            'type' => $request->type,
            'supplier_id' => $request->supplier_id,
            'branch' => $branchName,
            'customer_id' => $request->customer_id,
            'customer_name' => $customerName ?? $request->customer_name,
            'sale_id' => $request->sale_id,
            'notes' => $request->notes,
            'due_date' => $request->due_date,
            'total_amount' => $request->total_amount,
            'tax_amount' => $request->tax_amount ?? 0,
            'discount' => $request->discount ?? 0,
            'status' => $request->status,
        ]);

        return response()->json($invoice->load(['customer', 'supplier', 'sale']), 201);
    }

    public function index()
    {
        return Inertia::render('Invoices/Index', [
            'invoices' => Invoice::with(['customer', 'supplier', 'sale'])->paginate(10),
        ]);
    }

    public function show($id)
    {
        $invoice = Invoice::with(['customer', 'supplier', 'sale'])->findOrFail($id);

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }

    public function update(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);

        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'total_amount' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|string|in:pending,paid,canceled',
            'customer_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'due_date' => 'nullable|date',
            'tax_amount' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
        ]);

        $updateData = $request->only([
            'customer_id', 'supplier_id', 'total_amount', 'status',
            'customer_name', 'notes', 'due_date', 'tax_amount', 'discount',
        ]);

        // Update customer name if customer_id is provided
        if ($request->customer_id) {
            $customer = Customer::find($request->customer_id);
            $updateData['customer_name'] = $customer->name;
        }

        $invoice->update($updateData);

        return response()->json($invoice->load(['customer', 'supplier', 'sale']));
    }

    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->delete();

        return redirect()->route('invoices.index')->with('success', 'Invoice deleted successfully.');
    }
}
