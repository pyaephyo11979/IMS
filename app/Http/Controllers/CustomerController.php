<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::withCount(['sales', 'invoices'])->with('branch');
        if (! $request->user()->isAdmin()) {
            $query->where('branch_id', $request->user()->branch_id);
        }
        if ($branch = $request->get('branch')) {
            $query->where('branch_id', $branch);
        }
        if ($search = $request->get('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }
        if ($minSales = $request->get('min_sales')) {
            $query->having('sales_count', '>=', (int) $minSales);
        }
        if ($minInvoices = $request->get('min_invoices')) {
            $query->having('invoices_count', '>=', (int) $minInvoices);
        }

        $customers = $query->orderByDesc('id')->paginate(15)->withQueryString();

        return Inertia::render('customer/index', [
            'customers' => $customers,
            'filters' => [
                'branch' => $branch ?? null,
                'q' => $search ?? null,
                'min_sales' => $minSales ?? null,
                'min_invoices' => $minInvoices ?? null,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Customers/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:customers',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'loyalty_points' => 'nullable|integer|min:0',
        ]);

        $customer = Customer::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'loyalty_points' => $request->loyalty_points ?? 0,
            'branch_id' => $request->user()->branch_id,
        ]);

        return redirect()->route('customers.index')->with('success', 'Customer created successfully.');
    }

    public function show($id)
    {
        $customer = Customer::with(['sales', 'invoices'])->findOrFail($id);

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
        ]);
    }

    public function edit($id)
    {
        $customer = Customer::findOrFail($id);

        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:customers,email,'.$id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'loyalty_points' => 'nullable|integer|min:0',
        ]);

        $customer->update($request->only('name', 'email', 'phone', 'address', 'loyalty_points'));

        return redirect()->route('customers.index')->with('success', 'Customer updated successfully.');
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);

        // Check if customer has sales or invoices
        if ($customer->sales()->count() > 0 || $customer->invoices()->count() > 0) {
            return redirect()->route('customers.index')
                ->with('error', 'Cannot delete customer with existing sales or invoices.');
        }

        $customer->delete();

        return redirect()->route('customers.index')->with('success', 'Customer deleted successfully.');
    }

    public function search(Request $request)
    {
        $query = $request->get('query');

        $customers = Customer::where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->orWhere('phone', 'like', "%{$query}%")
            ->paginate(10);

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'query' => $query,
        ]);
    }
}
