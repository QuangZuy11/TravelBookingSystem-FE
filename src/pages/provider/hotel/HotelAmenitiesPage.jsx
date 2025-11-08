import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/shared/Breadcrumb';

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
        borderBottom: '3px solid #10b981'
    };

    const titleStyle = {
        fontSize: '2.5rem',
        fontWeight: '700',
        background: '#10b981',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    };

    const sectionStyle = {
        marginBottom: '2rem',
        padding: '2rem',
        background: '#f9fafb',
        borderRadius: '16px',
        border: '2px solid #e5e7eb'
    };

    const sectionTitleStyle = {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    };

    const buttonStyle = {
        padding: '0.875rem 1.75rem',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    };

    const amenityItemStyle = (isSelected, isEditing) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        background: isSelected ? '#e0e7ff' : 'white',
        border: '2px solid',
        borderColor: isSelected ? '#10b981' : '#e5e7eb',
        borderRadius: '12px',
        cursor: isEditing ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        fontSize: '0.95rem',
        fontWeight: isSelected ? '600' : '400',
        color: isSelected ? '#1f2937' : '#6b7280'
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
                        <h1 style={titleStyle}>✨ Tiện nghi khách sạn</h1>
                        <p style={{ fontSize: '1rem', color: '#6b7280', marginTop: '0.5rem' }}>
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
                                        background: '#10b981',
                                        color: 'white',
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                        opacity: saving ? 0.6 : 1
                                    }}
                                >
                                    {saving ? '⏳ Đang lưu...' : '💾 Lưu'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        fetchHotelAmenities();
                                    }}
                                    style={{
                                        ...buttonStyle,
                                        background: 'white',
                                        color: '#6b7280',
                                        border: '2px solid #d1d5db'
                                    }}
                                >
                                    ❌ Hủy
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{
                                    ...buttonStyle,
                                    background: '#10b981',
                                    color: 'white',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                                }}
                            >
                                ✏️ Chỉnh sửa
                            </button>
                        )}
                    </div>
                </div>

                {/* Statistics */}
                {!isEditing && (
                    <div style={{
                        padding: '1.5rem',
                        background: '#10b981',
                        borderRadius: '16px',
                        color: 'white',
                        textAlign: 'center',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                            ✨
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                            {amenities.length}
                        </div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                            Tiện nghi đang được cung cấp
                        </div>
                    </div>
                )}

                {/* Available Amenities */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>✨</span>
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
                                        <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
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
                            background: '#f3f4f6',
                            color: '#6b7280',
                            border: '2px solid #d1d5db'
                        }}
                    >
                        ← Quay lại tổng quan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HotelAmenitiesPage;
