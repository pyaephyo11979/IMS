<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function create(Request $request)
    {
        $customers = Customer::select('id', 'name')->orderBy('name')->get();

        $salesQuery = Sale::select('id', 'total_amount', 'status');
        $selectedCustomerId = $request->get('customer_id');
        if ($selectedCustomerId) {
            $salesQuery->where('customer_id', $selectedCustomerId);
        } else {
            // If no customer selected, don't load all sales to reduce noise; return empty collection
            $salesQuery->whereRaw('1 = 0');
        }
        $sales = $salesQuery->latest()->limit(200)->get();

        return Inertia::render('invoice/create', [
            'customers' => $customers,
            'sales' => $sales,
            'selected_customer_id' => $selectedCustomerId,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'required|string|in:pending,paid,canceled',
            'customer_name' => 'nullable|string|max:255',
            'sales' => 'nullable|array',
            'sales.*' => 'exists:sales,id',
            'notes' => 'nullable|string|max:1000',
            'type' => 'required|string|in:sale',
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

        // Attach multiple sales if provided
        if ($request->filled('sales')) {
            $syncData = collect($request->sales)->mapWithKeys(fn ($saleId) => [$saleId => ['line_total' => null]])->toArray();
            $invoice->sales()->sync($syncData);
        }

        return redirect()->route('invoices.index')->with('success', 'Invoice created successfully.');
    }

    public function index(Request $request)
    {
    $query = Invoice::query()->with(['customer:id,name', 'sales:id,total_amount,status']);

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
    // Type fixed to sale now; no filtering by type
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
                'supplier' => null,
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
    $invoice = Invoice::with(['customer:id,name', 'sales:id,total_amount,status'])
            ->findOrFail($id);

        $salesTotal = $invoice->sales->sum('total_amount');
        $data = [
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'type' => $invoice->type,
            'status' => $invoice->status,
            'branch' => $invoice->branch,
            'total_amount' => $invoice->total_amount,
            'tax_amount' => $invoice->tax_amount,
            'discount' => $invoice->discount,
            'computed_sales_total' => $salesTotal,
            'difference' => $invoice->total_amount - $salesTotal,
            'customer' => $invoice->customer,
                'supplier' => null,
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
            'status' => 'required|string|in:pending,paid,canceled',
            'discount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'total_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);
        $invoice->update($request->only(['status', 'discount', 'tax_amount', 'total_amount', 'notes']));
        return redirect()->route('invoices.show', $invoice->id)->with('success', 'Invoice updated.');
    }

    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->delete();
    return redirect()->route('invoices.index')->with('success', 'Invoice deleted.');
    }
}
