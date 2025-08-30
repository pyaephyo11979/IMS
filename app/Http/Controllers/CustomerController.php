<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        if($request->user()->isAdmin()){
            $customers = Customer::withCount(['sales', 'invoices'])->with('branch')->get();
        }else{
            $customers = Customer::withCount(['sales', 'invoices'])->with('branch')->where('branch_id', $request->user()->branch_id)->get();
        }
        return Inertia::render('customer/index', [
            'customers' => $customers,
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
