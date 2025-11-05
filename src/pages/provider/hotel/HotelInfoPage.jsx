import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import HotelForm from '../../../components/provider/forms/HotelForm';
import { formatAddress } from '../../../utils/addressHelpers';
import { getProxiedGoogleDriveUrl } from '../../../utils/googleDriveImageHelper';

const HotelInfoPage = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
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

    const handleUpdateHotel = async (formData) => {
        try {
            await axios.put(`/api/hotel/provider/${providerId}/hotels/${hotelId}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsEditing(false);
            fetchHotel();
            alert('Hotel updated successfully!');
        } catch (err) {
            console.error('Error updating hotel:', err);
            alert('Failed to update hotel');
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
                            color: '#1f2937',
                            marginBottom: '0.5rem'
                        }}>
                            🏨 Thông tin khách sạn
                        </h1>
                        <p style={{ color: '#6b7280' }}>
                            Quản lý thông tin cơ bản của khách sạn
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
                                    onClick={() => setIsEditing(false)}
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
                            <HotelForm
                                initialData={hotel}
                                onSubmit={handleUpdateHotel}
                            />
                        </div>
                    ) : (
                        <div>
                            {/* Hotel Details Display */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '2rem'
                            }}>
                                <div>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: '#1f2937',
                                        marginBottom: '1rem'
                                    }}>
                                        📝 Thông tin cơ bản
                                    </h3>
                                    <div style={{ space: '1rem' }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{
                                                fontWeight: '600',
                                                color: '#374151',
                                                display: 'block',
                                                marginBottom: '0.5rem'
                                            }}>
                                                Tên khách sạn:
                                            </label>
                                            <div style={{
                                                padding: '0.75rem',
                                                background: '#f9fafb',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '8px'
                                            }}>
                                                {hotel.name}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{
                                                fontWeight: '600',
                                                color: '#374151',
                                                display: 'block',
                                                marginBottom: '0.5rem'
                                            }}>
                                                Địa chỉ:
                                            </label>
                                            <div style={{
                                                padding: '0.75rem',
                                                background: '#f9fafb',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '8px'
                                            }}>
                                                {formatAddress(hotel.address)}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{
                                                fontWeight: '600',
                                                color: '#374151',
                                                display: 'block',
                                                marginBottom: '0.5rem'
                                            }}>
                                                Xếp hạng sao:
                                            </label>
                                            <div style={{
                                                padding: '0.75rem',
                                                background: '#f9fafb',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '8px'
                                            }}>
                                                {'⭐'.repeat(hotel.starRating || 0)} ({hotel.starRating || 0} sao)
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: '#1f2937',
                                        marginBottom: '1rem'
                                    }}>
                                        📞 Liên hệ
                                    </h3>
                                    <div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{
                                                fontWeight: '600',
                                                color: '#374151',
                                                display: 'block',
                                                marginBottom: '0.5rem'
                                            }}>
                                                Số điện thoại:
                                            </label>
                                            <div style={{
                                                padding: '0.75rem',
                                                background: '#f9fafb',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '8px'
                                            }}>
                                                {hotel.phoneNumber || 'Chưa cập nhật'}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{
                                                fontWeight: '600',
                                                color: '#374151',
                                                display: 'block',
                                                marginBottom: '0.5rem'
                                            }}>
                                                Email:
                                            </label>
                                            <div style={{
                                                padding: '0.75rem',
                                                background: '#f9fafb',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '8px'
                                            }}>
                                                {hotel.email || 'Chưa cập nhật'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {hotel.description && (
                                <div style={{ marginTop: '2rem' }}>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: '#1f2937',
                                        marginBottom: '1rem'
                                    }}>
                                        📄 Mô tả
                                    </h3>
                                    <div style={{
                                        padding: '1rem',
                                        background: '#f9fafb',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        lineHeight: 1.6
                                    }}>
                                        {hotel.description}
                                    </div>
                                </div>
                            )}

                            {/* Images */}
                            {hotel.images && hotel.images.length > 0 && (
                                <div style={{ marginTop: '2rem' }}>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: '#1f2937',
                                        marginBottom: '1rem'
                                    }}>
                                        🖼️ Hình ảnh
                                    </h3>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '1rem'
                                    }}>
                                        {hotel.images.map((image, index) => (
                                            <div key={index} style={{
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                border: '2px solid #e5e7eb',
                                                height: '150px',
                                                position: 'relative'
                                            }}>
                                                <img
                                                    src={getProxiedGoogleDriveUrl(image)}
                                                    alt={`Hotel ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#f3f4f6;color:#9ca3af;font-size:2rem;">🖼️</div>';
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HotelInfoPage;