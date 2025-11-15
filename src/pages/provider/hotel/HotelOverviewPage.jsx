import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Bed,
    Calendar,
    DollarSign,
    MapPin,
    Image as ImageIcon,
    ChevronRight
} from 'lucide-react';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import { formatAddress } from '../../../utils/addressHelpers';
import { getProxiedGoogleDriveUrl } from '../../../utils/googleDriveImageHelper';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG } from '../../../config/mapConfig';

// Create custom Leaflet icon for hotel
const createHotelIcon = () => {
    return L.divIcon({
        className: 'custom-hotel-marker',
        html: `
            <div style="
                background: ${MAP_CONFIG.COLORS.HOTEL};
                width: 32px;
                height: 32px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <span style="
                    transform: rotate(45deg);
                    font-size: 18px;
                    display: block;
                    margin-top: -4px;
                    margin-left: -2px;
                ">🏨</span>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

const HotelOverviewPage = () => {
    const { hotelId } = useParams();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalRooms: 0,
        availableRooms: 0,
        todayBookings: 0,
        monthlyRevenue: 0
    });
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [selectedRoomType, setSelectedRoomType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const token = localStorage.getItem('token');

    // Get provider _id from localStorage
    const provider = localStorage.getItem('provider');
    const providerId = provider ? JSON.parse(provider)._id : null;

    useEffect(() => {
        fetchHotel();
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotelId]);

    const fetchHotel = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/hotel/provider/${providerId}/hotels/${hotelId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setHotel(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching hotel:', err);
            setError('Failed to load hotel details');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Fetch room statistics
            const roomsResponse = await axios.get(`/api/hotel/provider/${providerId}/hotels/${hotelId}/rooms`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (roomsResponse.data.success) {
                const rooms = roomsResponse.data.data;
                const availableRooms = rooms.filter(r => r.status === 'available').length;

                setRooms(rooms);
                setFilteredRooms(rooms);
                setStats(prev => ({
                    ...prev,
                    totalRooms: rooms.length,
                    availableRooms: availableRooms
                }));
            }

            // Fetch booking statistics (today and monthly)
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            // Get statistics with date filter
            const statsResponse = await axios.get(`/api/provider/hotel-bookings/statistics`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    hotel_id: hotelId,
                    start_date: firstDayOfMonth.toISOString(),
                    end_date: today.toISOString()
                }
            });

            if (statsResponse.data.success) {
                const { total_revenue } = statsResponse.data.data;
                setStats(prev => ({
                    ...prev,
                    monthlyRevenue: total_revenue || 0
                }));
            }

            // Get today's bookings count
            const todayStart = new Date(today.setHours(0, 0, 0, 0));
            const todayEnd = new Date(today.setHours(23, 59, 59, 999));

            const todayStatsResponse = await axios.get(`/api/provider/hotel-bookings/statistics`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    hotel_id: hotelId,
                    start_date: todayStart.toISOString(),
                    end_date: todayEnd.toISOString()
                }
            });

            if (todayStatsResponse.data.success) {
                const { total_bookings } = todayStatsResponse.data.data;
                setStats(prev => ({
                    ...prev,
                    todayBookings: total_bookings || 0
                }));
            }

        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    // Filter rooms by type
    const handleFilterChange = (type) => {
        setSelectedRoomType(type);
        setCurrentPage(1);
        if (type === 'all') {
            setFilteredRooms(rooms);
        } else {
            setFilteredRooms(rooms.filter(room => room.type === type));
        }
    };

    // Get unique room types
    const roomTypes = ['all', ...new Set(rooms.map(room => room.type))];

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRooms = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;
    if (!hotel) return <ErrorAlert message="Hotel not found" />;


    return (
        <div style={{ padding: '2rem', background: '#f8f9fa', minHeight: '100vh' }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        marginBottom: '0.5rem'
                    }}>
                        {hotel.name}
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                        {formatAddress(hotel.address)}
                    </p>
                </div>



                {/* Quick Stats - 3 cards trên 1 dòng */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{
                            background: '#e8f5e9',
                            borderRadius: '12px',
                            padding: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Bed size={24} color="#0a5757" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Tổng số phòng</p>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
                                {stats.totalRooms}
                            </p>
                        </div>
                    </div>

                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{
                            background: '#fff3e0',
                            borderRadius: '12px',
                            padding: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Calendar size={24} color="#f59e0b" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Đặt phòng hôm nay</p>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
                                {stats.todayBookings}
                            </p>
                        </div>
                    </div>

                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #0a5757 0%, #2d6a4f 100%)',
                            borderRadius: '12px',
                            padding: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <DollarSign size={24} color="white" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Doanh thu tháng</p>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                    maximumFractionDigits: 0
                                }).format(stats.monthlyRevenue)}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#10b981' }}>VND</p>
                        </div>
                    </div>
                </div>

                {/* Hotel Images Section */}
                {hotel.images && hotel.images.length > 0 && (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#1a1a1a',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <ImageIcon size={20} color="#0a5757" />
                                Hình ảnh khách sạn
                            </h2>
                            <Link
                                to={`/provider/hotels/${hotelId}/gallery`}
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: '#0a5757',
                                    color: 'white',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#0d6f6f';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#0a5757';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Xem tất cả ({hotel.images.length})
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '1rem'
                        }}>
                            {hotel.images.slice(0, 6).map((image, index) => (
                                <div
                                    key={index}
                                    style={{
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        border: '2px solid #e5e7eb',
                                        height: '200px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(10, 87, 87, 0.2)';
                                        e.currentTarget.style.borderColor = '#0a5757';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                    }}
                                >
                                    <img
                                        src={getProxiedGoogleDriveUrl(image)}
                                        alt={`${hotel.name} - ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Location Map Section */}
                {hotel.address && hotel.address.coordinates && (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#1a1a1a',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <MapPin size={20} color="#0a5757" />
                                Vị trí khách sạn
                            </h2>
                            <Link
                                to={`/provider/hotels/${hotelId}/location`}
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: '#0a5757',
                                    color: 'white',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#0d6f6f';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#0a5757';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Chỉnh sửa vị trí
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                        <div style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '2px solid #e5e7eb'
                        }}>
                            <MapContainer
                                center={[
                                    hotel.address.coordinates.latitude,
                                    hotel.address.coordinates.longitude
                                ]}
                                zoom={15}
                                style={{
                                    width: '100%',
                                    height: '400px',
                                    zIndex: 1
                                }}
                                scrollWheelZoom={true}
                            >
                                <TileLayer
                                    attribution={MAP_CONFIG.ATTRIBUTION}
                                    url={MAP_CONFIG.ALTERNATIVE_LAYERS.CARTODB_VOYAGER}
                                    maxZoom={MAP_CONFIG.MAX_ZOOM}
                                />
                                <Marker
                                    position={[
                                        hotel.address.coordinates.latitude,
                                        hotel.address.coordinates.longitude
                                    ]}
                                    icon={createHotelIcon()}
                                >
                                    <Popup>
                                        <div style={{ minWidth: '200px' }}>
                                            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                                                🏨 {hotel.name}
                                            </h3>
                                            <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>
                                                {formatAddress(hotel.address)}
                                            </p>
                                            <button
                                                onClick={() => {
                                                    window.open(
                                                        `https://www.google.com/maps?q=${hotel.address.coordinates.latitude},${hotel.address.coordinates.longitude}`,
                                                        '_blank'
                                                    );
                                                }}
                                                style={{
                                                    marginTop: '8px',
                                                    padding: '6px 12px',
                                                    background: '#0a5757',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#0d6f6f';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = '#0a5757';
                                                }}
                                            >
                                                <MapPin size={12} />
                                                Mở Google Maps
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                        <div style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            background: '#f9fafb',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '4px' }}>
                                    Địa chỉ đầy đủ
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                                    {formatAddress(hotel.address)}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    window.open(
                                        `https://www.google.com/maps/dir/?api=1&destination=${hotel.address.coordinates.latitude},${hotel.address.coordinates.longitude}`,
                                        '_blank'
                                    );
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: '#0a5757',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#0d6f6f';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(10, 87, 87, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#0a5757';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <MapPin size={16} />
                                Chỉ đường
                            </button>
                        </div>
                    </div>
                )}

                {/* Rooms Section with Filter and Pagination */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: '#1a1a1a',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Bed size={20} color="#0a5757" />
                            Danh sách phòng ({filteredRooms.length})
                        </h2>
                        <Link
                            to={`/provider/hotels/${hotelId}/rooms`}
                            style={{
                                padding: '0.75rem 1rem',
                                background: '#0a5757',
                                color: 'white',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#0d6f6f';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#0a5757';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Xem tất cả
                            <ChevronRight size={16} />
                        </Link>
                    </div>

                    {/* Filter by Room Type */}
                    <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap'
                    }}>
                        {roomTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => handleFilterChange(type)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: selectedRoomType === type ? '#0a5757' : 'white',
                                    color: selectedRoomType === type ? 'white' : '#0a5757',
                                    border: `2px solid ${selectedRoomType === type ? '#0a5757' : '#d1d5db'}`,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                    transition: 'all 0.3s ease',
                                    textTransform: 'capitalize'
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedRoomType !== type) {
                                        e.currentTarget.style.background = '#f0fdf4';
                                        e.currentTarget.style.borderColor = '#0a5757';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedRoomType !== type) {
                                        e.currentTarget.style.background = 'white';
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                    }
                                }}
                            >
                                {type === 'all' ? 'Tất cả' : type}
                            </button>
                        ))}
                    </div>

                    {/* Rooms Grid */}
                    {currentRooms.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                            <Bed size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                            <p style={{ fontSize: '1rem', margin: 0 }}>Không có phòng nào</p>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '1rem',
                                marginBottom: '2rem'
                            }}>
                                {currentRooms.map(room => (
                                    <div
                                        key={room._id}
                                        style={{
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '12px',
                                            padding: '1.25rem',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#0a5757';
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(10, 87, 87, 0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'start',
                                            marginBottom: '0.75rem'
                                        }}>
                                            <div style={{
                                                fontSize: '1.25rem',
                                                fontWeight: '700',
                                                color: '#1a1a1a'
                                            }}>
                                                {room.roomNumber}
                                            </div>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                background: room.status === 'available' ? '#0a5757' : '#f59e0b',
                                                color: 'white',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                textTransform: 'capitalize'
                                            }}>
                                                {room.status}
                                            </span>
                                        </div>
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <span style={{
                                                fontSize: '0.875rem',
                                                color: '#6b7280',
                                                textTransform: 'capitalize'
                                            }}>
                                                {room.type}
                                            </span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            gap: '1rem',
                                            marginBottom: '0.75rem',
                                            fontSize: '0.875rem',
                                            color: '#6b7280'
                                        }}>
                                            <span>🛏️ {room.capacity} người</span>
                                            <span>🏢 Tầng {room.floor}</span>
                                        </div>
                                        <div style={{
                                            fontSize: '1.125rem',
                                            fontWeight: '700',
                                            color: '#0a5757'
                                        }}>
                                            {room.pricePerNight.toLocaleString()}đ/đêm
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: currentPage === 1 ? '#e5e7eb' : '#0a5757',
                                                color: currentPage === 1 ? '#9ca3af' : 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                                fontWeight: '600',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (currentPage !== 1) e.currentTarget.style.background = '#2d6a4f';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (currentPage !== 1) e.currentTarget.style.background = '#0a5757';
                                            }}
                                        >
                                            ← Trước
                                        </button>

                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            {[...Array(totalPages)].map((_, index) => {
                                                const pageNumber = index + 1;
                                                const isCurrentPage = pageNumber === currentPage;

                                                if (
                                                    pageNumber === 1 ||
                                                    pageNumber === totalPages ||
                                                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                                ) {
                                                    return (
                                                        <button
                                                            key={pageNumber}
                                                            onClick={() => handlePageChange(pageNumber)}
                                                            style={{
                                                                padding: '0.5rem 1rem',
                                                                background: isCurrentPage ? '#0a5757' : 'white',
                                                                color: isCurrentPage ? 'white' : '#0a5757',
                                                                border: `2px solid ${isCurrentPage ? '#0a5757' : '#d1d5db'}`,
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                fontWeight: '600',
                                                                minWidth: '40px',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!isCurrentPage) {
                                                                    e.currentTarget.style.background = '#f0fdf4';
                                                                    e.currentTarget.style.borderColor = '#0a5757';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!isCurrentPage) {
                                                                    e.currentTarget.style.background = 'white';
                                                                    e.currentTarget.style.borderColor = '#d1d5db';
                                                                }
                                                            }}
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    );
                                                } else if (
                                                    pageNumber === currentPage - 2 ||
                                                    pageNumber === currentPage + 2
                                                ) {
                                                    return <span key={pageNumber} style={{ padding: '0.5rem', color: '#9ca3af' }}>...</span>;
                                                }
                                                return null;
                                            })}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: currentPage === totalPages ? '#e5e7eb' : '#0a5757',
                                                color: currentPage === totalPages ? '#9ca3af' : 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                                fontWeight: '600',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (currentPage !== totalPages) e.currentTarget.style.background = '#2d6a4f';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (currentPage !== totalPages) e.currentTarget.style.background = '#0a5757';
                                            }}
                                        >
                                            Sau →
                                        </button>
                                    </div>

                                    <div style={{
                                        textAlign: 'center',
                                        color: '#6b7280',
                                        fontSize: '0.875rem'
                                    }}>
                                        Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredRooms.length)} trong tổng số {filteredRooms.length} phòng
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HotelOverviewPage;