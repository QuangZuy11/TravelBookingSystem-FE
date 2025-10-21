import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Breadcrumb from '../../../components/shared/Breadcrumb';
import axios from 'axios';
import LoadingSpinner from '../../../components/ui/Spinner';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import HotelForm from '../../../components/provider/forms/HotelForm';
import RoomForm from '../../../components/provider/forms/RoomForm';
import Modal from '../../../components/shared/Modal';
import { getProxiedGoogleDriveUrl } from '../../../utils/googleDriveImageHelper';

const HotelDetailsPage = () => {
    const providerId = localStorage.getItem('providerId');
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('rooms');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRoomFormModalOpen, setIsRoomFormModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [hoveredRow, setHoveredRow] = useState(null);
    const token = localStorage.getItem('token');

    const fetchHotelDetails = async () => {
        try {
            setLoading(true);
            const hotelsResponse = await axios.get(`/api/hotel/provider/${providerId}/hotels`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const foundHotel = hotelsResponse.data.data.find(h => h._id === hotelId);

            if (!foundHotel) {
                setError('Hotel not found.');
                setLoading(false);
                return;
            }
            setHotel(foundHotel);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch hotel details.');
            setLoading(false);
            console.error(err);
        }
    };

    const fetchRoomsForHotel = async () => {
        try {
            const response = await axios.get(`/api/hotel/provider/${providerId}/hotels/${hotelId}/rooms`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(response.data.data);
        } catch (err) {
            console.error('Failed to fetch rooms for hotel:', err);
        }
    };

    const fetchBookingsForHotel = async () => {
        try {
            const response = await axios.get(`/api/hotel/provider/${providerId}/hotels/${hotelId}/bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(response.data.data);
        } catch (err) {
            console.error('Failed to fetch bookings for hotel:', err);
        }
    };

    useEffect(() => {
        fetchHotelDetails();
    }, [providerId, hotelId]);

    useEffect(() => {
        if (activeTab === 'rooms' && hotel) {
            fetchRoomsForHotel();
        }
        if (activeTab === 'bookings' && hotel) {
            fetchBookingsForHotel();
        }
    }, [activeTab, hotel]);

    const handleEditHotel = () => navigate(`/provider/hotels/${hotelId}/edit`);

    const handleUpdateHotelSubmit = async (formData) => {
        try {
            await axios.put(`/api/hotel/provider/${providerId}/hotels/${hotelId}`, formData,
                { headers: { Authorization: `Bearer ${token}` } });
            alert('Hotel updated successfully!');
            setIsEditModalOpen(false);
            fetchHotelDetails();
        } catch (err) {
            alert('Failed to update hotel.');
            console.error(err);
        }
    };

    const handleDeleteHotel = async () => {
        if (window.confirm('Are you sure you want to delete this hotel and all its associated data?')) {
            try {
                await axios.delete(`/api/hotel/provider/${providerId}/hotels/${hotelId}`);
                alert('Hotel deleted successfully!');
                navigate(`/provider/${providerId}/hotels`);
            } catch (err) {
                alert('Failed to delete hotel.');
                console.error(err);
            }
        }
    };

    const handleAddRoomType = () => {
        navigate(`/provider/hotels/${hotelId}/rooms/new`);
    };

    const handleEditRoomType = (room) => {
        navigate(`/provider/hotels/${hotelId}/rooms/${room._id}/edit`);
    };

    const handleRoomFormSubmit = async (formData) => {
        try {
            if (editingRoom) {
                await axios.put(`/api/hotel/provider/${providerId}/hotels/${hotelId}/rooms/${editingRoom._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Room type updated successfully!');
            } else {
                await axios.post(`/api/hotel/provider/${providerId}/hotels/${hotelId}/rooms`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Room type created successfully!');
            }
            setIsRoomFormModalOpen(false);
            fetchRoomsForHotel();
        } catch (err) {
            alert('Failed to save room type.');
            console.error(err);
        }
    };

    const handleDeleteRoomType = async (roomId) => {
        if (window.confirm('Are you sure you want to delete this room type?')) {
            try {
                await axios.delete(`/api/hotel/provider/${providerId}/hotels/${hotelId}/rooms/${roomId}`);
                alert('Room type deleted successfully!');
                fetchRoomsForHotel();
            } catch (err) {
                alert('Failed to delete room type.');
                console.error(err);
            }
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;
    if (!hotel) return <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Hotel data not found.</div>;

    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'Dashboard', path: '/provider' },
        { label: 'Hotels', path: '/provider/hotels' },
        { label: hotel?.name || 'Hotel Details' }
    ];

    // Styles
    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '2rem',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
    };

    const titleStyle = {
        fontSize: '2.5rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    };

    const buttonGroupStyle = {
        display: 'flex',
        gap: '1rem'
    };

    const buttonStyle = {
        padding: '0.875rem 1.5rem',
        borderRadius: '12px',
        border: 'none',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    };

    const editButtonStyle = {
        ...buttonStyle,
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: 'white',
        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
    };

    const deleteButtonStyle = {
        ...buttonStyle,
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white',
        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
    };

    const summaryCardStyle = {
        background: 'white',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        marginBottom: '2rem'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
    };

    const imageStyle = {
        width: '100%',
        height: '300px',
        objectFit: 'cover',
        borderRadius: '16px',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
    };

    const sectionTitleStyle = {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937',
        // marginBottom: '1rem'
    };

    const infoBlockStyle = {
        marginBottom: '1.5rem'
    };

    const labelStyle = {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.5rem'
    };

    const valueStyle = {
        fontSize: '1rem',
        color: '#374151',
        lineHeight: '1.6'
    };

    const tagStyle = {
        display: 'inline-block',
        padding: '0.5rem 1rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: '500',
        marginRight: '0.5rem',
        marginBottom: '0.5rem'
    };

    const tabContainerStyle = {
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
    };

    const tabNavStyle = {
        display: 'flex',
        borderBottom: '3px solid #e5e7eb',
        marginBottom: '2rem',
        gap: '1rem'
    };

    const tabButtonStyle = (isActive) => ({
        padding: '1rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        background: 'transparent',
        border: 'none',
        borderBottom: isActive ? '3px solid #667eea' : '3px solid transparent',
        color: isActive ? '#667eea' : '#6b7280',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginBottom: '-3px'
    });

    const addButtonStyle = {
        padding: '1rem 2rem',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        borderRadius: '12px',
        border: 'none',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
        transition: 'all 0.3s ease',
        marginBottom: '1.5rem'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0 0.5rem'
    };

    const theadStyle = {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };

    const thStyle = {
        padding: '1rem',
        textAlign: 'left',
        color: 'white',
        fontWeight: '600',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    };

    const trStyle = {
        background: '#f9fafb',
        transition: 'all 0.3s ease'
    };

    const tdStyle = {
        padding: '1.25rem 1rem',
        fontSize: '0.95rem',
        color: '#374151'
    };

    const statusBadgeStyle = (status) => {
        const colors = {
            active: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            inactive: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            confirmed: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            pending: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            cancelled: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        };

        return {
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            background: colors[status] || colors.pending,
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'inline-block'
        };
    };

    const actionLinkStyle = {
        padding: '0.5rem 1rem',
        marginRight: '0.5rem',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: '600',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        display: 'inline-block'
    };

    const viewLinkStyle = {
        ...actionLinkStyle,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
    };

    const editLinkStyle = {
        ...actionLinkStyle,
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: 'white'
    };

    const deleteLinkStyle = {
        ...actionLinkStyle,
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white'
    };

    const emptyStateStyle = {
        textAlign: 'center',
        padding: '4rem 2rem',
        color: '#6b7280'
    };

    return (
        <div style={containerStyle}>
            <Breadcrumb items={breadcrumbItems} />
            {/* Hotel Summary */}
            <div style={summaryCardStyle}>
                <div style={gridStyle}>
                    <div>
                        {hotel.images && hotel.images.length > 0 ? (
                            <img src={getProxiedGoogleDriveUrl(hotel.images[0])} alt={hotel.name} style={imageStyle} />
                        ) : (
                            <div style={{
                                ...imageStyle,
                                background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem'
                            }}>
                                🏨
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h2 style={sectionTitleStyle}>{hotel.name}</h2>
                            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                                {'⭐'.repeat(hotel.starRating || 3)} {hotel.starRating || 3} Stars
                            </p>
                        </div>
                        <div style={infoBlockStyle}>
                            <p style={labelStyle}>📍 Address</p>
                            <p style={valueStyle}>
                                {hotel.address.street}, {hotel.address.city}, {hotel.address.state}, {hotel.address.country} {hotel.address.zipCode}
                            </p>
                        </div>
                        <div>

                        </div>
                        <div style={infoBlockStyle}>
                            <p style={labelStyle}>Description</p>
                            <p style={valueStyle}>{hotel.description}</p>
                        </div>
                    </div>

                    <div>
                        <div style={buttonGroupStyle}>
                            <button
                                onClick={handleEditHotel}
                                style={editButtonStyle}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.3)';
                                }}
                            >
                                ✏️ Edit Hotel
                            </button>
                            <button
                                onClick={handleDeleteHotel}
                                style={deleteButtonStyle}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                                }}
                            >
                                🗑️ Delete Hotel
                            </button>
                        </div>
                        <div style={infoBlockStyle}>
                            <p style={labelStyle}>📞 Contact Information</p>
                            <p style={valueStyle}>Email: {hotel.contactInfo.email}</p>
                            <p style={valueStyle}>Phone: {hotel.contactInfo.phone}</p>
                            {hotel.contactInfo.website && (
                                <p style={valueStyle}>
                                    Website: <a href={hotel.contactInfo.website} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
                                        {hotel.contactInfo.website}
                                    </a>
                                </p>
                            )}
                        </div>

                        <div style={infoBlockStyle}>
                            <p style={labelStyle}>⏰ Check-in / Check-out</p>
                            <p style={valueStyle}>Check-in: {hotel.policies.checkInTime}</p>
                            <p style={valueStyle}>Check-out: {hotel.policies.checkOutTime}</p>
                        </div>

                        <div style={infoBlockStyle}>
                            <p style={labelStyle}>📋 Cancellation Policy</p>
                            <p style={valueStyle}>{hotel.policies.cancellationPolicy || 'Not specified'}</p>
                        </div>

                        <div style={infoBlockStyle}>
                            <p style={labelStyle}>💳 Payment Options</p>
                            <div>
                                {hotel.policies.paymentOptions.map((option, index) => (
                                    <span key={index} style={tagStyle}>{option}</span>
                                ))}
                            </div>
                        </div>

                        <div style={infoBlockStyle}>
                            <p style={labelStyle}>🐾 Pets</p>
                            <p style={valueStyle}>{hotel.policies.petsAllowed ? '✅ Allowed' : '❌ Not Allowed'}</p>
                        </div>

                        <div style={infoBlockStyle}>
                            <p style={labelStyle}>✨ Amenities</p>
                            <div>
                                {hotel.amenities && hotel.amenities.map((amenity, index) => (
                                    <span key={index} style={tagStyle}>{amenity}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={tabContainerStyle}>
                <div style={tabNavStyle}>
                    <button
                        style={tabButtonStyle(activeTab === 'rooms')}
                        onClick={() => setActiveTab('rooms')}
                        onMouseEnter={(e) => {
                            if (activeTab !== 'rooms') e.currentTarget.style.color = '#374151';
                        }}
                        onMouseLeave={(e) => {
                            if (activeTab !== 'rooms') e.currentTarget.style.color = '#6b7280';
                        }}
                    >
                        🛏️ Rooms ({rooms.length})
                    </button>
                    <button
                        style={tabButtonStyle(activeTab === 'bookings')}
                        onClick={() => setActiveTab('bookings')}
                        onMouseEnter={(e) => {
                            if (activeTab !== 'bookings') e.currentTarget.style.color = '#374151';
                        }}
                        onMouseLeave={(e) => {
                            if (activeTab !== 'bookings') e.currentTarget.style.color = '#6b7280';
                        }}
                    >
                        📅 Bookings ({bookings.length})
                    </button>
                    <button
                        style={tabButtonStyle(activeTab === 'reviews')}
                        onClick={() => setActiveTab('reviews')}
                        onMouseEnter={(e) => {
                            if (activeTab !== 'reviews') e.currentTarget.style.color = '#374151';
                        }}
                        onMouseLeave={(e) => {
                            if (activeTab !== 'reviews') e.currentTarget.style.color = '#6b7280';
                        }}
                    >
                        ⭐ Reviews (N/A)
                    </button>
                </div>

                {/* Rooms Tab */}
                {activeTab === 'rooms' && (
                    <div>
                        <button
                            onClick={handleAddRoomType}
                            style={addButtonStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                            }}
                        >
                            + Add New Room
                        </button>

                        {rooms.length === 0 ? (
                            <div style={emptyStateStyle}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛏️</div>
                                <p style={{ fontSize: '1.25rem' }}>No rooms found for this hotel.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={tableStyle}>
                                    <thead style={theadStyle}>
                                        <tr>
                                            <th style={{ ...thStyle, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>Room Number</th>
                                            <th style={thStyle}>Type</th>
                                            <th style={thStyle}>Capacity</th>
                                            <th style={thStyle}>Floor</th>
                                            <th style={thStyle}>Price/Night</th>
                                            <th style={thStyle}>Status</th>
                                            <th style={{ ...thStyle, borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rooms.map((room, index) => (
                                            <tr
                                                key={room._id}
                                                style={{
                                                    ...trStyle,
                                                    ...(hoveredRow === `room-${index}` ? {
                                                        background: 'white',
                                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                                    } : {})
                                                }}
                                                onMouseEnter={() => setHoveredRow(`room-${index}`)}
                                                onMouseLeave={() => setHoveredRow(null)}
                                            >
                                                <td style={{ ...tdStyle, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', fontWeight: '600' }}>
                                                    Room #{room.roomNumber}
                                                </td>
                                                <td style={tdStyle}>{room.type}</td>
                                                <td style={tdStyle}>{room.capacity} guests</td>
                                                <td style={tdStyle}>Floor {room.floor}</td>
                                                <td style={{ ...tdStyle, fontWeight: '600', color: '#10b981' }}>
                                                    {room.pricePerNight.toLocaleString()}đ
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={statusBadgeStyle(room.status)}>{room.status}</span>
                                                </td>
                                                <td style={{ ...tdStyle, borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                                                    <Link
                                                        to={`/provider/hotels/${hotelId}/rooms/${room._id}/edit`}
                                                        style={viewLinkStyle}
                                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                    >
                                                        View
                                                    </Link>
                                                    <button
                                                        onClick={() => handleEditRoomType(room)}
                                                        style={{ ...editLinkStyle, border: 'none', cursor: 'pointer' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRoomType(room._id)}
                                                        style={{ ...deleteLinkStyle, border: 'none', cursor: 'pointer' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Bookings Tab */}
                {activeTab === 'bookings' && (
                    <div>
                        {bookings.length === 0 ? (
                            <div style={emptyStateStyle}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
                                <p style={{ fontSize: '1.25rem' }}>No bookings found for this hotel.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={tableStyle}>
                                    <thead style={theadStyle}>
                                        <tr>
                                            <th style={{ ...thStyle, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>Booking ID</th>
                                            <th style={thStyle}>Customer</th>
                                            <th style={thStyle}>Room Type</th>
                                            <th style={thStyle}>Check-in</th>
                                            <th style={thStyle}>Check-out</th>
                                            <th style={thStyle}>Total Price</th>
                                            <th style={thStyle}>Status</th>
                                            <th style={{ ...thStyle, borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((booking, index) => (
                                            <tr
                                                key={booking._id}
                                                style={{
                                                    ...trStyle,
                                                    ...(hoveredRow === `booking-${index}` ? {
                                                        background: 'white',
                                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                                    } : {})
                                                }}
                                                onMouseEnter={() => setHoveredRow(`booking-${index}`)}
                                                onMouseLeave={() => setHoveredRow(null)}
                                            >
                                                <td style={{ ...tdStyle, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', fontWeight: '600' }}>
                                                    #{booking._id.slice(-6)}
                                                </td>
                                                <td style={tdStyle}>{booking.userId}</td>
                                                <td style={tdStyle}>{booking.roomTypeId}</td>
                                                <td style={tdStyle}>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                                                <td style={tdStyle}>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                                                <td style={{ ...tdStyle, fontWeight: '600', color: '#10b981' }}>${booking.totalPrice}</td>
                                                <td style={tdStyle}>
                                                    <span style={statusBadgeStyle(booking.status)}>{booking.status}</span>
                                                </td>
                                                <td style={{ ...tdStyle, borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                                                    <Link
                                                        to={`/provider/${providerId}/bookings/${booking._id}`}
                                                        style={viewLinkStyle}
                                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                    <div style={emptyStateStyle}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⭐</div>
                        <p style={{ fontSize: '1.25rem' }}>Reviews functionality coming soon.</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Hotel Details">
                <HotelForm initialData={hotel} onSubmit={handleUpdateHotelSubmit} />
            </Modal>

            <Modal isOpen={isRoomFormModalOpen} onClose={() => setIsRoomFormModalOpen(false)} title={editingRoom ? 'Edit Room Type' : 'Add New Room Type'}>
                <RoomForm initialData={editingRoom} onSubmit={handleRoomFormSubmit} hotelId={hotelId} />
            </Modal>
        </div>
    );
};

export default HotelDetailsPage;