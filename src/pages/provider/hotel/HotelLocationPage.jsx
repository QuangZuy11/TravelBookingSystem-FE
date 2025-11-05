import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import { formatAddress } from '../../../utils/addressHelpers';

const HotelLocationPage = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        address: '',
        latitude: '',
        longitude: '',
        nearbyAttractions: []
    });
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
                const hotelData = response.data.data;
                setHotel(hotelData);
                setFormData({
                    address: hotelData.address || '',
                    latitude: hotelData.latitude || '',
                    longitude: hotelData.longitude || '',
                    nearbyAttractions: hotelData.nearbyAttractions || []
                });
            }
        } catch (err) {
            console.error('Error fetching hotel:', err);
            setError('Failed to load hotel details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateLocation = async () => {
        try {
            await axios.put(`/api/hotel/provider/${providerId}/hotels/${hotelId}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsEditing(false);
            fetchHotel();
            alert('Location updated successfully!');
        } catch (err) {
            console.error('Error updating location:', err);
            alert('Failed to update location');
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;
    if (!hotel) return <ErrorAlert message="Hotel not found" />;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#10b981',
            padding: '2rem'
        }}>
            <div style={{
                maxWidth: '1200px',
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
                                color: '#10b981',
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
                            background: '#10b981',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '0.5rem'
                        }}>
                            📍 Vị trí khách sạn
                        </h1>
                        <p style={{ color: '#6b7280' }}>
                            Quản lý địa chỉ và thông tin vị trí
                        </p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            ✏️ Chỉnh sửa
                        </button>
                    )}
                </div>

                {/* Content */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                }}>
                    {isEditing ? (
                        <div>
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                marginBottom: '2rem'
                            }}>
                                <button
                                    onClick={handleUpdateLocation}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    💾 Lưu thay đổi
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        fetchHotel();
                                    }}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: '#f3f4f6',
                                        color: '#6b7280',
                                        border: '2px solid #d1d5db',
                                        borderRadius: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Hủy
                                </button>
                            </div>

                            {/* Edit Form */}
                            <div style={{
                                display: 'grid',
                                gap: '2rem'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Địa chỉ đầy đủ:
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '1rem'
                                        }}
                                        placeholder="Nhập địa chỉ đầy đủ của khách sạn..."
                                    />
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontWeight: '600',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }}>
                                            Vĩ độ (Latitude):
                                        </label>
                                        <input
                                            type="number"
                                            name="latitude"
                                            value={formData.latitude}
                                            onChange={handleInputChange}
                                            step="any"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '8px',
                                                fontSize: '1rem'
                                            }}
                                            placeholder="VD: 21.0285"
                                        />
                                    </div>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontWeight: '600',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }}>
                                            Kinh độ (Longitude):
                                        </label>
                                        <input
                                            type="number"
                                            name="longitude"
                                            value={formData.longitude}
                                            onChange={handleInputChange}
                                            step="any"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '8px',
                                                fontSize: '1rem'
                                            }}
                                            placeholder="VD: 105.8048"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Location Display */}
                            <div style={{
                                display: 'grid',
                                gap: '2rem'
                            }}>
                                <div>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: '#1f2937',
                                        marginBottom: '1rem'
                                    }}>
                                        🏠 Địa chỉ
                                    </h3>
                                    <div style={{
                                        padding: '1rem',
                                        background: '#f9fafb',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1.1rem',
                                        lineHeight: 1.6
                                    }}>
                                        {formatAddress(hotel.address)}
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <h4 style={{
                                            fontSize: '1.2rem',
                                            fontWeight: '600',
                                            color: '#1f2937',
                                            marginBottom: '0.5rem'
                                        }}>
                                            📐 Tọa độ
                                        </h4>
                                        <div style={{
                                            padding: '1rem',
                                            background: '#f0f9ff',
                                            border: '2px solid #0ea5e9',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <strong>Vĩ độ:</strong> {hotel.latitude || 'Chưa cập nhật'}
                                            </div>
                                            <div>
                                                <strong>Kinh độ:</strong> {hotel.longitude || 'Chưa cập nhật'}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 style={{
                                            fontSize: '1.2rem',
                                            fontWeight: '600',
                                            color: '#1f2937',
                                            marginBottom: '0.5rem'
                                        }}>
                                            🗺️ Bản đồ
                                        </h4>
                                        <div style={{
                                            padding: '1rem',
                                            background: '#fefce8',
                                            border: '2px solid #eab308',
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}>
                                            {hotel.latitude && hotel.longitude ? (
                                                <a
                                                    href={`https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        color: '#eab308',
                                                        textDecoration: 'none',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    🌍 Xem trên Google Maps
                                                </a>
                                            ) : (
                                                <span style={{ color: '#6b7280' }}>
                                                    Chưa có tọa độ
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Nearby Attractions */}
                                <div>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: '#1f2937',
                                        marginBottom: '1rem'
                                    }}>
                                        🎯 Địa điểm lân cận
                                    </h3>
                                    <div style={{
                                        padding: '1rem',
                                        background: '#f0fdf4',
                                        border: '2px solid #10b981',
                                        borderRadius: '8px'
                                    }}>
                                        {hotel.nearbyAttractions && hotel.nearbyAttractions.length > 0 ? (
                                            <ul style={{
                                                margin: 0,
                                                paddingLeft: '1.5rem'
                                            }}>
                                                {hotel.nearbyAttractions.map((attraction, index) => (
                                                    <li key={index} style={{
                                                        marginBottom: '0.5rem',
                                                        color: '#065f46'
                                                    }}>
                                                        {attraction}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p style={{
                                                margin: 0,
                                                color: '#6b7280',
                                                fontStyle: 'italic'
                                            }}>
                                                Chưa cập nhật thông tin địa điểm lân cận
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HotelLocationPage;