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
    const token = localStorage.getItem('token');

    // Get provider _id from localStorage
    const provider = localStorage.getItem('provider');
    const providerId = provider ? JSON.parse(provider)._id : null;

    useEffect(() => {
        fetchHotel();
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

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;
    if (!hotel) return <ErrorAlert message="Hotel not found" />;

    const menuItems = [
        {
            icon: '📊',
            title: 'Tổng quan',
            description: 'Thống kê tổng quan',
            path: `/provider/hotels/${hotelId}/overview`,
            active: true
        },
        {
            icon: '🏨',
            title: 'Khách sạn',
            description: 'Thông tin cơ bản khách sạn',
            path: `/provider/hotels/${hotelId}/info`
        },
        {
            icon: '🛏️',
            title: 'Phòng',
            description: 'Quản lý phòng và loại phòng',
            path: `/provider/hotels/${hotelId}/rooms`
        },
        {
            icon: '📍',
            title: 'Vị trí',
            description: 'Địa chỉ và bản đồ',
            path: `/provider/hotels/${hotelId}/location`
        },
        {
            icon: '📋',
            title: 'Chính sách',
            description: 'Chính sách check-in/out, hủy phòng',
            path: `/provider/hotels/${hotelId}/policies`
        },
        {
            icon: '📞',
            title: 'Liên hệ',
            description: 'Thông tin liên hệ',
            path: `/provider/hotels/${hotelId}/contact`
        },
        {
            icon: '🛍️',
            title: 'Tiện ích',
            description: 'Tiện ích khách sạn',
            path: `/provider/hotels/${hotelId}/amenities`
        },
        {
            icon: '🖼️',
            title: 'Hình ảnh',
            description: `${hotel?.images?.length || 0} ảnh`,
            path: `/provider/hotels/${hotelId}/gallery`,
            badge: hotel?.images?.length || 0
        },
        {
            icon: '📅',
            title: 'Booking',
            description: 'Quản lý đặt phòng',
            path: `/provider/hotels/${hotelId}/bookings`
        },
        {
            icon: '🏷️',
            title: 'Giảm giá',
            description: 'Khuyến mãi và giảm giá',
            path: `/provider/hotels/${hotelId}/discounts`
        },
        {
            icon: '📢',
            title: 'Hotel Ads',
            description: 'Quảng cáo khách sạn',
            path: `/provider/hotels/${hotelId}/ads`
        }
    ];

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

                {/* Menu Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            style={{ textDecoration: 'none' }}
                        >
                            <div style={{
                                background: item.active ? '#10b981' : 'white',
                                color: item.active ? 'white' : '#1f2937',
                                borderRadius: '16px',
                                padding: '2rem',
                                boxShadow: item.active
                                    ? '0 10px 30px rgba(16, 185, 129, 0.3)'
                                    : '0 5px 15px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                border: item.active ? 'none' : '2px solid #e5e7eb',
                                transform: 'translateY(0)',
                                ':hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 15px 35px rgba(0,0,0,0.15)'
                                }
                            }}
                                onMouseEnter={(e) => {
                                    if (!item.active) {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!item.active) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                                    }
                                }}
                            >
                                <div style={{
                                    fontSize: '3rem',
                                    marginBottom: '1rem',
                                    textAlign: 'center'
                                }}>
                                    {item.icon}
                                </div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    marginBottom: '0.5rem',
                                    textAlign: 'center'
                                }}>
                                    {item.title}
                                </h3>
                                <p style={{
                                    fontSize: '1rem',
                                    opacity: 0.8,
                                    textAlign: 'center',
                                    margin: 0
                                }}>
                                    {item.description}
                                </p>
                            </div>
                        </Link>
                    ))}
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
                                {hotel.totalRooms || 0}
                            </div>
                            <div style={{ color: '#6b7280' }}>Tổng số phòng</div>
                        </div>
                        <div style={{
                            background: '#f0fdf4',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '2px solid #10b981'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                                {hotel.starRating || 0}
                            </div>
                            <div style={{ color: '#6b7280' }}>Xếp hạng sao</div>
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
                                0
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
                                0đ
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