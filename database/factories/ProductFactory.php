<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Supplier;
use App\Models\Category;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'price' => $this->faker->randomFloat(2, 1000, 100000),
            'stock_quantity' => $this->faker->numberBetween(300, 1000),
            'branch_id' => $this->faker->numberBetween(1, 2),
            'supplier_id' => Supplier::factory(),
            'category_id' => Category::factory(),
        ];
    }
}
