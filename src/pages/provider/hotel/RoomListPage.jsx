import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Spinner } from '../../../components/ui/Spinner';
import { ErrorAlert } from '../../../components/shared/ErrorAlert';
import Breadcrumb from '../../../components/shared/Breadcrumb';

const RoomListPage = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();

    // Get provider _id from localStorage
    const provider = localStorage.getItem('provider');
    const providerId = provider ? JSON.parse(provider)._id : null;
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const token = localStorage.getItem('token');
    useEffect(() => {
        fetchRooms();
    }, [hotelId]);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/hotel/provider/${providerId}/hotels/${hotelId}/rooms`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setRooms(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching rooms:', err);
            setError('Failed to load rooms');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (room) => {
        setRoomToDelete(room);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!roomToDelete) return;

        try {
            const response = await axios.delete(
                `/api/hotel/provider/${providerId}/hotels/${hotelId}/rooms/${roomToDelete._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success(`✓ Đã xóa phòng ${roomToDelete.roomNumber} thành công!`);
                setRooms(rooms.filter(r => r._id !== roomToDelete._id));
                setDeleteModalOpen(false);
                setRoomToDelete(null);
            }
        } catch (err) {
            console.error('Error deleting room:', err);
            toast.error(err.response?.data?.message || 'Không thể xóa phòng. Vui lòng thử lại.');
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setRoomToDelete(null);
    };

    const containerStyle = {
        minHeight: '100vh',
        padding: '2rem',
        color: '#1a1a1a'
    };

    const contentContainerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
    };

    const titleStyle = {
        fontSize: '2.5rem',
        fontWeight: '700',
        background: '#10b981',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    };

    const buttonStyle = {
        padding: '0.75rem 1.5rem',
        background: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0 0.5rem'
    };

    const theadStyle = {
        background: '#10b981',
        color: 'white'
    };

    const thStyle = {
        padding: '1rem',
        textAlign: 'left',
        fontWeight: '600',
        fontSize: '0.875rem'
    };

    const tdStyle = {
        padding: '1rem',
        background: '#f9fafb',
        fontSize: '0.95rem'
    };

    const statusBadgeStyle = (status) => {
        const colors = {
            available: '#10b981',
            occupied: '#f59e0b',
            maintenance: '#ef4444'
        };

        return {
            padding: '0.5rem 1rem',
            background: colors[status] || '#6b7280',
            color: 'white',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'inline-block'
        };
    };

    const actionButtonStyle = {
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginRight: '0.5rem'
    };

    if (loading) return <Spinner />;
    if (error) return <ErrorAlert message={error} />;

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/provider' },
        { label: 'Hotels', path: '/provider/hotels' },
        { label: 'Room Management' }
    ];

    return (
        <div style={containerStyle}>
            <div style={contentContainerStyle}>
                <Breadcrumb items={breadcrumbItems} />
                <div style={headerStyle}>
                    <div>
                        <h1 style={titleStyle}>Room Management</h1>
                        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                            Manage all rooms in your hotel
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            style={{
                                ...buttonStyle,
                                background: 'white',
                                color: '#10b981',
                                border: '2px solid #10b981'
                            }}
                            onClick={() => navigate(`/provider/hotels/${hotelId}/rooms/bulk-create`)}
                        >
                            🏗️ Bulk Create Rooms
                        </button>
                        <button
                            style={buttonStyle}
                            onClick={() => navigate(`/provider/hotels/${hotelId}/rooms/new`)}
                        >
                            Add New Room
                        </button>
                    </div>
                </div>

                {rooms.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏨</div>
                        <p style={{ fontSize: '1.25rem' }}>Chưa có phòng nào</p>
                        <p style={{ color: '#9CA3AF', marginTop: '0.5rem', marginBottom: '2rem' }}>
                            Bắt đầu bằng cách thêm phòng cho khách sạn của bạn
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => navigate(`/provider/hotels/${hotelId}/rooms/bulk-create`)}
                                style={{
                                    ...buttonStyle,
                                    background: 'white',
                                    color: '#10b981',
                                    border: '2px solid #10b981'
                                }}
                            >
                                🏗️ Tạo nhiều phòng cùng lúc
                            </button>
                            <button
                                onClick={() => navigate(`/provider/hotels/${hotelId}/rooms/new`)}
                                style={buttonStyle}
                            >
                                ➕ Tạo từng phòng
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyle}>
                            <thead style={theadStyle}>
                                <tr>
                                    <th style={{ ...thStyle, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>Room Number</th>
                                    <th style={thStyle}>Type</th>
                                    <th style={thStyle}>Floor</th>
                                    <th style={thStyle}>Capacity</th>
                                    <th style={thStyle}>Price/Night</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={{ ...thStyle, borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map((room, index) => (
                                    <tr
                                        key={room._id}
                                        onMouseEnter={() => setHoveredRow(index)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                        style={{
                                            transition: 'all 0.3s ease',
                                            transform: hoveredRow === index ? 'scale(1.01)' : 'scale(1)',
                                            boxShadow: hoveredRow === index ? '0 4px 15px rgba(0,0,0,0.1)' : 'none'
                                        }}
                                    >
                                        <td style={{ ...tdStyle, fontWeight: '600' }}>{room.roomNumber}</td>
                                        <td style={tdStyle}>{room.type}</td>
                                        <td style={tdStyle}>{room.floor}</td>
                                        <td style={tdStyle}>{room.capacity} persons</td>
                                        <td style={{ ...tdStyle, fontWeight: '600', color: '#10b981' }}>
                                            {room.pricePerNight.toLocaleString()}đ
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={statusBadgeStyle(room.status)}>
                                                {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => navigate(`/provider/hotels/${hotelId}/rooms/${room._id}/edit`)}
                                                style={{ ...actionButtonStyle, background: '#10b981', color: 'white' }}
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => navigate(`/provider/hotels/${hotelId}/rooms/${room._id}/edit`)}
                                                style={{ ...actionButtonStyle, background: '#3b82f6', color: 'white' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(room)}
                                                style={{ ...actionButtonStyle, background: '#ef4444', color: 'white' }}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗑️</div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                                Xác nhận xóa phòng
                            </h2>
                            <p style={{ color: '#6b7280' }}>
                                Bạn có chắc chắn muốn xóa phòng này không?
                            </p>
                        </div>

                        {roomToDelete && (
                            <div style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '12px',
                                padding: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: '600', color: '#374151' }}>Số phòng:</span>
                                    <span style={{ fontWeight: '700', color: '#ef4444' }}>{roomToDelete.roomNumber}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: '600', color: '#374151' }}>Loại phòng:</span>
                                    <span style={{ color: '#6b7280' }}>{roomToDelete.type}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: '600', color: '#374151' }}>Giá/đêm:</span>
                                    <span style={{ color: '#6b7280' }}>{roomToDelete.pricePerNight.toLocaleString()}đ</span>
                                </div>
                            </div>
                        )}

                        <div style={{
                            background: '#fef9c3',
                            border: '1px solid #fde047',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            marginBottom: '1.5rem',
                            fontSize: '0.875rem',
                            color: '#854d0e'
                        }}>
                            ⚠️ <strong>Lưu ý:</strong> Hành động này không thể hoàn tác!
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={handleCancelDelete}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: '#f3f4f6',
                                    color: '#374151',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = '#e5e7eb';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = '#f3f4f6';
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = '#dc2626';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = '#ef4444';
                                }}
                            >
                                🗑️ Xóa phòng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomListPage;