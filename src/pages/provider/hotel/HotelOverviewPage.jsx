import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
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

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;
    if (!hotel) return <ErrorAlert message="Hotel not found" />;


    return (
        <div style={{
            minHeight: '100vh',
            background: '#f3f4f6',
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
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '0.5rem'
                    }}>
                        🏨 {hotel.name}
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                        {formatAddress(hotel.address)}
                    </p>
                </div>



                {/* Quick Stats */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    marginTop: '2rem',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '1.5rem'
                    }}>
                        📊 Thống kê nhanh
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div style={{
                            background: '#f0f9ff',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '2px solid #0ea5e9'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛏️</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0ea5e9' }}>
                                {stats.totalRooms}
                            </div>
                            <div style={{ color: '#6b7280' }}>Tổng số phòng</div>
                        </div>

                        <div style={{
                            background: '#fefce8',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '2px solid #eab308'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#eab308' }}>
                                {stats.todayBookings}
                            </div>
                            <div style={{ color: '#6b7280' }}>Đặt phòng hôm nay</div>
                        </div>
                        <div style={{
                            background: '#fdf2f8',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '2px solid #ec4899'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ec4899' }}>
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                    maximumFractionDigits: 0
                                }).format(stats.monthlyRevenue)}
                            </div>
                            <div style={{ color: '#6b7280' }}>Doanh thu tháng</div>
                        </div>
                    </div>
                </div>

                {/* Hotel Images Section */}
                {hotel.images && hotel.images.length > 0 && (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        marginTop: '2rem',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#1f2937',
                                margin: 0
                            }}>
                                🖼️ Hình ảnh khách sạn
                            </h2>
                            <Link
                                to={`/provider/hotels/${hotelId}/gallery`}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#10b981',
                                    color: 'white',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}
                            >
                                Xem tất cả ({hotel.images.length})
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
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = 'none';
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
                        padding: '2rem',
                        marginTop: '2rem',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#1f2937',
                                margin: 0
                            }}>
                                📍 Vị trí khách sạn
                            </h2>
                            <Link
                                to={`/provider/hotels/${hotelId}/location`}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#10b981',
                                    color: 'white',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}
                            >
                                Chỉnh sửa vị trí
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
                                                    background: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                🗺️ Mở Google Maps
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
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span>🧭</span>
                                Chỉ đường
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HotelOverviewPage;