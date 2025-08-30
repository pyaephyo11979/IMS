<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Sale;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function create(Request $request)
    {
        $customers = Customer::select('id', 'name')->orderBy('name')->get();
        $suppliers = Supplier::select('id', 'name')->orderBy('name')->get();
        // Fetch recent sales to attach (could filter by status if needed)
        $sales = Sale::select('id', 'total_amount', 'status')->latest()->limit(100)->get();

        return Inertia::render('invoice/create', [
            'customers' => $customers,
            'suppliers' => $suppliers,
            'sales' => $sales,
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
            'sales' => 'nullable|array',
            'sales.*' => 'exists:sales,id',
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
            'notes' => $request->notes,
            'due_date' => $request->due_date,
            'total_amount' => $request->total_amount,
            'tax_amount' => $request->tax_amount ?? 0,
            'discount' => $request->discount ?? 0,
            'status' => $request->status,
        ]);

        // Attach multiple sales if provided; optional line_total recompute
        if ($request->filled('sales')) {
            $syncData = collect($request->sales)->mapWithKeys(fn ($saleId) => [$saleId => ['line_total' => null]])->toArray();
            $invoice->sales()->sync($syncData);
        }

        return response()->json($invoice->load(['customer', 'supplier', 'sales']), 201);
    }

    public function index(Request $request)
    {
        $query = Invoice::query()->with(['customer:id,name', 'supplier:id,name', 'sales:id,total_amount,status']);

        // Role-based scope: role 2 (admin) sees all, role 1 (cashier) limited to their branch
        $user = $request->user();
        if ($user && (int) $user->role === 1) {
            // Invoices store branch name string; match against user's branch name if available
            $branchName = $user->branch?->name;
            if ($branchName) {
                $query->where('branch', $branchName);
            } else {
                // If user has no branch name assigned, return none (safety) rather than exposing all
                $query->whereRaw('1 = 0');
            }
        }

        // Optional filters
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }
        if ($type = $request->get('type')) {
            $query->where('type', $type);
        }
        if ($search = $request->get('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        $invoices = $query->latest()->paginate(10)->through(function (Invoice $invoice) {
            $salesTotal = $invoice->sales->sum('total_amount');

            return [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'type' => $invoice->type,
                'status' => $invoice->status,
                'branch' => $invoice->branch,
                'total_amount' => $invoice->total_amount,
                'computed_sales_total' => $salesTotal,
                'difference' => $invoice->total_amount - $salesTotal,
                'customer' => $invoice->customer,
                'supplier' => $invoice->supplier,
                'sales_count' => $invoice->sales->count(),
                'sales' => $invoice->sales->map(fn ($s) => [
                    'id' => $s->id,
                    'total_amount' => $s->total_amount,
                    'status' => $s->status,
                ]),
                'created_at' => $invoice->created_at?->toDateTimeString(),
            ];
        });

        // Summary stats for dashboard / filters UI
        $summary = [
            'total' => $invoices->total(),
            'pending' => Invoice::where('status', 'pending')->count(),
            'paid' => Invoice::where('status', 'paid')->count(),
            'canceled' => Invoice::where('status', 'canceled')->count(),
        ];

        return Inertia::render('invoice/index', [
            'invoices' => $invoices,
            'filters' => [
                'status' => $status ?? null,
                'type' => $type ?? null,
                'q' => $search ?? null,
            ],
            'summary' => $summary,
        ]);
    }

    public function show($id)
    {
        $invoice = Invoice::with(['customer:id,name', 'supplier:id,name', 'sales:id,total_amount,status'])
            ->findOrFail($id);

        $salesTotal = $invoice->sales->sum('total_amount');
        $data = [
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'type' => $invoice->type,
            'status' => $invoice->status,
            'total_amount' => $invoice->total_amount,
            'tax_amount' => $invoice->tax_amount,
            'discount' => $invoice->discount,
            'computed_sales_total' => $salesTotal,
            'difference' => $invoice->total_amount - $salesTotal,
            'customer' => $invoice->customer,
            'supplier' => $invoice->supplier,
            'sales' => $invoice->sales->map(fn ($s) => [
                'id' => $s->id,
                'total_amount' => $s->total_amount,
                'status' => $s->status,
            ]),
            'created_at' => $invoice->created_at?->toDateTimeString(),
            'updated_at' => $invoice->updated_at?->toDateTimeString(),
        ];

        return Inertia::render('invoice/info', [
            'invoice' => $data,
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

        return response()->json($invoice->load(['customer', 'supplier', 'sales']));
    }

    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->delete();

        return redirect()->route('invoices.index')->with('success', 'Invoice deleted successfully.');
    }
}
