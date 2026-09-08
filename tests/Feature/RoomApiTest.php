<?php

namespace Tests\Feature;

use App\Models\Room;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoomApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_fetch_all_rooms(): void
    {
        Room::factory()->count(3)->create();

        $response = $this->getJson('/api/rooms');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_can_create_a_room(): void
    {
        $payload = [
            'room_number' => '101',
            'room_type' => 'Deluxe Suite',
            'price' => 150.00,
            'status' => 'Available',
        ];

        $response = $this->postJson('/api/rooms', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'room_number' => '101',
                'room_type' => 'Deluxe Suite',
                'price' => 150.00,
                'status' => 'Available',
            ]);

        $this->assertDatabaseHas('rooms', [
            'room_number' => '101',
        ]);
    }

    public function test_cannot_create_room_with_duplicate_number(): void
    {
        Room::factory()->create(['room_number' => '101']);

        $payload = [
            'room_number' => '101',
            'room_type' => 'Single',
            'price' => 80.00,
        ];

        $response = $this->postJson('/api/rooms', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['room_number']);
    }

    public function test_validates_required_fields_on_create(): void
    {
        $response = $this->postJson('/api/rooms', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['room_number', 'room_type', 'price']);
    }

    public function test_can_show_a_room(): void
    {
        $room = Room::factory()->create();

        $response = $this->getJson("/api/rooms/{$room->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $room->id,
                'room_number' => $room->room_number,
            ]);
    }

    public function test_can_update_a_room(): void
    {
        $room = Room::factory()->create([
            'room_number' => '102',
            'status' => 'Available',
        ]);

        $payload = [
            'room_number' => '102',
            'status' => 'Occupied',
            'price' => 199.99,
        ];

        $response = $this->putJson("/api/rooms/{$room->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'status' => 'Occupied',
                'price' => 199.99,
            ]);

        $this->assertDatabaseHas('rooms', [
            'id' => $room->id,
            'status' => 'Occupied',
        ]);
    }

    public function test_can_delete_a_room(): void
    {
        $room = Room::factory()->create();

        $response = $this->deleteJson("/api/rooms/{$room->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('rooms', [
            'id' => $room->id,
        ]);
    }

    public function test_can_filter_rooms_by_status_and_search(): void
    {
        Room::factory()->create(['room_number' => '201', 'room_type' => 'Suite', 'status' => 'Available']);
        Room::factory()->create(['room_number' => '202', 'room_type' => 'Double', 'status' => 'Occupied']);

        $responseFilter = $this->getJson('/api/rooms?status=Available');
        $responseFilter->assertStatus(200)->assertJsonCount(1);

        $responseSearch = $this->getJson('/api/rooms?search=Double');
        $responseSearch->assertStatus(200)->assertJsonCount(1);
    }
}
