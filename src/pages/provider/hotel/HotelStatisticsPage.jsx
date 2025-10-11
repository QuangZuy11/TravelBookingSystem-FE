import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Spinner } from '../../../components/ui/Spinner';
import { ErrorAlert } from '../../../components/shared/ErrorAlert';

const HotelStatisticsPage = () => {
    const { hotelId } = useParams();
    const providerId = localStorage.getItem('providerId');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [availability, setAvailability] = useState(null);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, [hotelId]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, availRes, bookingsRes] = await Promise.all([
                axios.get(`/api/provider/${providerId}/hotel-statistics`),
                axios.get(`/api/provider/${providerId}/hotels/${hotelId}/availability`),
                axios.get(`/api/provider/${providerId}/hotels/${hotelId}/bookings`)
            ]);

            setStatistics(statsRes.data.data);
            setAvailability(availRes.data.data);
            setBookings(bookingsRes.data.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Spinner />;
    if (error) return <ErrorAlert message={error} />;

    const containerStyle = {
        padding: '2rem',
        background: '#f3f4f6'
    };

    const cardStyle = {
        background: 'white',
        borderRadius: '15px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        marginBottom: '1.5rem'
    };

    const statCardStyle = {
        ...cardStyle,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '150px'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse'
    };

    const thStyle = {
        textAlign: 'left',
        padding: '1rem',
        borderBottom: '2px solid #e5e7eb',
        color: '#374151',
        fontWeight: '600'
    };

    const tdStyle = {
        padding: '1rem',
        borderBottom: '1px solid #e5e7eb',
        color: '#6b7280'
    };

    return (
        <div style={containerStyle}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: '#1f2937' }}>
                Hotel Dashboard
            </h1>

            {/* Statistics Overview */}
            <div style={gridStyle}>
                <div style={statCardStyle}>
                    <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Total Revenue</h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                        {statistics?.totalRevenue?.toLocaleString()}đ
                    </p>
                </div>
                <div style={statCardStyle}>
                    <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Occupancy Rate</h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
                        {statistics?.occupancyRate}%
                    </p>
                </div>
                <div style={statCardStyle}>
                    <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Active Bookings</h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
                        {statistics?.activeBookings}
                    </p>
                </div>
            </div>

            {/* Room Availability */}
            <div style={cardStyle}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#374151' }}>
                    Room Availability
                </h2>
                <div style={gridStyle}>
                    {availability?.map((room) => (
                        <div key={room.roomType} style={{
                            padding: '1rem',
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb',
                            background: room.availableRooms > 0 ? '#f0fdf4' : '#fef2f2'
                        }}>
                            <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>{room.roomType}</h3>
                            <p style={{ 
                                color: room.availableRooms > 0 ? '#10b981' : '#ef4444',
                                fontWeight: '600'
                            }}>
                                {room.availableRooms} rooms available
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Bookings */}
            <div style={cardStyle}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#374151' }}>
                    Recent Bookings
                </h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Booking ID</th>
                                <th style={thStyle}>Guest Name</th>
                                <th style={thStyle}>Room Type</th>
                                <th style={thStyle}>Check-in</th>
                                <th style={thStyle}>Check-out</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking._id}>
                                    <td style={tdStyle}>{booking._id.slice(-6)}</td>
                                    <td style={tdStyle}>{booking.guestName}</td>
                                    <td style={tdStyle}>{booking.roomType}</td>
                                    <td style={tdStyle}>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                                    <td style={tdStyle}>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.875rem',
                                            color: 'white',
                                            background: 
                                                booking.status === 'confirmed' ? '#10b981' :
                                                booking.status === 'pending' ? '#f59e0b' :
                                                booking.status === 'cancelled' ? '#ef4444' : '#3b82f6'
                                        }}>
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HotelStatisticsPage;