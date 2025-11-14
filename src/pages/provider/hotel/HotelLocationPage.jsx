import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
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
    const [searchAddress, setSearchAddress] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState([]);
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

    // Styles
    const labelStyle = {
        display: 'block',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '0.5rem',
        fontSize: '0.875rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '1rem',
        transition: 'all 0.2s',
        outline: 'none'
    };

    // Parse Google Maps URL to extract coordinates
    const parseGoogleMapsUrl = (url) => {
        try {
            // Pattern 1: /@lat,lng,zoom
            const pattern1 = /@(-?\d+\.?\d*),(-?\d+\.?\d*),(\d+\.?\d*)z/;
            const match1 = url.match(pattern1);

            if (match1) {
                return {
                    latitude: parseFloat(match1[1]),
                    longitude: parseFloat(match1[2])
                };
            }

            // Pattern 2: /place/name/@lat,lng
            const pattern2 = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
            const match2 = url.match(pattern2);

            if (match2) {
                return {
                    latitude: parseFloat(match2[1]),
                    longitude: parseFloat(match2[2])
                };
            }

            // Pattern 3: ?q=lat,lng
            const pattern3 = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
            const match3 = url.match(pattern3);

            if (match3) {
                return {
                    latitude: parseFloat(match3[1]),
                    longitude: parseFloat(match3[2])
                };
            }

            return null;
        } catch (error) {
            console.error('Error parsing Google Maps URL:', error);
            return null;
        }
    };

    // Reverse geocoding to get address from coordinates
    const reverseGeocode = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
            );
            const data = await response.json();

            if (data && data.address) {
                const addr = data.address;
                setFormData({
                    address: {
                        coordinates: {
                            latitude: lat,
                            longitude: lon
                        },
                        street: addr.road || addr.suburb || addr.neighbourhood || '',
                        city: addr.city || addr.town || addr.province || '',
                        state: addr.state || addr.county || '',
                        country: addr.country || 'Vietnam',
                        zipCode: addr.postcode || ''
                    }
                });
            }
        } catch (error) {
            console.error('Error reverse geocoding:', error);
        }
    };

    // Handle Google Maps URL input
    const handleGoogleMapsUrl = async (url) => {
        const coords = parseGoogleMapsUrl(url);

        if (coords) {
            // Update coordinates
            setFormData(prev => ({
                address: {
                    ...prev.address,
                    coordinates: coords
                }
            }));

            // Get address details from coordinates
            await reverseGeocode(coords.latitude, coords.longitude);

            toast.success('✓ Đã phân tích tọa độ từ Google Maps!');
        } else {
            toast.error('URL Google Maps không hợp lệ. Vui lòng thử lại.');
        }
    };

    // Search address using Nominatim (OpenStreetMap)
    const searchAddressOnMap = async (query) => {
        // Check if it's a Google Maps URL
        if (query.includes('google.com/maps')) {
            await handleGoogleMapsUrl(query);
            setSearchAddress('');
            setAddressSuggestions([]);
            return;
        }

        if (query.length < 3) {
            setAddressSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=5&addressdetails=1`
            );
            const data = await response.json();
            setAddressSuggestions(data);
        } catch (error) {
            console.error('Error searching address:', error);
            setAddressSuggestions([]);
        }
    };

    // Handle address selection from suggestions
    const handleSelectAddress = (place) => {
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);

        // Parse address components
        const addr = place.address || {};

        setFormData({
            address: {
                coordinates: {
                    latitude: lat,
                    longitude: lon
                },
                street: addr.road || addr.suburb || place.display_name.split(',')[0] || '',
                city: addr.city || addr.town || addr.province || '',
                state: addr.state || addr.county || '',
                country: addr.country || 'Vietnam',
                zipCode: addr.postcode || ''
            }
        });

        setSearchAddress(place.display_name);
        setAddressSuggestions([]);
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchAddress && isEditing) {
                searchAddressOnMap(searchAddress);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchAddress, isEditing]);

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

    // Style definitions
    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '600',
        color: '#374151',
        fontSize: '0.95rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '2px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '1rem',
        transition: 'border-color 0.3s ease',
        outline: 'none'
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
                                {/* Address Search with Google Maps style */}
                                <div style={{ position: 'relative' }}>
                                    <label style={labelStyle}>
                                        🗺️ Nhập địa chỉ hoặc link Google Maps:
                                    </label>
                                    <div style={{
                                        background: '#f0fdf4',
                                        border: '1px solid #86efac',
                                        borderRadius: '8px',
                                        padding: '0.75rem',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem'
                                    }}>
                                        <strong>💡 Mẹo:</strong> Dán link Google Maps hoặc nhập địa chỉ để tự động điền
                                    </div>
                                    <input
                                        type="text"
                                        value={searchAddress}
                                        onChange={(e) => setSearchAddress(e.target.value)}
                                        style={{
                                            ...inputStyle,
                                            paddingLeft: '2.5rem',
                                            border: '2px solid #10b981',
                                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
                                        }}
                                        placeholder="VD: https://www.google.com/maps/... hoặc 'Khách sạn Rex, Quận 1'"
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        left: '0.75rem',
                                        top: '2.75rem',
                                        fontSize: '1.2rem'
                                    }}>
                                        🔍
                                    </span>

                                    {/* Suggestions Dropdown */}
                                    {addressSuggestions.length > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            background: 'white',
                                            border: '2px solid #10b981',
                                            borderTop: 'none',
                                            borderRadius: '0 0 8px 8px',
                                            maxHeight: '300px',
                                            overflowY: 'auto',
                                            zIndex: 1000,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}>
                                            {addressSuggestions.map((suggestion, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handleSelectAddress(suggestion)}
                                                    style={{
                                                        padding: '1rem',
                                                        borderBottom: index < addressSuggestions.length - 1 ? '1px solid #e5e7eb' : 'none',
                                                        cursor: 'pointer',
                                                        transition: 'background 0.2s',
                                                        '&:hover': {
                                                            background: '#f0fdf4'
                                                        }
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                                >
                                                    <div style={{ fontWeight: '600', color: '#10b981', marginBottom: '0.25rem' }}>
                                                        📍 {suggestion.display_name.split(',')[0]}
                                                    </div>
                                                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                        {suggestion.display_name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

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