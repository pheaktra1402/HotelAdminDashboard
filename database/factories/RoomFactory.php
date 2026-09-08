<?php

namespace Database\Factories;

use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Room>
 */
class RoomFactory extends Factory
{
    protected $model = Room::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'room_number' => (string) fake()->unique()->numberBetween(100, 999),
            'room_type' => fake()->randomElement(['Single', 'Double', 'Suite', 'Deluxe']),
            'price' => fake()->randomFloat(2, 50, 500),
            'status' => fake()->randomElement(['Available', 'Occupied', 'Cleaning']),
        ];
    }
}
