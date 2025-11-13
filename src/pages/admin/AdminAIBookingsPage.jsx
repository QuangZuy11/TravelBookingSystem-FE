/**
 * ADMIN AI BOOKINGS MANAGEMENT PAGE
 * Màn quản lý tất cả booking requests từ AI-generated itineraries cho admin
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    getAllBookingsAdmin,
    getBookingStatistics,
    getBookingDetail,
    adminBookingAction,
    formatVND,
    getBookingStatusLabel,
    getBookingStatusColor,
    formatDate
} from '../../services/aiItineraryBookingService';

// Styles giống TourDashboard/ProviderAIBookingsPage
const containerStyle = {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto'
};

const headerStyle = {
    marginBottom: '2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
    borderRadius: '12px',
    color: 'white',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
};

const titleStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
};

const statsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
};

const statCardStyle = {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    textAlign: 'center'
};

const statCardHoverStyle = {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
};

const statTitleStyle = {
    fontSize: '0.9rem',
    color: '#6b7280',
    marginBottom: '0.5rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const statValueStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
};

const tableContainerStyle = {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
};

const thStyle = {
    padding: '1rem',
    textAlign: 'left',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e5e7eb',
    background: '#f9fafb'
};

const tdStyle = {
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '0.9rem',
    color: '#374151'
};

const buttonStyle = {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    margin: '0 0.25rem'
};

const AdminAIBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        rejected: 0,
        totalRevenue: 0
    });
    const [hoveredCard, setHoveredCard] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock data for UI testing
            setTimeout(() => {
                const mockBookings = [
                    {
                        _id: '1',
                        booking_code: 'AIB-2025001',
                        destination: 'Hà Nội',
                        duration_days: 3,
                        participant_number: 2,
                        start_date: '2025-12-01T00:00:00.000Z',
                        total_budget: 15000000,
                        status: 'pending',
                        traveler_name: 'Nguyễn Văn A',
                        provider_name: 'VietTravel',
                        created_at: '2025-11-10T10:00:00.000Z'
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
                        traveler_name: 'Trần Thị B',
                        provider_name: 'DanangTour',
                        created_at: '2025-11-11T14:30:00.000Z'
                    },
                    {
                        _id: '3',
                        booking_code: 'AIB-2025003',
                        destination: 'Phú Quốc',
                        duration_days: 7,
                        participant_number: 6,
                        start_date: '2025-12-20T00:00:00.000Z',
                        total_budget: 50000000,
                        status: 'completed',
                        quoted_price: 48000000,
                        traveler_name: 'Lê Văn C',
                        provider_name: 'IslandTour',
                        created_at: '2025-11-12T09:00:00.000Z'
                    },
                    {
                        _id: '4',
                        booking_code: 'AIB-2025004',
                        destination: 'Nha Trang',
                        duration_days: 4,
                        participant_number: 3,
                        start_date: '2025-12-10T00:00:00.000Z',
                        total_budget: 20000000,
                        status: 'confirmed',
                        quoted_price: 19000000,
                        traveler_name: 'Phạm Thị D',
                        provider_name: 'BeachTour',
                        created_at: '2025-11-13T11:00:00.000Z'
                    }
                ];

                setBookings(mockBookings);
                
                const totalRevenue = mockBookings
                    .filter(b => ['completed', 'confirmed'].includes(b.status))
                    .reduce((sum, b) => sum + (b.quoted_price || 0), 0);

                setStats({
                    total: mockBookings.length,
                    pending: mockBookings.filter(b => b.status === 'pending').length,
                    approved: mockBookings.filter(b => b.status === 'approved').length,
                    confirmed: mockBookings.filter(b => b.status === 'confirmed').length,
                    completed: mockBookings.filter(b => b.status === 'completed').length,
                    cancelled: mockBookings.filter(b => b.status === 'cancelled').length,
                    rejected: mockBookings.filter(b => b.status === 'rejected').length,
                    totalRevenue
                });
                
                setLoading(false);
            }, 500);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" style={{ margin: '0 auto' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <h1 style={titleStyle}>👨‍💼 Admin - Quản Lý Đặt Tour AI</h1>
                <p style={{ fontSize: '1rem', opacity: '0.9' }}>
                    Giám sát và quản lý tất cả các yêu cầu đặt tour AI trong hệ thống
                </p>
            </div>

            {/* Stats */}
            <div style={statsContainerStyle}>
                {[
                    { title: 'Tổng Bookings', value: stats.total, icon: '📊' },
                    { title: 'Chờ Duyệt', value: stats.pending, icon: '⏳' },
                    { title: 'Đã Duyệt', value: stats.approved, icon: '✅' },
                    { title: 'Đã Xác Nhận', value: stats.confirmed, icon: '🎫' },
                    { title: 'Hoàn Thành', value: stats.completed, icon: '🎉' },
                    { title: 'Doanh Thu', value: formatVND(stats.totalRevenue), icon: '💰' }
                ].map((stat, index) => (
                    <div
                        key={index}
                        style={{
                            ...statCardStyle,
                            ...(hoveredCard === index ? statCardHoverStyle : {})
                        }}
                        onMouseEnter={() => setHoveredCard(index)}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                        <h3 style={statTitleStyle}>{stat.title}</h3>
                        <p style={statValueStyle}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Bookings Table */}
            <div style={tableContainerStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Mã Booking</th>
                            <th style={thStyle}>Khách Hàng</th>
                            <th style={thStyle}>Provider</th>
                            <th style={thStyle}>Điểm Đến</th>
                            <th style={thStyle}>Ngày Đi</th>
                            <th style={thStyle}>Số Người</th>
                            <th style={thStyle}>Giá Trị</th>
                            <th style={thStyle}>Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => {
                            const statusColor = getBookingStatusColor(booking.status);
                            return (
                                <tr key={booking._id} style={{ transition: 'background 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    <td style={tdStyle}>
                                        <strong>{booking.booking_code}</strong>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span>👤</span>
                                            <span>{booking.traveler_name || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span>🏢</span>
                                            <span>{booking.provider_name || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>🗺️ {booking.destination}</td>
                                    <td style={tdStyle}>
                                        {new Date(booking.start_date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td style={tdStyle}>{booking.participant_number} người</td>
                                    <td style={tdStyle}>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                                                {formatVND(booking.quoted_price || booking.total_budget)}
                                            </div>
                                            {booking.quoted_price && (
                                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                    Ngân sách: {formatVND(booking.total_budget)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: '0.375rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.8125rem',
                                            fontWeight: '600',
                                            backgroundColor: statusColor.bg,
                                            color: statusColor.color,
                                            border: `1px solid ${statusColor.border}`
                                        }}>
                                            {getBookingStatusLabel(booking.status)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {bookings.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>Chưa có booking nào</p>
                        <p>Các yêu cầu đặt tour sẽ xuất hiện ở đây</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAIBookingsPage;
