import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import Breadcrumb from '../../components/shared/Breadcrumb';

const BookingManagementPage = () => {
    const navigate = useNavigate();
    const providerId = localStorage.getItem('providerId');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, upcoming, ongoing, completed, cancelled
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredRow, setHoveredRow] = useState(null);
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [availability, setAvailability] = useState(null);

    useEffect(() => {
        fetchHotels();
    }, []);

    useEffect(() => {
        if (selectedHotel) {
            fetchBookings();
            fetchAvailability();
        }
    }, [selectedHotel]);

    const fetchHotels = async () => {
        try {
            const response = await axios.get(`/api/hotel/provider/${providerId}/hotels`);
            if (response.data.success) {
                setHotels(response.data.data);
                if (response.data.data.length > 0) {
                    setSelectedHotel(response.data.data[0]);
                }
            }
        } catch (err) {
            console.error('Error fetching hotels:', err);
            setError('Failed to load hotels');
        }
    };

    const fetchAvailability = async () => {
        try {
            const response = await axios.get(`/api/hotel/provider/${providerId}/hotels/${selectedHotel._id}/availability`);
            if (response.data.success) {
                setAvailability(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching availability:', err);
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/hotel/provider/${providerId}/hotels/${selectedHotel._id}/bookings`);
            if (response.data.success) {
                setBookings(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (bookingId, newStatus) => {
        try {
            await axios.put(`/api/hotel/provider/${providerId}/bookings/${bookingId}`, {
                status: newStatus
            });
            alert('Booking status updated successfully!');
            fetchBookings(); // Refresh bookings list
        } catch (err) {
            console.error('Error updating booking:', err);
            alert('Failed to update booking status');
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesFilter = filter === 'all' || booking.status === filter;
        const matchesSearch = searchTerm === '' || 
            booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Styles
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
        WebkitTextFillColor: 'transparent',
        marginBottom: '0.5rem'
    };

    const filterContainerStyle = {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
    };

    const searchInputStyle = {
        padding: '0.75rem 1rem',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        fontSize: '1rem',
        width: '300px',
        transition: 'all 0.3s ease'
    };

    const filterButtonStyle = (isActive) => ({
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '12px',
        background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
        color: isActive ? 'white' : '#374151',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: isActive ? 'none' : '2px solid #e5e7eb'
    });

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
            confirmed: '#10b981',
            pending: '#f59e0b',
            cancelled: '#ef4444',
            completed: '#3b82f6'
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
        { label: 'Booking Management' }
    ];

    return (
        <div style={containerStyle}>
            <div style={contentContainerStyle}>
                <Breadcrumb items={breadcrumbItems} />
                <div style={headerStyle}>
                    <div>
                        <h1 style={titleStyle}>Booking Management</h1>
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <select
                                value={selectedHotel?._id || ''}
                                onChange={(e) => {
                                    const hotel = hotels.find(h => h._id === e.target.value);
                                    setSelectedHotel(hotel);
                                }}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    fontSize: '1rem',
                                    minWidth: '200px'
                                }}
                            >
                                {hotels.map(hotel => (
                                    <option key={hotel._id} value={hotel._id}>
                                        {hotel.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {availability && (
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ textAlign: 'center', padding: '0.5rem 1rem' }}>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                                    {availability.availableRooms}
                                </div>
                                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Available Rooms</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '0.5rem 1rem', borderLeft: '2px solid #e5e7eb' }}>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
                                    {availability.totalRooms - availability.availableRooms}
                                </div>
                                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Booked Rooms</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '0.5rem 1rem', borderLeft: '2px solid #e5e7eb' }}>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#6b7280' }}>
                                    {availability.totalRooms}
                                </div>
                                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Rooms</div>
                            </div>
                        </div>
                    )}
                </div>

                <div style={filterContainerStyle}>
                    <input
                        type="text"
                        placeholder="Search by guest name or booking ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchInputStyle}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                style={filterButtonStyle(filter === status)}
                                onMouseEnter={(e) => {
                                    if (filter !== status) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (filter !== status) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredBookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
                        <p style={{ fontSize: '1.25rem' }}>No bookings found</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyle}>
                            <thead style={theadStyle}>
                                <tr>
                                    <th style={{...thStyle, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px'}}>Booking ID</th>
                                    <th style={thStyle}>Guest Name</th>
                                    <th style={thStyle}>Room</th>
                                    <th style={thStyle}>Check-in</th>
                                    <th style={thStyle}>Check-out</th>
                                    <th style={thStyle}>Total Price</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={{...thStyle, borderTopRightRadius: '12px', borderBottomRightRadius: '12px'}}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((booking, index) => (
                                    <tr 
                                        key={booking._id}
                                        onMouseEnter={() => setHoveredRow(index)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                        style={{
                                            transition: 'all 0.3s ease',
                                            transform: hoveredRow === index ? 'scale(1.01)' : 'scale(1)',
                                            boxShadow: hoveredRow === index ? '0 4px 15px rgba(0,0,0,0.1)' : 'none'
                                        }}
                                    >
                                        <td style={{...tdStyle, fontWeight: '600'}}>#{booking._id.slice(-6)}</td>
                                        <td style={tdStyle}>{booking.guestName}</td>
                                        <td style={tdStyle}>{booking.roomNumber}</td>
                                        <td style={tdStyle}>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                                        <td style={tdStyle}>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                                        <td style={{...tdStyle, fontWeight: '600', color: '#10b981'}}>
                                            {booking.totalPrice.toLocaleString()}đ
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={statusBadgeStyle(booking.status)}>
                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => navigate(`/provider/bookings/${booking._id}`)}
                                                style={{...actionButtonStyle, background: '#667eea', color: 'white'}}
                                            >
                                                View Details
                                            </button>
                                            {booking.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                                                        style={{...actionButtonStyle, background: '#10b981', color: 'white'}}
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                                                        style={{...actionButtonStyle, background: '#ef4444', color: 'white'}}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
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

export default BookingManagementPage;