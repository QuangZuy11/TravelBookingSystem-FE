/**
 * PROVIDER AI BOOKINGS MANAGEMENT PAGE
 * Màn quản lý booking requests từ AI-generated itineraries cho tour provider
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
    getProviderBookings,
    getBookingDetail,
    approveBooking,
    rejectBooking,
    completeBooking,
    formatVND,
    getBookingStatusLabel,
    getBookingStatusColor,
    formatDate
} from '../../services/aiItineraryBookingService';

// Styles giống TourDashboard
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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

const buttonPrimaryStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
};

const buttonSuccessStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white'
};

const buttonDangerStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white'
};

const modalOverlayStyle = {
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
};

const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '1rem',
    marginBottom: '1rem'
};

const ProviderAIBookingsPage = () => {
    const { user } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        completed: 0
    });

    // Approval form
    const [approvalData, setApprovalData] = useState({
        quoted_price: '',
        provider_notes: ''
    });

    // Services arrays
    const [includedServices, setIncludedServices] = useState(['']);
    const [excludedServices, setExcludedServices] = useState(['']);

    // Rejection form
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        if (user?.providerId) {
            loadBookings();
        }
    }, [user]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔄 Loading provider bookings for providerId:', user?.providerId);

            if (!user?.providerId) {
                throw new Error('Provider not authenticated');
            }

            // Call real backend API
            const response = await getProviderBookings(user.providerId);
            console.log('✅ Bookings loaded from API:', response);

            const bookingsData = response.data || [];
            setBookings(bookingsData);

            // Calculate stats
            setStats({
                total: bookingsData.length,
                pending: bookingsData.filter(b => b.status === 'pending').length,
                approved: bookingsData.filter(b => b.status === 'approved').length,
                completed: bookingsData.filter(b => b.status === 'completed').length
            });

            setLoading(false);
        } catch (err) {
            console.error('❌ Load bookings error:', err);
            toast.error(err.message || 'Không thể tải danh sách bookings');

            // Fallback to mock data if backend not ready
            console.warn('⚠️ Backend not ready, using mock data');
            const mockBookings = [
                {
                    _id: '1',
                    booking_code: 'AIB-2025001',
                    destination: 'Hà Nội',
                    duration_days: 4,
                    participant_number: 2,
                    start_date: '2025-12-01T00:00:00.000Z',
                    total_budget: 15000000,
                    status: 'pending',
                    contact_info: { name: 'Nguyễn Văn A', phone: '0901234567' },
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
                        },
                        {
                            day_number: 3,
                            activity_name: 'Tour thuyền Vịnh Hạ Long',
                            activity_type: 'Nature',
                            location: 'Quảng Ninh',
                            cost: 2500000
                        }
                    ],
                    special_requests: 'Muốn có hướng dẫn viên nói tiếng Anh. Ưu tiên khách sạn gần trung tâm.'
                },
                {
                    _id: '2',
                    booking_code: 'AIB-2025002',
                    destination: 'Đà Nẵng',
                    duration_days: 5,
                    participant_number: 4,
                    start_date: '2025-12-15T00:00:00.000Z',
                    total_budget: 28000000,
                    status: 'approved',
                    quoted_price: 26500000,
                    contact_info: { name: 'Trần Thị B', phone: '0912345678' },
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
                        },
                        {
                            day_number: 3,
                            activity_name: 'Tour phố cổ Hội An',
                            activity_type: 'Cultural',
                            location: 'Hội An',
                            cost: 600000
                        }
                    ],
                    special_requests: 'Cần phòng có view biển. Có người ăn chay.'
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
                    contact_info: { name: 'Lê Văn C', phone: '0923456789' },
                    created_at: '2025-11-08T16:45:00.000Z',
                    selected_activities: [
                        {
                            day_number: 1,
                            activity_name: 'Tham quan VinWonders',
                            activity_type: 'Entertainment',
                            location: 'Phú Quốc',
                            cost: 1800000
                        },
                        {
                            day_number: 2,
                            activity_name: 'Câu cá & BBQ trên biển',
                            activity_type: 'Food & Dining',
                            location: 'Phú Quốc',
                            cost: 2000000
                        },
                        {
                            day_number: 3,
                            activity_name: 'Tour 3 đảo',
                            activity_type: 'Nature',
                            location: 'Phú Quốc',
                            cost: 1500000
                        },
                        {
                            day_number: 4,
                            activity_name: 'Safari động vật hoang dã',
                            activity_type: 'Wildlife',
                            location: 'Phú Quốc',
                            cost: 2500000
                        }
                    ],
                    special_requests: 'Resort sang trọng. Có trẻ em 5 tuổi cần ghế an toàn.'
                }
            ];

            setBookings(mockBookings);
            setStats({
                total: mockBookings.length,
                pending: mockBookings.filter(b => b.status === 'pending').length,
                approved: mockBookings.filter(b => b.status === 'approved').length,
                completed: mockBookings.filter(b => b.status === 'completed').length
            });

            setLoading(false);
        }
    };

    const handleApproveClick = (booking) => {
        setSelectedBooking(booking);
        setApprovalData({
            quoted_price: booking.total_budget,
            provider_notes: ''
        });
        setIncludedServices(['']);
        setExcludedServices(['']);
        setShowApproveModal(true);
    };

    const addIncludedService = () => {
        setIncludedServices([...includedServices, '']);
    };

    const removeIncludedService = (index) => {
        setIncludedServices(includedServices.filter((_, i) => i !== index));
    };

    const updateIncludedService = (index, value) => {
        const updated = [...includedServices];
        updated[index] = value;
        setIncludedServices(updated);
    };

    const addExcludedService = () => {
        setExcludedServices([...excludedServices, '']);
    };

    const removeExcludedService = (index) => {
        setExcludedServices(excludedServices.filter((_, i) => i !== index));
    };

    const updateExcludedService = (index, value) => {
        const updated = [...excludedServices];
        updated[index] = value;
        setExcludedServices(updated);
    };

    const handleRejectClick = (booking) => {
        setSelectedBooking(booking);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const handleViewDetail = (booking) => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
    };

    const handleApprove = async () => {
        try {
            console.log('✅ Approving booking:', selectedBooking._id, approvalData);

            // Filter out empty strings and prepare data
            const approvePayload = {
                ...approvalData,
                quoted_price: parseFloat(approvalData.quoted_price),
                included_services: includedServices.filter(s => s.trim() !== ''),
                excluded_services: excludedServices.filter(s => s.trim() !== '')
            };

            await approveBooking(selectedBooking._id, approvePayload);

            toast.success('Đã duyệt booking thành công!');
            setShowApproveModal(false);
            loadBookings();
        } catch (error) {
            console.error('❌ Approve error:', error);
            toast.error(error.message || 'Không thể duyệt booking');
        }
    };

    const handleReject = async () => {
        try {
            console.log('❌ Rejecting booking:', selectedBooking._id);

            await rejectBooking(selectedBooking._id, rejectionReason);

            toast.success('Đã từ chối booking');
            setShowRejectModal(false);
            loadBookings();
        } catch (error) {
            console.error('❌ Reject error:', error);
            toast.error(error.message || 'Không thể từ chối booking');
        }
    };

    const handleComplete = async (bookingId) => {
        try {
            console.log('🎉 Completing booking:', bookingId);

            await completeBooking(bookingId);

            toast.success('Đã hoàn thành chuyến đi!');
            loadBookings();
        } catch (error) {
            console.error('❌ Complete error:', error);
            toast.error(error.message || 'Không thể hoàn thành booking');
        }
    };

    if (loading) {
        return (
            <div style={{ ...containerStyle, textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>Đang tải danh sách bookings...</p>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <h1 style={titleStyle}>🎫 AI Itinerary Bookings Management</h1>
                <p style={{ margin: 0, opacity: 0.9 }}>Quản lý yêu cầu đặt tour từ AI-generated itineraries</p>
            </div>

            {/* Stats Cards */}
            <div style={statsContainerStyle}>
                <div
                    style={hoveredCard === 'total' ? { ...statCardStyle, ...statCardHoverStyle } : statCardStyle}
                    onMouseEnter={() => setHoveredCard('total')}
                    onMouseLeave={() => setHoveredCard(null)}
                >
                    <div style={statTitleStyle}>📊 Tổng Bookings</div>
                    <p style={statValueStyle}>{stats.total}</p>
                </div>

                <div
                    style={hoveredCard === 'pending' ? { ...statCardStyle, ...statCardHoverStyle } : statCardStyle}
                    onMouseEnter={() => setHoveredCard('pending')}
                    onMouseLeave={() => setHoveredCard(null)}
                >
                    <div style={statTitleStyle}>⏳ Chờ Duyệt</div>
                    <p style={{ ...statValueStyle, color: '#f59e0b' }}>{stats.pending}</p>
                </div>

                <div
                    style={hoveredCard === 'approved' ? { ...statCardStyle, ...statCardHoverStyle } : statCardStyle}
                    onMouseEnter={() => setHoveredCard('approved')}
                    onMouseLeave={() => setHoveredCard(null)}
                >
                    <div style={statTitleStyle}>✅ Đã Duyệt</div>
                    <p style={{ ...statValueStyle, color: '#10b981' }}>{stats.approved}</p>
                </div>

                <div
                    style={hoveredCard === 'completed' ? { ...statCardStyle, ...statCardHoverStyle } : statCardStyle}
                    onMouseEnter={() => setHoveredCard('completed')}
                    onMouseLeave={() => setHoveredCard(null)}
                >
                    <div style={statTitleStyle}>🎉 Hoàn Thành</div>
                    <p style={{ ...statValueStyle, color: '#667eea' }}>{stats.completed}</p>
                </div>
            </div>

            {/* Bookings Table */}
            <div style={tableContainerStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Mã Booking</th>
                            <th style={thStyle}>Điểm Đến</th>
                            <th style={thStyle}>Ngày Bắt Đầu</th>
                            <th style={thStyle}>Số Người</th>
                            <th style={thStyle}>Ngân Sách</th>
                            <th style={thStyle}>Trạng Thái</th>
                            <th style={thStyle}>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ ...tdStyle, textAlign: 'center', padding: '3rem' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                                    <p style={{ color: '#6b7280', margin: 0 }}>Chưa có booking requests nào</p>
                                </td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr key={booking._id}>
                                    <td style={tdStyle}>
                                        <strong>{booking.booking_code}</strong>
                                    </td>
                                    <td style={tdStyle}>{booking.destination}</td>
                                    <td style={tdStyle}>{formatDate(booking.start_date)}</td>
                                    <td style={tdStyle}>{booking.participant_number}</td>
                                    <td style={tdStyle}>
                                        <strong style={{ color: '#667eea' }}>{formatVND(booking.total_budget)}</strong>
                                    </td>
                                    <td style={tdStyle}>
                                        <span
                                            style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                backgroundColor: getBookingStatusColor(booking.status).bg,
                                                color: getBookingStatusColor(booking.status).text
                                            }}
                                        >
                                            {getBookingStatusLabel(booking.status)}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <button
                                            style={{ ...buttonStyle, background: '#6366f1', color: 'white', marginBottom: '0.25rem' }}
                                            onClick={() => handleViewDetail(booking)}
                                        >
                                            👁️ Xem
                                        </button>
                                        <br />
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <button
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: '#667eea',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    fontSize: '0.875rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}
                                                onClick={() => setOpenDropdown(openDropdown === booking._id ? null : booking._id)}
                                            >
                                                Hành Động ▼
                                            </button>

                                            {openDropdown === booking._id && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    marginTop: '0.25rem',
                                                    background: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                    zIndex: 1000,
                                                    minWidth: '160px',
                                                    overflow: 'hidden'
                                                }}>
                                                    {booking.status === 'pending' && (
                                                        <button
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.75rem 1rem',
                                                                background: 'white',
                                                                color: '#10b981',
                                                                border: 'none',
                                                                textAlign: 'left',
                                                                cursor: 'pointer',
                                                                fontSize: '0.875rem',
                                                                fontWeight: '500',
                                                                transition: 'background 0.2s'
                                                            }}
                                                            onClick={() => {
                                                                handleApproveClick(booking);
                                                                setOpenDropdown(null);
                                                            }}
                                                            onMouseOver={(e) => e.target.style.background = '#f0fdf4'}
                                                            onMouseOut={(e) => e.target.style.background = 'white'}
                                                        >
                                                            ✓ Duyệt
                                                        </button>
                                                    )}
                                                    {booking.status === 'approved' && (
                                                        <button
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.75rem 1rem',
                                                                background: 'white',
                                                                color: '#3b82f6',
                                                                border: 'none',
                                                                textAlign: 'left',
                                                                cursor: 'pointer',
                                                                fontSize: '0.875rem',
                                                                fontWeight: '500',
                                                                transition: 'background 0.2s'
                                                            }}
                                                            onClick={() => {
                                                                handleComplete(booking._id);
                                                                setOpenDropdown(null);
                                                            }}
                                                            onMouseOver={(e) => e.target.style.background = '#eff6ff'}
                                                            onMouseOut={(e) => e.target.style.background = 'white'}
                                                        >
                                                            🎉 Hoàn Thành
                                                        </button>
                                                    )}
                                                    {booking.status === 'completed' && (
                                                        <div style={{
                                                            padding: '0.75rem 1rem',
                                                            color: '#10b981',
                                                            fontSize: '0.875rem',
                                                            fontWeight: '600'
                                                        }}>
                                                            ✓ Đã Xong
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedBooking && (
                <div style={modalOverlayStyle} onClick={() => setShowDetailModal(false)}>
                    <div style={{ ...modalContentStyle, maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, color: '#1f2937' }}>📝 Chi Tiết Booking Request</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                style={{
                                    fontSize: '1.5rem',
                                    color: '#6b7280',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Booking Code */}
                        <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', borderRadius: '12px', marginBottom: '1.5rem', border: '2px solid #3b82f6' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>{selectedBooking.booking_code}</div>
                            <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.25rem' }}>
                                Tạo: {formatDate(selectedBooking.created_at)}
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '600' }}>🗺️ Điểm đến</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>{selectedBooking.destination}</div>
                            </div>
                            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '600' }}>📅 Ngày khởi hành</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>{formatDate(selectedBooking.start_date)}</div>
                            </div>
                            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '600' }}>⏰ Thời gian</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>{selectedBooking.duration_days} ngày</div>
                            </div>
                            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '600' }}>👥 Số khách</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>{selectedBooking.participant_number} người</div>
                            </div>
                        </div>

                        {/* Budget Section */}
                        <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '12px', marginBottom: '1.5rem', border: '2px solid #fbbf24' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '600' }}>💰 Ngân sách khách đề xuất</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#92400e', marginTop: '0.25rem' }}>
                                        {formatVND(selectedBooking.total_budget)}
                                    </div>
                                </div>
                                {selectedBooking.quoted_price && (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#15803d', fontWeight: '600' }}>💵 Giá bạn báo</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#15803d', marginTop: '0.25rem' }}>
                                            {formatVND(selectedBooking.quoted_price)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Info */}
                        {selectedBooking.contact_info && (
                            <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #86efac' }}>
                                <div style={{ fontSize: '0.875rem', color: '#15803d', fontWeight: '600', marginBottom: '0.75rem' }}>📞 Thông tin liên hệ</div>
                                <div style={{ fontSize: '0.875rem', color: '#166534' }}>
                                    <div>👤 {selectedBooking.contact_info.name}</div>
                                    <div>📞 {selectedBooking.contact_info.phone}</div>
                                </div>
                            </div>
                        )}

                        {/* Selected Activities */}
                        {selectedBooking.selected_activities && selectedBooking.selected_activities.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '700', marginBottom: '1rem' }}>
                                    🎯 Hoạt Động Khách Chọn ({selectedBooking.selected_activities.length})
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
                                                        Day {activity.day_number} • {activity.activity_type || activity.type} • {activity.location}
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
                                color: getBookingStatusColor(selectedBooking.status).text,
                                display: 'inline-block'
                            }}>
                                {getBookingStatusLabel(selectedBooking.status)}
                            </span>
                        </div>

                        <button
                            onClick={() => setShowDetailModal(false)}
                            style={{ ...buttonPrimaryStyle, width: '100%' }}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* Approve Modal */}
            {showApproveModal && (
                <div style={modalOverlayStyle} onClick={() => setShowApproveModal(false)}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginTop: 0, color: '#1f2937' }}>✅ Duyệt Booking Request</h2>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                            Booking: <strong>{selectedBooking?.booking_code}</strong>
                        </p>

                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Giá Báo (VNĐ) *
                        </label>
                        <input
                            type="number"
                            value={approvalData.quoted_price}
                            onChange={(e) => setApprovalData({ ...approvalData, quoted_price: e.target.value })}
                            style={{ ...inputStyle, border: '2px solid #10b981' }}
                            placeholder="Nhập giá báo cho khách"
                        />

                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Ghi Chú Của Provider
                        </label>
                        <textarea
                            value={approvalData.provider_notes}
                            onChange={(e) => setApprovalData({ ...approvalData, provider_notes: e.target.value })}
                            style={inputStyle}
                            rows="3"
                            placeholder="Ghi chú thêm cho khách hàng..."
                        />

                        {/* Included Services */}
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', marginTop: '1rem' }}>
                            ✅ Dịch Vụ Bao Gồm
                        </label>
                        {includedServices.map((service, index) => (
                            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={service}
                                    onChange={(e) => updateIncludedService(index, e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                                    placeholder="VD: Vé máy bay khứ hồi, Khách sạn 4 sao..."
                                />
                                {includedServices.length > 1 && (
                                    <button
                                        onClick={() => removeIncludedService(index)}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={addIncludedService}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                marginBottom: '1rem'
                            }}
                        >
                            ➕ Thêm Dịch Vụ
                        </button>

                        {/* Excluded Services */}
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                            ❌ Dịch Vụ Không Bao Gồm
                        </label>
                        {excludedServices.map((service, index) => (
                            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={service}
                                    onChange={(e) => updateExcludedService(index, e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                                    placeholder="VD: Visa, Bảo hiểm du lịch, Chi phí cá nhân..."
                                />
                                {excludedServices.length > 1 && (
                                    <button
                                        onClick={() => removeExcludedService(index)}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={addExcludedService}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.875rem'
                            }}
                        >
                            ➕ Thêm Loại Trừ
                        </button>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                style={{ ...buttonSuccessStyle, flex: 1 }}
                                onClick={handleApprove}
                            >
                                ✓ Xác Nhận Duyệt
                            </button>
                            <button
                                style={{ ...buttonStyle, flex: 1, background: '#e5e7eb', color: '#374151' }}
                                onClick={() => setShowApproveModal(false)}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderAIBookingsPage;
