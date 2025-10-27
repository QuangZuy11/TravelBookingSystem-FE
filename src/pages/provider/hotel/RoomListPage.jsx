import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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

    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    };

    const buttonStyle = {
        padding: '0.75rem 1.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                    <button
                        style={buttonStyle}
                        onClick={() => navigate(`/provider/hotels/${hotelId}/rooms/new`)}
                    >
                        Add New Room
                    </button>
                </div>

                {rooms.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏨</div>
                        <p style={{ fontSize: '1.25rem' }}>No rooms found</p>
                        <p style={{ color: '#9CA3AF', marginTop: '0.5rem' }}>
                            Start by adding a new room to your hotel
                        </p>
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
                                                style={{ ...actionButtonStyle, background: '#667eea', color: 'white' }}
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => navigate(`/provider/hotels/${hotelId}/rooms/${room._id}/edit`)}
                                                style={{ ...actionButtonStyle, background: '#10b981', color: 'white' }}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomListPage;