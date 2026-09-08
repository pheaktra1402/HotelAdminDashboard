<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoomController extends Controller
{
    /**
     * Display a listing of the rooms.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Room::query();

        if ($request->has('status') && ! empty($request->status)) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('room_number', 'like', "%{$search}%")
                    ->orWhere('room_type', 'like', "%{$search}%");
            });
        }

        $rooms = $query->orderBy('created_at', 'desc')->get();

        return response()->json($rooms);
    }

    /**
     * Store a newly created room in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'room_number' => ['required', 'string', 'max:50', 'unique:rooms,room_number'],
            'room_type' => ['required', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'in:Available,Occupied,Cleaning'],
        ]);

        if (empty($validated['status'])) {
            $validated['status'] = 'Available';
        }

        $room = Room::create($validated);

        return response()->json($room, 201);
    }

    /**
     * Display the specified room.
     */
    public function show(Room $room): JsonResponse
    {
        return response()->json($room);
    }

    /**
     * Update the specified room in storage.
     */
    public function update(Request $request, Room $room): JsonResponse
    {
        $validated = $request->validate([
            'room_number' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('rooms', 'room_number')->ignore($room->id)],
            'room_type' => ['sometimes', 'required', 'string', 'max:100'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'status' => ['sometimes', 'required', 'string', 'in:Available,Occupied,Cleaning'],
        ]);

        $room->update($validated);

        return response()->json($room);
    }

    /**
     * Remove the specified room from storage.
     */
    public function destroy(Room $room): JsonResponse
    {
        $room->delete();

        return response()->json([
            'message' => 'Room deleted successfully',
        ], 200);
    }
}
