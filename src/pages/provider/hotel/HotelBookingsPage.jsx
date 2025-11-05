import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import ErrorAlert from '../../../components/shared/ErrorAlert';

const HotelBookingsPage = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const token = localStorage.getItem('token');

    // Get provider _id from localStorage
    const provider = localStorage.getItem('provider');
    const providerId = provider ? JSON.parse(provider)._id : null;

    useEffect(() => {
        fetchBookings();
    }, [hotelId]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/hotel/provider/${providerId}/bookings`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { hotelId }
            });
            if (response.data.success) {
                setBookings(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'cancelled': return '#ef4444';
            case 'completed': return '#6366f1';
            default: return '#6b7280';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'confirmed': return '✅ Xác nhận';
            case 'pending': return '⏳ Chờ xử lý';
            case 'cancelled': return '❌ Đã hủy';
            case 'completed': return '🎉 Hoàn thành';
            default: return status;
        }
    };

    const filteredBookings = bookings.filter(booking =>
        filterStatus === 'all' || booking.status === filterStatus
    );

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <button
                            onClick={() => navigate(`/provider/hotels/${hotelId}/overview`)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#667eea',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            ← Quay lại tổng quan
                        </button>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '0.5rem'
                        }}>
                            📅 Quản lý đặt phòng
                        </h1>
                        <p style={{ color: '#6b7280' }}>
                            Tổng cộng {filteredBookings.length} đặt phòng
                        </p>
                    </div>
                </div>

                {/* Filter */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: '600', color: '#374151' }}>Lọc theo trạng thái:</span>
                        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    border: '2px solid',
                                    borderColor: filterStatus === status ? '#667eea' : '#e5e7eb',
                                    background: filterStatus === status ? '#667eea' : 'white',
                                    color: filterStatus === status ? 'white' : '#374151',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {status === 'all' ? 'Tất cả' : getStatusLabel(status)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bookings List */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                }}>
                    {filteredBookings.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            color: '#6b7280'
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                Chưa có đặt phòng nào
                            </h3>
                            <p>
                                {filterStatus === 'all'
                                    ? 'Chưa có khách hàng nào đặt phòng tại khách sạn của bạn'
                                    : `Không có đặt phòng nào với trạng thái "${getStatusLabel(filterStatus)}"`
                                }
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gap: '1rem'
                        }}>
                            {filteredBookings.map((booking, index) => (
                                <div
                                    key={booking._id || index}
                                    style={{
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        background: '#f9fafb',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '1rem',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <h4 style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                color: '#1f2937',
                                                marginBottom: '0.5rem'
                                            }}>
                                                👤 {booking.guestName || 'Khách hàng'}
                                            </h4>
                                            <p style={{ color: '#6b7280', margin: 0 }}>
                                                📞 {booking.guestPhone || 'Chưa có SĐT'}
                                            </p>
                                        </div>

                                        <div>
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <strong>Phòng:</strong> {booking.roomNumber || 'TBD'}
                                            </div>
                                            <div style={{ color: '#6b7280' }}>
                                                <strong>Check-in:</strong> {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('vi-VN') : 'TBD'}
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <strong>Tổng tiền:</strong> {booking.totalAmount ? `${booking.totalAmount.toLocaleString()}đ` : 'TBD'}
                                            </div>
                                            <div style={{ color: '#6b7280' }}>
                                                <strong>Check-out:</strong> {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('vi-VN') : 'TBD'}
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'center' }}>
                                            <div
                                                style={{
                                                    display: 'inline-block',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '20px',
                                                    background: getStatusColor(booking.status),
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {getStatusLabel(booking.status)}
                                            </div>
                                        </div>
                                    </div>

                                    {booking.specialRequests && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '1rem',
                                            background: '#fef3c7',
                                            border: '1px solid #f59e0b',
                                            borderRadius: '8px'
                                        }}>
                                            <strong>Yêu cầu đặc biệt:</strong> {booking.specialRequests}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HotelBookingsPage;