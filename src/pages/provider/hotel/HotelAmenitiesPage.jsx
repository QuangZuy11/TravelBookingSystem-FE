import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/shared/Breadcrumb';
import { Sparkles, ArrowLeft, Edit, Save, X, Check } from 'lucide-react';

const HotelAmenitiesPage = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const provider = localStorage.getItem('provider');
    const providerId = provider ? JSON.parse(provider)._id : null;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hotel, setHotel] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [amenities, setAmenities] = useState([]);

    const amenitiesOptions = [
        'Wifi',
        'Bãi đậu xe',
        'Hồ bơi',
        'Phòng gym',
        'Nhà hàng',
        'Spa',
        'Quầy bar',
        'Trung tâm thương mại',
        'Thang máy',
        'Đưa đón sân bay',
        'Điều hòa',
        'Dịch vụ giặt là'
    ];

    useEffect(() => {
        fetchHotelAmenities();
    }, [hotelId]);

    const fetchHotelAmenities = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `/api/hotel/provider/${providerId}/hotels/${hotelId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const hotelData = response.data.data; // Thay đổi từ response.data.hotel sang response.data.data
                setHotel(hotelData);
                setAmenities(hotelData.amenities || []);
                console.log("Loaded amenities:", hotelData.amenities); // Debug log
            }
        } catch (error) {
            console.error('Error fetching hotel amenities:', error);
            toast.error('Không thể tải tiện nghi khách sạn!');
        } finally {
            setLoading(false);
        }
    };

    const toggleAmenity = (amenity) => {
        setAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(item => item !== amenity)
                : [...prev, amenity]
        );
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            console.log("Saving amenities:", amenities); // Debug log
            const response = await axios.put(
                `/api/hotel/provider/${providerId}/hotels/${hotelId}`,
                { amenities },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('✅ Đã cập nhật tiện nghi thành công!');
                setIsEditing(false);
                fetchHotelAmenities();
            }
        } catch (error) {
            console.error('Error updating amenities:', error);
            toast.error('Có lỗi xảy ra khi cập nhật tiện nghi!');
        } finally {
            setSaving(false);
        }
    };

    const containerStyle = {
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };

    const contentStyle = {
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '24px',
        padding: '3rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #e0e0e0'
    };

    const titleStyle = {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.5rem'
    };

    const sectionStyle = {
        marginBottom: '2rem',
        padding: '2rem',
        background: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e0e0e0'
    };

    const sectionTitleStyle = {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    };

    const buttonStyle = {
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const amenityItemStyle = (isSelected, isEditing) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        background: isSelected ? '#f0fdf4' : 'white',
        border: '1px solid',
        borderColor: isSelected ? '#0a5757' : '#e0e0e0',
        borderRadius: '12px',
        cursor: isEditing ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        fontSize: '0.95rem',
        fontWeight: isSelected ? '600' : '400',
        color: isSelected ? '#1a1a1a' : '#6b7280'
    });

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/provider' },
        { label: 'Hotel Overview', path: `/provider/hotels/${hotelId}/overview` },
        { label: 'Amenities' }
    ];

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={{ textAlign: 'center', padding: '4rem', color: 'white' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <div style={{ fontSize: '1.5rem' }}>Đang tải tiện nghi...</div>
                </div>
            </div>
        );
    }

    // Delete unused constants

    return (
        <div style={containerStyle}>
            <Breadcrumb items={breadcrumbItems} />

            <div style={contentStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div>
                        <h1 style={titleStyle}>
                            <Sparkles size={28} color="#0a5757" />
                            Tiện nghi khách sạn
                        </h1>
                        <p style={{ fontSize: '0.95rem', color: '#6b7280', marginTop: '0.5rem' }}>
                            {hotel?.name}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{
                                        ...buttonStyle,
                                        background: 'linear-gradient(135deg, #0a5757 0%, #2d6a4f 100%)',
                                        color: 'white',
                                        boxShadow: '0 4px 12px rgba(10, 87, 87, 0.25)',
                                        opacity: saving ? 0.6 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!saving) {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(10, 87, 87, 0.35)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!saving) {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(10, 87, 87, 0.25)';
                                        }
                                    }}
                                >
                                    <Save size={18} />
                                    {saving ? 'Đang lưu...' : 'Lưu'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        fetchHotelAmenities();
                                    }}
                                    style={{
                                        ...buttonStyle,
                                        background: '#f8f9fa',
                                        color: '#6b7280',
                                        border: '1px solid #e0e0e0'
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
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{
                                    ...buttonStyle,
                                    background: 'linear-gradient(135deg, #0a5757 0%, #2d6a4f 100%)',
                                    color: 'white',
                                    boxShadow: '0 4px 12px rgba(10, 87, 87, 0.25)'
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
                </div>

                {/* Statistics */}
                {!isEditing && (
                    <div style={{
                        padding: '2rem',
                        background: 'linear-gradient(135deg, #0a5757 0%, #2d6a4f 100%)',
                        borderRadius: '12px',
                        color: 'white',
                        textAlign: 'center',
                        marginBottom: '2rem',
                        boxShadow: '0 4px 12px rgba(10, 87, 87, 0.25)'
                    }}>
                        <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
                            <Sparkles size={40} color="white" />
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                            {amenities.length}
                        </div>
                        <div style={{ fontSize: '0.95rem', opacity: 0.95 }}>
                            Tiện nghi đang được cung cấp
                        </div>
                    </div>
                )}

                {/* Available Amenities */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>
                        <Sparkles size={20} color="#0a5757" />
                        Danh sách tiện nghi
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        {amenitiesOptions.map(amenity => {
                            const isSelected = amenities.includes(amenity);
                            return (
                                <div
                                    key={amenity}
                                    onClick={() => isEditing && toggleAmenity(amenity)}
                                    style={amenityItemStyle(isSelected, isEditing)}
                                >
                                    {isEditing && (
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => { }}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    )}
                                    {!isEditing && isSelected && (
                                        <Check size={18} color="#0a5757" />
                                    )}
                                    <span>{amenity}</span>
                                </div>
                            );
                        })}
                    </div>
                    {!isEditing && amenities.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            color: '#9ca3af',
                            padding: '2rem',
                            fontSize: '1rem'
                        }}>
                            Chưa có tiện nghi nào được thêm
                        </div>
                    )}
                </div>

                {/* Back Button */}
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button
                        onClick={() => navigate(`/provider/hotels/${hotelId}/overview`)}
                        style={{
                            ...buttonStyle,
                            background: '#f8f9fa',
                            color: '#6b7280',
                            border: '1px solid #e0e0e0'
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
                        <ArrowLeft size={18} />
                        Quay lại tổng quan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HotelAmenitiesPage;
