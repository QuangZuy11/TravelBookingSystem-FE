import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import { formatAddress } from '../../../utils/addressHelpers';
import { MAP_CONFIG } from '../../../config/mapConfig';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    shadowUrl: markerIconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

const HotelLocationPage = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        address: {
            coordinates: {
                latitude: '',
                longitude: ''
            },
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: ''
        }
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
                    address: {
                        coordinates: {
                            latitude: hotelData.address?.coordinates?.latitude || '',
                            longitude: hotelData.address?.coordinates?.longitude || ''
                        },
                        street: hotelData.address?.street || '',
                        city: hotelData.address?.city || '',
                        state: hotelData.address?.state || '',
                        country: hotelData.address?.country || '',
                        zipCode: hotelData.address?.zipCode || ''
                    }
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
        setFormData(prev => {
            // Handle nested object path (e.g., 'address.coordinates.latitude')
            const path = name.split('.');
            const newData = { ...prev };
            let current = newData;

            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]] = { ...current[path[i]] };
            }
            current[path[path.length - 1]] = value;

            return newData;
        });
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
                            color: 'black',
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
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <label style={labelStyle}>
                                            Đường/Số nhà:
                                        </label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={formData.address.street}
                                            onChange={(e) => handleInputChange({
                                                target: {
                                                    name: 'address.street',
                                                    value: e.target.value
                                                }
                                            })}
                                            style={inputStyle}
                                            placeholder="VD: 123 Võ Nguyên Giáp"
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>
                                            Thành phố:
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.address.city}
                                            onChange={(e) => handleInputChange({
                                                target: {
                                                    name: 'address.city',
                                                    value: e.target.value
                                                }
                                            })}
                                            style={inputStyle}
                                            placeholder="VD: Hồ Chí Minh"
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <label style={labelStyle}>
                                            Quận/Huyện:
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.address.state}
                                            onChange={(e) => handleInputChange({
                                                target: {
                                                    name: 'address.state',
                                                    value: e.target.value
                                                }
                                            })}
                                            style={inputStyle}
                                            placeholder="VD: Quận 1"
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>
                                            Quốc gia:
                                        </label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.address.country}
                                            onChange={(e) => handleInputChange({
                                                target: {
                                                    name: 'address.country',
                                                    value: e.target.value
                                                }
                                            })}
                                            style={inputStyle}
                                            placeholder="VD: Vietnam"
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <label style={labelStyle}>
                                            Mã bưu chính:
                                        </label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={formData.address.zipCode}
                                            onChange={(e) => handleInputChange({
                                                target: {
                                                    name: 'address.zipCode',
                                                    value: e.target.value
                                                }
                                            })}
                                            style={inputStyle}
                                            placeholder="VD: 70000"
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1rem',
                                    marginTop: '1rem'
                                }}>
                                    <div>
                                        <label style={labelStyle}>
                                            Vĩ độ (Latitude):
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            name="latitude"
                                            value={formData.address.coordinates.latitude}
                                            onChange={(e) => handleInputChange({
                                                target: {
                                                    name: 'address.coordinates.latitude',
                                                    value: e.target.value
                                                }
                                            })}
                                            style={inputStyle}
                                            placeholder="VD: 21.0285"
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>
                                            Kinh độ (Longitude):
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            name="longitude"
                                            value={formData.address.coordinates.longitude}
                                            onChange={(e) => handleInputChange({
                                                target: {
                                                    name: 'address.coordinates.longitude',
                                                    value: e.target.value
                                                }
                                            })}
                                            style={inputStyle}
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
                                                <strong>Vĩ độ:</strong> {hotel.address?.coordinates?.latitude || 'Chưa cập nhật'}
                                            </div>
                                            <div>
                                                <strong>Kinh độ:</strong> {hotel.address?.coordinates?.longitude || 'Chưa cập nhật'}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <h4 style={{
                                            fontSize: '1.2rem',
                                            fontWeight: '600',
                                            color: '#1f2937',
                                            marginBottom: '0.5rem'
                                        }}>
                                            🗺️ Bản đồ
                                        </h4>
                                        <div style={{
                                            height: '400px',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            border: '2px solid #e5e7eb'
                                        }}>
                                            {hotel.address?.coordinates?.latitude && hotel.address?.coordinates?.longitude ? (
                                                <MapContainer
                                                    center={[
                                                        hotel.address.coordinates.latitude,
                                                        hotel.address.coordinates.longitude
                                                    ]}
                                                    zoom={MAP_CONFIG.DEFAULT_ZOOM}
                                                    style={{ height: '100%', width: '100%' }}
                                                >
                                                    <TileLayer
                                                        attribution={MAP_CONFIG.ATTRIBUTION}
                                                        url={MAP_CONFIG.TILE_LAYER}
                                                    />
                                                    <Marker
                                                        position={[
                                                            hotel.address.coordinates.latitude,
                                                            hotel.address.coordinates.longitude
                                                        ]}
                                                    >
                                                        <Popup>
                                                            <div>
                                                                <h3 style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                                                                    {hotel.name}
                                                                </h3>
                                                                <p style={{ margin: 0, fontSize: '14px' }}>
                                                                    {formatAddress(hotel.address)}
                                                                </p>
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                </MapContainer>
                                            ) : (
                                                <div style={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: '#f9fafb',
                                                    color: '#6b7280',
                                                    fontStyle: 'italic'
                                                }}>
                                                    Chưa có tọa độ để hiển thị bản đồ
                                                </div>
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