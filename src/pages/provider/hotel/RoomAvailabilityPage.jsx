import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Spinner } from '../../../components/ui/Spinner';
import { ErrorAlert } from '../../../components/shared/ErrorAlert';
import { Calendar, MapPin, Users, DollarSign, Clock, User, Phone, Mail } from 'lucide-react';

// Room Cell Component for Matrix View
const RoomCell = ({ room, hasBooking, onBookingClick, getStatusBadge }) => {
    const [hovered, setHovered] = useState(false);

    const cellStyle = {
        padding: '1rem',
        borderRadius: '8px',
        border: `2px solid ${room.isAvailable ? '#10b981' : '#f59e0b'}`,
        background: room.isAvailable ? '#f0fdf4' : '#fffbeb',
        transition: 'all 0.3s ease',
        cursor: hasBooking ? 'pointer' : 'default',
        textAlign: 'center',
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...(hovered && hasBooking ? {
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        } : {})
    };

    return (
        <div
            style={cellStyle}
            onClick={onBookingClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
                {room.roomNumber}
            </div>
            <div style={{ fontSize: '0.75rem' }}>
                {getStatusBadge(room.isAvailable ? 'available' : 'booked')}
            </div>
            {hasBooking && (
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Click để xem
                </div>
            )}
        </div>
    );
};

const RoomAvailabilityPage = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();

    // Get provider _id from localStorage
    const provider = localStorage.getItem('provider');
    const providerId = provider ? JSON.parse(provider)._id : null;
    const token = localStorage.getItem('token');

    const [allRooms, setAllRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [summary, setSummary] = useState({ total: 0, available: 0, booked: 0 });

    useEffect(() => {
        fetchBookingsByDate();
    }, [selectedDate, hotelId]);

    const fetchBookingsByDate = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(
                `/api/hotel/provider/${providerId}/hotels/${hotelId}/rooms/bookings-by-date?date=${selectedDate}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (response.data.success) {
                setAllRooms(response.data.rooms || []);
                setBookings(response.data.data || []);
                calculateSummary(response.data.rooms || [], response.data.data || []);
            } else {
                setError(response.data.error || 'Không thể tải thông tin phòng');
            }
        } catch (err) {
            console.error('Error fetching bookings by date:', err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Không thể tải thông tin phòng';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (rooms, bookings) => {
        // Create a map of booked room IDs
        const bookedRoomIds = new Set();
        bookings.forEach(booking => {
            const roomId = booking.hotel_room_id?._id 
                ? booking.hotel_room_id._id.toString() 
                : booking.hotel_room_id.toString();
            bookedRoomIds.add(roomId);
        });

        // Calculate summary
        const total = rooms.length;
        const booked = rooms.filter(room => {
            const roomId = room._id.toString();
            return bookedRoomIds.has(roomId) && room.status === 'available';
        }).length;
        const available = total - booked;

        setSummary({ total, available, booked });
    };

    // Get rooms with availability status
    const getRoomsWithAvailability = () => {
        // Create a map of bookings by room ID
        const bookingsByRoom = {};
        bookings.forEach(booking => {
            const roomId = booking.hotel_room_id?._id 
                ? booking.hotel_room_id._id.toString() 
                : booking.hotel_room_id.toString();
            
            if (!bookingsByRoom[roomId]) {
                bookingsByRoom[roomId] = [];
            }
            bookingsByRoom[roomId].push(booking);
        });

        // Map rooms with availability status
        return allRooms.map(room => {
            const roomId = room._id.toString();
            const roomBookings = bookingsByRoom[roomId] || [];
            const isAvailable = roomBookings.length === 0 && room.status === 'available';

            return {
                ...room,
                isAvailable,
                bookings: roomBookings,
                bookingCount: roomBookings.length
            };
        });
    };

    const rooms = getRoomsWithAvailability();

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleBookingClick = (booking) => {
        setSelectedBooking(booking);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedBooking(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            available: { text: 'Trống', color: '#10b981' },
            booked: { text: 'Đã đặt', color: '#f59e0b' },
            maintenance: { text: 'Bảo trì', color: '#ef4444' }
        };
        const statusInfo = statusMap[status] || { text: status, color: '#6b7280' };
        return (
            <span
                style={{
                    padding: '0.5rem 1rem',
                    background: statusInfo.color,
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'inline-block'
                }}
            >
                {statusInfo.text}
            </span>
        );
    };

    const getBookingStatusBadge = (status) => {
        const statusMap = {
            reserved: { text: 'Đã giữ', color: '#3b82f6' },
            pending: { text: 'Chờ xác nhận', color: '#f59e0b' },
            confirmed: { text: 'Đã xác nhận', color: '#10b981' },
            in_use: { text: 'Đang sử dụng', color: '#8b5cf6' },
            completed: { text: 'Hoàn thành', color: '#6b7280' },
            cancelled: { text: 'Đã hủy', color: '#ef4444' }
        };
        const statusInfo = statusMap[status] || { text: status, color: '#6b7280' };
        return (
            <span
                style={{
                    padding: '0.4rem 0.8rem',
                    background: statusInfo.color,
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'inline-block'
                }}
            >
                {statusInfo.text}
            </span>
        );
    };

    const containerStyle = {
        minHeight: '100vh',
        padding: '2rem',
        color: '#1a1a1a'
    };

    const contentContainerStyle = {
        maxWidth: '1400px',
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
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
    };

    const titleStyle = {
        fontSize: '2.5rem',
        fontWeight: '700',
        background: '#10b981',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    };

    const dateFilterStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '12px'
    };

    const summaryStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
    };

    const summaryCardStyle = {
        padding: '1.5rem',
        borderRadius: '12px',
        background: '#f9fafb',
        textAlign: 'center'
    };

    const matrixContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '1rem',
        marginTop: '1rem'
    };

    const roomCellStyle = (isAvailable, hasBooking) => ({
        padding: '1rem',
        borderRadius: '8px',
        border: `2px solid ${isAvailable ? '#10b981' : '#f59e0b'}`,
        background: isAvailable ? '#f0fdf4' : '#fffbeb',
        transition: 'all 0.3s ease',
        cursor: hasBooking ? 'pointer' : 'default',
        textAlign: 'center',
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    });

    const roomCellHoverStyle = {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    };

    if (loading) return <Spinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <div style={containerStyle}>
            <div style={contentContainerStyle}>
                <div style={headerStyle}>
                    <div>
                        <h1 style={titleStyle}>Quản lý phòng trống</h1>
                        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                            Xem tình trạng phòng trống và đã đặt theo ngày
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(`/provider/hotels/${hotelId}/rooms`)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        ← Quay lại
                    </button>
                </div>

                <div style={dateFilterStyle}>
                    <Calendar size={20} color="#10b981" />
                    <label style={{ fontWeight: '600', color: '#374151' }}>
                        Chọn ngày:
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        style={{
                            padding: '0.5rem 1rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    />
                </div>

                <div style={summaryStyle}>
                    <div style={summaryCardStyle}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#374151' }}>
                            {summary.total}
                        </div>
                        <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Tổng số phòng</div>
                    </div>
                    <div style={{ ...summaryCardStyle, background: '#f0fdf4' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                            {summary.available}
                        </div>
                        <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Phòng trống</div>
                    </div>
                    <div style={{ ...summaryCardStyle, background: '#fffbeb' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
                            {summary.booked}
                        </div>
                        <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Phòng đã đặt</div>
                    </div>
                </div>

                <div>
                    {rooms.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏨</div>
                            <p style={{ fontSize: '1.25rem' }}>Chưa có phòng nào</p>
                        </div>
                    ) : (
                        <div style={matrixContainerStyle}>
                            {rooms.map((room) => {
                                const hasBooking = !room.isAvailable && room.bookings.length > 0;
                                return (
                                    <RoomCell
                                        key={room._id}
                                        room={room}
                                        hasBooking={hasBooking}
                                        onBookingClick={() => hasBooking && handleBookingClick(room.bookings[0])}
                                        getStatusBadge={getStatusBadge}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal hiển thị chi tiết booking */}
            {showModal && selectedBooking && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '2rem'
                    }}
                    onClick={closeModal}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '2rem',
                            maxWidth: '600px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827' }}>
                                Thông tin khách hàng
                            </h2>
                            <button
                                onClick={closeModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#6b7280',
                                    padding: '0.5rem'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Thông tin khách hàng */}
                            {selectedBooking.user_id ? (
                                <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '12px' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <User size={24} />
                                        Thông tin khách hàng
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Họ và tên</div>
                                            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                                                {selectedBooking.user_id.name || 'N/A'}
                                            </div>
                                        </div>
                                        {selectedBooking.user_id.email && (
                                            <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Mail size={16} />
                                                    Email
                                                </div>
                                                <div style={{ fontSize: '1rem', color: '#374151' }}>
                                                    {selectedBooking.user_id.email}
                                                </div>
                                            </div>
                                        )}
                                        {selectedBooking.user_id.phone && (
                                            <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Phone size={16} />
                                                    Số điện thoại
                                                </div>
                                                <div style={{ fontSize: '1rem', color: '#374151' }}>
                                                    {selectedBooking.user_id.phone}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280' }}>
                                    Không có thông tin khách hàng
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomAvailabilityPage;

