<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Branch;
use Inertia\Inertia;
class UserController extends Controller
{
    public function index()
    {
        $users = User::with('branch')->get();
        $branches = Branch::all();
        return Inertia::render('user/index',[
            'users' => $users,
            'branches' => $branches
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
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:1,2',
            'branch_id' => 'required|exists:branches,id',
        ]);
        $user->update($validated);
        return redirect()->route('users.index');
    }
}
