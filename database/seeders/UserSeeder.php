<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@ims.com',
            'password' => Hash::make('password'),
            'branch_id' => 1,
            'role' => 2,
        ]);
        User::create([
            'name' => 'Cashier1',
            'email' => 'cashier1@ims.com',
            'password' => Hash::make('password'),
            'branch_id' => 2,
        ]);
        User::create([
            'name' => 'Cashier2',
            'email' => 'cashier2@ims.com',
            'password' => Hash::make('password'),
            'branch_id' => 3,
        ]);
    }
}
