<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Branch::create([
            'name' => 'Main Headquarter',
            'address' => 'City Center',
        ]);

        Branch::create([
            'name' => 'First Branch',
            'address' => 'Uptown',
        ]);

        Branch::create([
            'name' => 'Second Branch',
            'address' => 'Downtown',
        ]);
    }
}
