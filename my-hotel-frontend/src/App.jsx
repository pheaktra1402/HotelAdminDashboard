import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "http://localhost:8000/api/rooms";

export default function App() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [deletingRoom, setDeletingRoom] = useState(null);

    // Form fields
    const [formData, setFormData] = useState({
        room_number: "",
        room_type: "Single",
        price: "",
        status: "Available",
    });
    const [formError, setFormError] = useState("");

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_BASE);
            setRooms(response.data);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setFormData({
            room_number: "",
            room_type: "Single",
            price: "",
            status: "Available",
        });
        setFormError("");
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (room) => {
        setEditingRoom(room);
        setFormData({
            room_number: room.room_number,
            room_type: room.room_type,
            price: room.price,
            status: room.status,
        });
        setFormError("");
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        try {
            await axios.post(API_BASE, {
                ...formData,
                price: parseFloat(formData.price),
            });
            setIsAddModalOpen(false);
            fetchRooms();
        } catch (error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                setFormError(error.response.data.message);
            } else {
                setFormError("Failed to create room. Please check input.");
            }
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        try {
            await axios.put(`${API_BASE}/${editingRoom.id}`, {
                ...formData,
                price: parseFloat(formData.price),
            });
            setEditingRoom(null);
            fetchRooms();
        } catch (error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                setFormError(error.response.data.message);
            } else {
                setFormError("Failed to update room.");
            }
        }
    };

    const handleQuickStatusChange = async (room, newStatus) => {
        try {
            await axios.put(`${API_BASE}/${room.id}`, { status: newStatus });
            setRooms(
                rooms.map((r) =>
                    r.id === room.id ? { ...r, status: newStatus } : r,
                ),
            );
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingRoom) return;
        try {
            await axios.delete(`${API_BASE}/${deletingRoom.id}`);
            setDeletingRoom(null);
            fetchRooms();
        } catch (error) {
            console.error("Error deleting room:", error);
        }
    };

    // Stats calculation
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter((r) => r.status === "Available").length;
    const occupiedRooms = rooms.filter((r) => r.status === "Occupied").length;
    const cleaningRooms = rooms.filter((r) => r.status === "Cleaning").length;

    // Filtered rooms
    const filteredRooms = rooms.filter((room) => {
        const matchesSearch =
            room.room_number
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            room.room_type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || room.status === statusFilter;
        const matchesType = !typeFilter || room.room_type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="brand-title">
                    <div className="brand-icon">🏨</div>
                    <div>
                        <h1>Hotel Room Management</h1>
                        <p>
                            Monitor room availability, manage status, and update
                            pricing
                        </p>
                    </div>
                </div>
                <button className="btn-primary" onClick={handleOpenAddModal}>
                    <span>+</span> Add New Room
                </button>
            </header>

            {/* Stats Cards */}
            <section className="stats-grid">
                <div className="stat-card stat-total">
                    <div className="stat-info">
                        <h3>Total Rooms</h3>
                        <div className="stat-value">{totalRooms}</div>
                    </div>
                    <div className="stat-icon-wrapper">🏢</div>
                </div>
                <div className="stat-card stat-available">
                    <div className="stat-info">
                        <h3>Available</h3>
                        <div className="stat-value">{availableRooms}</div>
                    </div>
                    <div className="stat-icon-wrapper">✅</div>
                </div>
                <div className="stat-card stat-occupied">
                    <div className="stat-info">
                        <h3>Occupied</h3>
                        <div className="stat-value">{occupiedRooms}</div>
                    </div>
                    <div className="stat-icon-wrapper">🔑</div>
                </div>
                <div className="stat-card stat-cleaning">
                    <div className="stat-info">
                        <h3>Cleaning</h3>
                        <div className="stat-value">{cleaningRooms}</div>
                    </div>
                    <div className="stat-icon-wrapper">🧹</div>
                </div>
            </section>

            {/* Toolbar: Search & Filter */}
            <div className="toolbar">
                <div className="search-filter-group">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by room # or type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Cleaning">Cleaning</option>
                    </select>

                    <select
                        className="filter-select"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Suite">Suite</option>
                        <option value="Deluxe">Deluxe</option>
                    </select>
                </div>
            </div>

            {/* Room Cards Grid */}
            {loading ? (
                <div className="empty-state">
                    <h3>Loading rooms...</h3>
                </div>
            ) : filteredRooms.length === 0 ? (
                <div className="empty-state">
                    <h3>No rooms found</h3>
                    <p>Try adjusting your search query or status filter.</p>
                </div>
            ) : (
                <div className="rooms-grid">
                    {filteredRooms.map((room) => (
                        <div key={room.id} className="room-card">
                            <div>
                                <div className="room-card-header">
                                    <div>
                                        <div className="room-number-title">
                                            Room {room.room_number}
                                        </div>
                                        <div className="room-type-tag">
                                            {room.room_type}
                                        </div>
                                    </div>
                                    <span
                                        className={`status-badge badge-${room.status.toLowerCase()}`}
                                    >
                                        {room.status}
                                    </span>
                                </div>

                                <div className="room-price-row">
                                    <span className="price-amount">
                                        ${Number(room.price).toFixed(2)}
                                    </span>
                                    <span className="price-period">
                                        / night
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div
                                    style={{
                                        marginBottom: "0.5rem",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "0.8rem",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        Status:
                                    </span>
                                    <select
                                        className="status-select-sm"
                                        value={room.status}
                                        onChange={(e) =>
                                            handleQuickStatusChange(
                                                room,
                                                e.target.value,
                                            )
                                        }
                                    >
                                        <option value="Available">
                                            Available
                                        </option>
                                        <option value="Occupied">
                                            Occupied
                                        </option>
                                        <option value="Cleaning">
                                            Cleaning
                                        </option>
                                    </select>
                                </div>

                                <div className="room-card-actions">
                                    <button
                                        className="btn-icon btn-edit"
                                        onClick={() =>
                                            handleOpenEditModal(room)
                                        }
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        className="btn-icon btn-delete"
                                        onClick={() => setDeletingRoom(room)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Room Modal */}
            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add New Room</h2>
                            <button
                                className="btn-close"
                                onClick={() => setIsAddModalOpen(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit}>
                            <div className="modal-body">
                                {formError && (
                                    <div className="error-banner">
                                        {formError}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Room Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. 101"
                                        required
                                        value={formData.room_number}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                room_number: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Room Type</label>
                                    <select
                                        className="form-control"
                                        value={formData.room_type}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                room_type: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="Single">Single</option>
                                        <option value="Double">Double</option>
                                        <option value="Suite">Suite</option>
                                        <option value="Deluxe">Deluxe</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Price per Night ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-control"
                                        placeholder="e.g. 120.00"
                                        required
                                        value={formData.price}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                price: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Initial Status</label>
                                    <select
                                        className="form-control"
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                status: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="Available">
                                            Available
                                        </option>
                                        <option value="Occupied">
                                            Occupied
                                        </option>
                                        <option value="Cleaning">
                                            Cleaning
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setIsAddModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Save Room
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Room Modal */}
            {editingRoom && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Edit Room {editingRoom.room_number}</h2>
                            <button
                                className="btn-close"
                                onClick={() => setEditingRoom(null)}
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-body">
                                {formError && (
                                    <div className="error-banner">
                                        {formError}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Room Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={formData.room_number}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                room_number: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Room Type</label>
                                    <select
                                        className="form-control"
                                        value={formData.room_type}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                room_type: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="Single">Single</option>
                                        <option value="Double">Double</option>
                                        <option value="Suite">Suite</option>
                                        <option value="Deluxe">Deluxe</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Price per Night ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-control"
                                        required
                                        value={formData.price}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                price: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        className="form-control"
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                status: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="Available">
                                            Available
                                        </option>
                                        <option value="Occupied">
                                            Occupied
                                        </option>
                                        <option value="Cleaning">
                                            Cleaning
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setEditingRoom(null)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Update Room
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingRoom && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Confirm Deletion</h2>
                            <button
                                className="btn-close"
                                onClick={() => setDeletingRoom(null)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>
                                Are you sure you want to delete{" "}
                                <strong>Room {deletingRoom.room_number}</strong>
                                ? This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setDeletingRoom(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleDeleteConfirm}
                            >
                                Delete Room
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
