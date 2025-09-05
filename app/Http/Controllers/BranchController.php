<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchController extends Controller
{
    public function index()
    {
        return Inertia::render('Branches/Index', [
            'branches' => Branch::withCount(['products', 'sales'])->paginate(10),
        ]);
    }

    public function create()
    {
        return Inertia::render('Branches/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'contact_number' => 'nullable|string|max:20',
            'status' => 'required|string|in:active,inactive',
        ]);

        Branch::create($request->all());

        return redirect()->route('users.index')->with('success', 'Branch created successfully.');
    }

    public function show($id)
    {
        $branch = Branch::with(['products', 'sales'])->findOrFail($id);

        return Inertia::render('Branches/Show', [
            'branch' => $branch,
        ]);
    }

    public function edit($id)
    {
        $branch = Branch::findOrFail($id);

        return Inertia::render('Branches/Edit', [
            'branch' => $branch,
        ]);
    }

    public function update(Request $request, $id)
    {
        $branch = Branch::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'contact_number' => 'nullable|string|max:20',
            'status' => 'required|string|in:active,inactive',
        ]);

        $branch->update($request->all());

        return redirect()->route('branches.index')->with('success', 'Branch updated successfully.');
    }

    public function destroy($id)
    {
        $branch = Branch::findOrFail($id);

        // Check if branch has products or sales
        if ($branch->products()->count() > 0 || $branch->sales()->count() > 0) {
            return redirect()->route('branches.index')
                ->with('error', 'Cannot delete branch with existing products or sales.');
        }

        $branch->delete();

        return redirect()->route('branches.index')->with('success', 'Branch deleted successfully.');
    }

    /**
     * Update only the status field of a branch (active|inactive).
     */
    public function updateStatus(Request $request, $id)
    {
        $branch = Branch::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:active,inactive',
        ]);

        $branch->update(['status' => $validated['status']]);

    return redirect()->back()->with('success', 'Branch status updated.');
    }
}
