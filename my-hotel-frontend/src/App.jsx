import { useEffect, useState } from 'react';
import axios from 'axios';

export default function App() {
  const [rooms, setRooms] = useState([]);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('Single');
  const [price, setPrice] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/rooms', {
        room_number: roomNumber,
        room_type: roomType,
        price: price,
        status: 'available'
      });
      setRoomNumber('');
      setPrice('');
      fetchRooms();
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Hotel Management Dashboard</h1>
      
      <form onSubmit={handleSubmit} style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Add New Room</h3>
        <div style={{ marginBottom: '10px' }}>
          <input 
            type="text" 
            placeholder="Room Number" 
            value={roomNumber} 
            onChange={(e) => setRoomNumber(e.target.value)} 
            required 
            style={{ padding: '8px', width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <select value={roomType} onChange={(e) => setRoomType(e.target.value)} style={{ padding: '8px', width: '100%' }}>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Suite">Suite</option>
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input 
            type="number" 
            placeholder="Price" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            required 
            style={{ padding: '8px', width: '100%' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Add Room
        </button>
      </form>

      <h2>Rooms List</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {rooms.map(room => (
          <li key={room.id} style={{ background: '#fff', border: '1px solid #ddd', padding: '10px', marginBottom: '8px', borderRadius: '4px' }}>
            Room {room.room_number} — {room.room_type} (${room.price}) [{room.status}]
          </li>
        ))}
      </ul>
    </div>
  );
}