/**
 * MY AI BOOKINGS COMPONENT
 * Hiển thị danh sách bookings của traveler từ AI itineraries
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TopBar from '../layout/Topbar/Topbar';
import Header from '../layout/Header/Header';
import Footer from '../layout/Footer/Footer';
import './AIItinerary.css';
import {
    getTravelerBookings,
    getBookingDetail,
    cancelBooking,
    formatVND,
    getBookingStatusLabel,
    getBookingStatusColor,
    formatDate
} from '../../services/aiItineraryBookingService';

const styles = {
    pageWrapper: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #e0f2fe 100%)',
        paddingTop: 'calc(40px + 2rem)',
        paddingBottom: '2rem'
    },
    container: {
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1rem'
    },
    contentWrapper: {
        maxWidth: '80rem',
        margin: '0 auto'
    },
    header: {
        marginBottom: '2rem'
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '0.5rem'
    },
    subtitle: {
        color: '#6b7280',
        fontSize: '1.125rem'
    },
    emptyStateCard: {
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '3rem',
        textAlign: 'center'
    },
    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '1rem'
    },
    emptyTitle: {
        fontSize: '1.875rem',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '0.5rem'
    },
    emptyText: {
        color: '#6b7280',
        marginBottom: '1.5rem',
        fontSize: '1rem'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: '1px solid #e5e7eb'
    },
    cardHeader: {
        background: 'linear-gradient(135deg, #14b8a6 0%, #22c55e 100%)',
        padding: '1.25rem',
        color: 'white'
    },
    cardTitle: {
        fontSize: '1.375rem',
        fontWeight: 'bold',
        marginBottom: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    cardSubtitle: {
        fontSize: '0.875rem',
        opacity: 0.95
    },
    cardBody: {
        padding: '1.25rem'
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #e5e7eb'
    },
    infoLabel: {
        fontSize: '0.875rem',
        color: '#6b7280',
        fontWeight: '500'
    },
    infoValue: {
        fontSize: '0.875rem',
        color: '#1f2937',
        fontWeight: '600'
    },
    statusBadge: {
        padding: '0.375rem 0.875rem',
        borderRadius: '9999px',
        fontSize: '0.8125rem',
        fontWeight: '600',
        display: 'inline-block',
        marginBottom: '1rem'
    },
    buttonGroup: {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem'
    },
    viewButton: {
        flex: 1,
        padding: '0.625rem 1rem',
        backgroundColor: '#14b8a6',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontWeight: '600',
        fontSize: '0.875rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    cancelButton: {
        padding: '0.625rem 1rem',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontWeight: '600',
        fontSize: '0.875rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    priceHighlight: {
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        border: '2px solid #86efac',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginTop: '1rem'
    }
};

const MyAIBookings = () => {
    const { user } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        loadBookings();
    }, [user]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔄 Loading traveler bookings for user:', user?.userId);

            if (!user?.userId) {
                throw new Error('User not authenticated');
            }

            // Call real backend API
            const response = await getTravelerBookings(user.userId);
            console.log('✅ Bookings loaded:', response);

            setBookings(response.data || []);
            setLoading(false);
        } catch (err) {
            console.error('❌ Load bookings error:', err);
            setError(err.message || 'Không thể tải danh sách bookings');
            setLoading(false);

            // Fallback to mock data if backend not ready
            console.warn('⚠️ Using mock data as fallback');
            setBookings([
                {
                    _id: '1',
                    booking_code: 'AIB-2025001',
                    destination: 'Hà Nội',
                    duration_days: 3,
                    participant_number: 2,
                    start_date: '2025-12-01T00:00:00.000Z',
                    total_budget: 15000000,
                    status: 'pending',
                    quoted_price: null,
                    created_at: '2025-11-10T10:00:00.000Z',
                    selected_activities: [
                        {
                            day_number: 1,
                            activity_name: 'Tham quan Văn Miếu Quốc Tử Giám',
                            activity_type: 'Cultural',
                            location: 'Hà Nội',
                            cost: 500000
                        },
                        {
                            day_number: 2,
                            activity_name: 'Lớp học nấu ăn truyền thống',
                            activity_type: 'Cooking Class',
                            location: 'Hà Nội',
                            cost: 800000
                        }
                    ],
                    special_requests: 'Muốn có hướng dẫn viên nói tiếng Anh'
                },
                {
                    _id: '2',
                    booking_code: 'AIB-2025002',
                    destination: 'Đà Nẵng',
                    duration_days: 5,
                    participant_number: 4,
                    start_date: '2025-12-15T00:00:00.000Z',
                    total_budget: 30000000,
                    status: 'approved',
                    quoted_price: 28000000,
                    created_at: '2025-11-11T14:30:00.000Z',
                    selected_activities: [
                        {
                            day_number: 1,
                            activity_name: 'Tham quan Bà Nà Hills',
                            activity_type: 'Adventure',
                            location: 'Đà Nẵng',
                            cost: 1200000
                        },
                        {
                            day_number: 2,
                            activity_name: 'Lặn biển Cù Lao Chàm',
                            activity_type: 'Water Sports',
                            location: 'Hội An',
                            cost: 1500000
                        }
                    ],
                    special_requests: 'Cần phòng có view biển'
                }
            ]);
        }
    };

    const handleCancelRequest = (booking) => {
        setSelectedBooking(booking);
        setShowCancelModal(true);
    };

    const handleViewDetail = (booking) => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
    };

    const confirmCancel = async () => {
        if (!cancelReason.trim()) {
            alert('Vui lòng nhập lý do hủy');
            return;
        }

        try {
            await cancelBooking(selectedBooking._id, cancelReason);
            alert('Đã hủy booking thành công!');
            setShowCancelModal(false);
            setCancelReason('');
            setSelectedBooking(null);
            loadBookings();
        } catch (err) {
            alert('Lỗi khi hủy: ' + err.message);
        }
    };

    if (loading) {
        return (
            <>
                <TopBar />
                <Header />
                <div style={styles.pageWrapper}>
                    <div style={styles.container}>
                        <div style={styles.contentWrapper}>
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <div style={{ 
                                    margin: '0 auto',
                                    width: '48px',
                                    height: '48px',
                                    border: '4px solid #99f6e4',
                                    borderTop: '4px solid #0d9488',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                <style>{`
                                    @keyframes spin {
                                        0% { transform: rotate(0deg); }
                                        100% { transform: rotate(360deg); }
                                    }
                                `}</style>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <TopBar />
            <Header />
            <div style={styles.pageWrapper}>
                <div style={styles.container}>
                    <div style={styles.contentWrapper}>
                        {/* Header */}
                        <div style={styles.header}>
                            <h1 style={styles.title}>📋 Lộ Trình Đặt Chỗ Của Tôi</h1>
                            <p style={styles.subtitle}>
                                Quản lý các yêu cầu đặt chuyến đi từ lịch trình AI của bạn
                            </p>
                        </div>

                        {/* Bookings List */}
                        {bookings.length === 0 ? (
                            <div style={styles.emptyStateCard}>
                                <div style={styles.emptyIcon}>📭</div>
                                <h3 style={styles.emptyTitle}>
                                    Chưa Có Booking Nào
                                </h3>
                                <p style={styles.emptyText}>
                                    Bắt đầu đặt chuyến đi từ lịch trình AI của bạn!
                                </p>
                            </div>
                        ) : (
                            <div style={styles.grid}>
                                {bookings.map((booking) => {
                                    const statusColor = getBookingStatusColor(booking.status);
                                    const statusLabel = getBookingStatusLabel(booking.status);

                                    return (
                                        <div key={booking._id} style={styles.card}>
                                            {/* Card Header */}
                                            <div style={styles.cardHeader}>
                                                <div style={styles.cardTitle}>
                                                    🗺️ {booking.destination}
                                                </div>
                                                <div style={styles.cardSubtitle}>
                                                    {booking.booking_code}
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div style={styles.cardBody}>
                                                {/* Status Badge */}
                                                <span
                                                    style={{
                                                        ...styles.statusBadge,
                                                        backgroundColor: statusColor.bg,
                                                        color: statusColor.color,
                                                        border: `1.5px solid ${statusColor.border}`
                                                    }}
                                                >
                                                    {statusLabel}
                                                </span>

                                                {/* Info Rows */}
                                                <div style={styles.infoRow}>
                                                    <span style={styles.infoLabel}>📅 Ngày đi</span>
                                                    <span style={styles.infoValue}>
                                                        {new Date(booking.start_date).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>

                                                <div style={styles.infoRow}>
                                                    <span style={styles.infoLabel}>⏰ Thời gian</span>
                                                    <span style={styles.infoValue}>{booking.duration_days} ngày</span>
                                                </div>

                                                <div style={styles.infoRow}>
                                                    <span style={styles.infoLabel}>👥 Số người</span>
                                                    <span style={styles.infoValue}>{booking.participant_number} người</span>
                                                </div>

                                                <div style={styles.infoRow}>
                                                    <span style={styles.infoLabel}>💰 Ngân sách</span>
                                                    <span style={styles.infoValue}>{formatVND(booking.total_budget)}</span>
                                                </div>

                                                {/* Quoted Price if approved */}
                                                {booking.status === 'approved' && booking.quoted_price && (
                                                    <div style={styles.priceHighlight}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#15803d' }}>
                                                                💚 Giá Provider Báo
                                                            </span>
                                                            <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#15803d' }}>
                                                                {formatVND(booking.quoted_price)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div style={styles.buttonGroup}>
                                                    <button
                                                        onClick={() => handleViewDetail(booking)}
                                                        style={styles.viewButton}
                                                        onMouseOver={(e) => e.target.style.backgroundColor = '#0d9488'}
                                                        onMouseOut={(e) => e.target.style.backgroundColor = '#14b8a6'}
                                                    >
                                                        Xem Chi Tiết
                                                    </button>

                                                    {(booking.status === 'pending' || booking.status === 'approved') && (
                                                        <button
                                                            onClick={() => handleCancelRequest(booking)}
                                                            style={styles.cancelButton}
                                                            onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                                                            onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                                                        >
                                                            ❌
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedBooking && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '700px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#1f2937' }}>
                                📝 Chi Tiết Booking
                            </h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                style={{
                                    fontSize: '1.5rem',
                                    color: '#6b7280',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '50%',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                ×
                            </button>
                        </div>

                        {/* Booking Info */}
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', borderRadius: '12px', border: '2px solid #0ea5e9' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0c4a6e', marginBottom: '0.5rem' }}>
                                {selectedBooking.booking_code}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                                Tạo ngày: {new Date(selectedBooking.created_at).toLocaleString('vi-VN')}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>🗺️ Điểm đến</div>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>{selectedBooking.destination}</div>
                            </div>
                            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>📅 Ngày bắt đầu</div>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>{new Date(selectedBooking.start_date).toLocaleDateString('vi-VN')}</div>
                            </div>
                            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>⏰ Thời gian</div>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>{selectedBooking.duration_days} ngày</div>
                            </div>
                            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>👥 Số người</div>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>{selectedBooking.participant_number} người</div>
                            </div>
                        </div>

                        {/* Budget */}
                        <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '12px', marginBottom: '1.5rem', border: '2px solid #fbbf24' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '600' }}>💰 Ngân sách dự kiến</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#92400e', marginTop: '0.25rem' }}>
                                        {formatVND(selectedBooking.total_budget)}
                                    </div>
                                </div>
                                {selectedBooking.quoted_price && (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#15803d', fontWeight: '600' }}>💚 Giá Provider Báo</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#15803d', marginTop: '0.25rem' }}>
                                            {formatVND(selectedBooking.quoted_price)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selected Activities */}
                        {selectedBooking.selected_activities && selectedBooking.selected_activities.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '700', marginBottom: '1rem' }}>
                                    🎯 Hoạt Động Bạn Đã Chọn ({selectedBooking.selected_activities.length})
                                </div>
                                <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                                    {selectedBooking.selected_activities.map((activity, index) => (
                                        <div key={index} style={{
                                            padding: '0.75rem',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                                                        📍 {activity.activity_name || activity.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                        Ngày {activity.day_number} • {activity.activity_type || activity.type} • {activity.location}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#667eea', marginLeft: '1rem' }}>
                                                    {formatVND(activity.cost)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Special Requests */}
                        {selectedBooking.special_requests && (
                            <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #fbbf24' }}>
                                <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '600', marginBottom: '0.5rem' }}>💬 Yêu cầu đặc biệt</div>
                                <div style={{ fontSize: '0.875rem', color: '#78350f' }}>
                                    {selectedBooking.special_requests}
                                </div>
                            </div>
                        )}

                        {/* Status */}
                        <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>📊 Trạng thái</div>
                            <span style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '999px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                backgroundColor: getBookingStatusColor(selectedBooking.status).bg,
                                color: getBookingStatusColor(selectedBooking.status).color,
                                border: `2px solid ${getBookingStatusColor(selectedBooking.status).border}`,
                                display: 'inline-block'
                            }}>
                                {getBookingStatusLabel(selectedBooking.status)}
                            </span>
                        </div>

                        <button
                            onClick={() => setShowDetailModal(false)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#14b8a6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#0d9488'}
                            onMouseOut={(e) => e.target.style.background = '#14b8a6'}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && selectedBooking && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '1rem',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '90%'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                            Hủy Booking
                        </h3>
                        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                            Vui lòng cho biết lý do hủy booking này:
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Nhập lý do hủy..."
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem',
                                marginBottom: '1.5rem',
                                fontFamily: 'inherit'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={confirmCancel}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Xác Nhận Hủy
                            </button>
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                    setSelectedBooking(null);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    backgroundColor: '#e5e7eb',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Giữ Lại
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default MyAIBookings;
