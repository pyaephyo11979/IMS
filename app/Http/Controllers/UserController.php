<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('branch');

        if ($branch = $request->get('branch')) {
            $query->where('branch_id', $branch);
        }
        if ($role = $request->get('role')) {
            $query->where('role', $role);
        }
        if ($search = $request->get('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderByDesc('id')->paginate(10)->withQueryString();
        $branches = Branch::select('id', 'name', 'status', 'address', 'contact_number')
            ->withCount(['products', 'sales'])
            ->get();

        return Inertia::render('user/index', [
            'users' => $users,
            'branches' => $branches,
            'filters' => [
                'branch' => $branch ?? null,
                'role' => $role ?? null,
                'q' => $search ?? null,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:1,2',
            'branch_id' => 'required|exists:branches,id',
        ]);

        User::create($validated);

        return redirect()->route('users.index');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->route('users.index');
    }

    public function update(Request $request)
    {
        $user = User::with('branch')->findOrFail($request->id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'role' => 'required|in:1,2',
            'branch_id' => 'required|exists:branches,id',
        ]);
        $user->update($validated);

        return redirect()->route('users.index');
    }
}
