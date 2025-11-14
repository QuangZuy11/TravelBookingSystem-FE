import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import HotelForm from '../../../components/provider/forms/HotelForm';
import { formatAddress } from '../../../utils/addressHelpers';
import { getProxiedGoogleDriveUrl } from '../../../utils/googleDriveImageHelper';
import { Building2, FileText, Phone, ArrowLeft, Edit, X, Star, Image as ImageIcon } from 'lucide-react';

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
            console.error('Lỗi khi tải thông tin khách sạn:', err);
            setError('Không thể tải thông tin khách sạn');
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
            alert('Đã cập nhật khách sạn thành công!');
        } catch (err) {
            console.error('Lỗi khi cập nhật khách sạn:', err);
            alert('Không thể cập nhật khách sạn');
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;
    if (!hotel) return <ErrorAlert message="Không tìm thấy khách sạn" />;

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
                                color: '#0a5757',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: '500',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#2d6a4f';
                                e.currentTarget.style.transform = 'translateX(-4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#0a5757';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            <ArrowLeft size={18} />
                            Quay lại tổng quan
                        </button>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#1a1a1a',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <Building2 size={28} color="#0a5757" />
                            Thông tin khách sạn
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                            Quản lý thông tin cơ bản của khách sạn
                        </p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #0a5757 0%, #2d6a4f 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 12px rgba(10, 87, 87, 0.25)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(10, 87, 87, 0.35)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(10, 87, 87, 0.25)';
                            }}
                        >
                            <Edit size={18} />
                            Chỉnh sửa
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
                                        background: '#f8f9fa',
                                        color: '#6b7280',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '500',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#e8e8e8';
                                        e.currentTarget.style.color = '#1a1a1a';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#f8f9fa';
                                        e.currentTarget.style.color = '#6b7280';
                                    }}
                                >
                                    <X size={18} />
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
                                        fontSize: '1.25rem',
                                        fontWeight: '600',
                                        color: '#1a1a1a',
                                        marginBottom: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <FileText size={20} color="#0a5757" />
                                        Thông tin cơ bản
                                    </h3>
                                    <div style={{ space: '1rem' }}>
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <label style={{
                                                fontWeight: '600',
                                                color: '#1a1a1a',
                                                display: 'block',
                                                marginBottom: '0.75rem',
                                                fontSize: '0.95rem'
                                            }}>
                                                Tên khách sạn:
                                            </label>
                                            <div style={{
                                                padding: '1rem',
                                                background: '#f8f9fa',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '12px',
                                                fontSize: '1rem',
                                                color: '#1a1a1a'
                                            }}>
                                                {hotel.name}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <label style={{
                                                fontWeight: '600',
                                                color: '#1a1a1a',
                                                display: 'block',
                                                marginBottom: '0.75rem',
                                                fontSize: '0.95rem'
                                            }}>
                                                Địa chỉ:
                                            </label>
                                            <div style={{
                                                padding: '1rem',
                                                background: '#f8f9fa',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '12px',
                                                fontSize: '1rem',
                                                color: '#1a1a1a',
                                                lineHeight: 1.6
                                            }}>
                                                {formatAddress(hotel.address)}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <label style={{
                                                fontWeight: '600',
                                                color: '#1a1a1a',
                                                display: 'block',
                                                marginBottom: '0.75rem',
                                                fontSize: '0.95rem'
                                            }}>
                                                Xếp hạng sao:
                                            </label>
                                            <div style={{
                                                padding: '1rem',
                                                background: '#f8f9fa',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '12px',
                                                fontSize: '1rem',
                                                color: '#1a1a1a',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <Star size={18} color="#fbbf24" fill="#fbbf24" />
                                                {hotel.starRating || 0} sao
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '600',
                                        color: '#1a1a1a',
                                        marginBottom: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <Phone size={20} color="#0a5757" />
                                        Liên hệ
                                    </h3>
                                    <div>
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <label style={{
                                                fontWeight: '600',
                                                color: '#1a1a1a',
                                                display: 'block',
                                                marginBottom: '0.75rem',
                                                fontSize: '0.95rem'
                                            }}>
                                                Số điện thoại:
                                            </label>
                                            <div style={{
                                                padding: '1rem',
                                                background: '#f8f9fa',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '12px',
                                                fontSize: '1rem',
                                                color: '#1a1a1a'
                                            }}>
                                                {hotel.contactInfo?.phone || 'Chưa cập nhật'}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <label style={{
                                                fontWeight: '600',
                                                color: '#1a1a1a',
                                                display: 'block',
                                                marginBottom: '0.75rem',
                                                fontSize: '0.95rem'
                                            }}>
                                                Email:
                                            </label>
                                            <div style={{
                                                padding: '1rem',
                                                background: '#f8f9fa',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '12px',
                                                fontSize: '1rem',
                                                color: '#1a1a1a'
                                            }}>
                                                {hotel.contactInfo?.email || 'Chưa cập nhật'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {hotel.description && (
                                <div style={{ marginTop: '2rem' }}>
                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '600',
                                        color: '#1a1a1a',
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <FileText size={20} color="#0a5757" />
                                        Mô tả
                                    </h3>
                                    <div style={{
                                        padding: '1.25rem',
                                        background: '#f8f9fa',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '12px',
                                        lineHeight: 1.6,
                                        fontSize: '1rem',
                                        color: '#1a1a1a'
                                    }}>
                                        {hotel.description}
                                    </div>
                                </div>
                            )}

                            {/* Images */}
                            {hotel.images && hotel.images.length > 0 && (
                                <div style={{ marginTop: '2rem' }}>
                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '600',
                                        color: '#1a1a1a',
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <ImageIcon size={20} color="#0a5757" />
                                        Hình ảnh
                                    </h3>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '1rem'
                                    }}>
                                        {hotel.images.map((image, index) => (
                                            <div key={index} style={{
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                border: '1px solid #e0e0e0',
                                                height: '150px',
                                                position: 'relative',
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                                            }}
                                            >
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