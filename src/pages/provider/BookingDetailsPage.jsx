import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import Breadcrumb from '../../components/shared/Breadcrumb';

const BookingDetailsPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const providerId = localStorage.getItem('providerId');
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/hotel/provider/${providerId}/bookings/${bookingId}`);
            if (response.data.success) {
                setBooking(response.data.data);
            } else {
                setError('Booking not found');
            }
        } catch (err) {
            console.error('Error fetching booking:', err);
            setError('Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            await axios.put(`/api/hotel/provider/${providerId}/bookings/${bookingId}`, {
                status: newStatus
            });
            alert('Booking status updated successfully!');
            fetchBookingDetails();
        } catch (err) {
            console.error('Error updating booking:', err);
            alert('Failed to update booking status');
        }
    };

    if (loading) return <Spinner />;
    if (error) return <ErrorAlert message={error} />;
    if (!booking) return <ErrorAlert message="Booking not found" />;

    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
    };

    const contentStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
    };

    const headerStyle = {
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e5e7eb'
    };

    const titleStyle = {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '0.5rem'
    };

    const statusBadgeStyle = {
        display: 'inline-block',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: 'white',
        background: booking.status === 'confirmed' ? '#10b981' :
                   booking.status === 'pending' ? '#f59e0b' :
                   booking.status === 'cancelled' ? '#ef4444' :
                   '#3b82f6'
    };

    const sectionStyle = {
        marginBottom: '2rem'
    };

    const sectionTitleStyle = {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '1rem'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
    };

    const labelStyle = {
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#6b7280',
        marginBottom: '0.25rem'
    };

    const valueStyle = {
        fontSize: '1rem',
        color: '#1f2937',
        fontWeight: '500'
    };

    const buttonStyle = {
        padding: '0.75rem 1.5rem',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: 'none',
        marginRight: '0.5rem'
    };

    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                <button
                    onClick={() => navigate('/provider/bookings')}
                    style={{
                        marginBottom: '2rem',
                        padding: '0.75rem 1.5rem',
                        background: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#667eea',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                >
                    ← Back to Bookings
                </button>

                <div style={headerStyle}>
                    <h1 style={titleStyle}>Booking Details #{booking._id.slice(-6)}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <span style={statusBadgeStyle}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        {booking.status === 'pending' && (
                            <div>
                                <button
                                    onClick={() => handleUpdateStatus('confirmed')}
                                    style={{...buttonStyle, background: '#10b981', color: 'white'}}
                                >
                                    Confirm Booking
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus('cancelled')}
                                    style={{...buttonStyle, background: '#ef4444', color: 'white'}}
                                >
                                    Cancel Booking
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>Guest Information</h2>
                    <div style={gridStyle}>
                        <div>
                            <p style={labelStyle}>Guest Name</p>
                            <p style={valueStyle}>{booking.guestName}</p>
                        </div>
                        <div>
                            <p style={labelStyle}>Email</p>
                            <p style={valueStyle}>{booking.guestEmail}</p>
                        </div>
                        <div>
                            <p style={labelStyle}>Phone</p>
                            <p style={valueStyle}>{booking.guestPhone}</p>
                        </div>
                    </div>
                </div>

                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>Booking Details</h2>
                    <div style={gridStyle}>
                        <div>
                            <p style={labelStyle}>Room Number</p>
                            <p style={valueStyle}>{booking.roomNumber}</p>
                        </div>
                        <div>
                            <p style={labelStyle}>Check-in Date</p>
                            <p style={valueStyle}>{new Date(booking.checkInDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p style={labelStyle}>Check-out Date</p>
                            <p style={valueStyle}>{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p style={labelStyle}>Total Price</p>
                            <p style={{ ...valueStyle, color: '#10b981', fontWeight: '600' }}>
                                {booking.totalPrice.toLocaleString()}đ
                            </p>
                        </div>
                    </div>
                </div>

                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>Special Requests</h2>
                    <p style={valueStyle}>
                        {booking.specialRequests || 'No special requests'}
                    </p>
                </div>

                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>Payment Information</h2>
                    <div style={gridStyle}>
                        <div>
                            <p style={labelStyle}>Payment Status</p>
                            <p style={{ ...valueStyle, color: booking.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }}>
                                {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                            </p>
                        </div>
                        <div>
                            <p style={labelStyle}>Payment Method</p>
                            <p style={valueStyle}>{booking.paymentMethod}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsPage;