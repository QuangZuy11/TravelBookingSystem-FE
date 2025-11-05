import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/shared/Breadcrumb';

const HotelContactPage = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const provider = localStorage.getItem('provider');
    const providerId = provider ? JSON.parse(provider)._id : null;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hotel, setHotel] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [contact, setContact] = useState({
        phone: '',
        email: '',
        website: '',
        facebook: '',
        instagram: '',
        twitter: '',
        whatsapp: '',
        emergencyPhone: '',
        fax: '',
        receptionPhone: '',
        bookingPhone: '',
        supportEmail: '',
        contactPersons: []
    });

    useEffect(() => {
        fetchHotelContact();
    }, [hotelId]);

    const fetchHotelContact = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `/api/hotel/provider/${providerId}/hotels/${hotelId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setHotel(response.data.data);
                const hotelData = response.data.data;
                // Load contact from hotel data if exists
                setContact(prev => ({
                    ...prev,
                    phone: hotelData.contactInfo?.phone || '',
                    email: hotelData.contactInfo?.email || '',
                    website: hotelData.contactInfo?.website || ''
                }));
            }
        } catch (error) {
            console.error('Error fetching hotel contact:', error);
            toast.error('Không thể tải thông tin liên hệ!');
        } finally {
            setLoading(false);
        }
    };

    const handleContactChange = (field, value) => {
        setContact(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addContactPerson = () => {
        setContact(prev => ({
            ...prev,
            contactPersons: [
                ...prev.contactPersons,
                { name: '', position: '', phone: '', email: '' }
            ]
        }));
    };

    const updateContactPerson = (index, field, value) => {
        setContact(prev => ({
            ...prev,
            contactPersons: prev.contactPersons.map((person, i) =>
                i === index ? { ...person, [field]: value } : person
            )
        }));
    };

    const removeContactPerson = (index) => {
        setContact(prev => ({
            ...prev,
            contactPersons: prev.contactPersons.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await axios.put(
                `/api/hotel/provider/${providerId}/hotels/${hotelId}`,
                { contact },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('✅ Đã cập nhật thông tin liên hệ thành công!');
                setIsEditing(false);
                fetchHotelContact();
            }
        } catch (error) {
            console.error('Error updating contact:', error);
            toast.error('Có lỗi xảy ra khi cập nhật thông tin liên hệ!');
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
        maxWidth: '1200px',
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

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        fontSize: '1rem',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '0.5rem'
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

    const infoCardStyle = {
        padding: '1rem',
        background: 'white',
        borderRadius: '12px',
        border: '2px solid #e5e7eb'
    };

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/provider' },
        { label: 'Hotel Overview', path: `/provider/hotels/${hotelId}/overview` },
        { label: 'Contact' }
    ];

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={{ textAlign: 'center', padding: '4rem', color: 'white' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <div style={{ fontSize: '1.5rem' }}>Đang tải thông tin liên hệ...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <Breadcrumb items={breadcrumbItems} />

            <div style={contentStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div>
                        <h1 style={titleStyle}>📞 Thông tin liên hệ</h1>
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
                                        fetchHotelContact();
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

                {/* Primary Contact */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>📱</span>
                        Thông tin liên hệ chính
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>📞 Điện thoại</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={contact.phone}
                                    onChange={(e) => handleContactChange('phone', e.target.value)}
                                    placeholder="+84 123 456 789"
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={infoCardStyle}>
                                    <a href={`tel:${contact.phone}`} style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none' }}>
                                        {contact.phone || 'Chưa cập nhật'}
                                    </a>
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>📧 Email</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={contact.email}
                                    onChange={(e) => handleContactChange('email', e.target.value)}
                                    placeholder="hotel@example.com"
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={infoCardStyle}>
                                    <a href={`mailto:${contact.email}`} style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none' }}>
                                        {contact.email || 'Chưa cập nhật'}
                                    </a>
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>🌐 Website</label>
                            {isEditing ? (
                                <input
                                    type="url"
                                    value={contact.website}
                                    onChange={(e) => handleContactChange('website', e.target.value)}
                                    placeholder="https://example.com"
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={infoCardStyle}>
                                    {contact.website ? (
                                        <a href={contact.website} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none' }}>
                                            {contact.website}
                                        </a>
                                    ) : (
                                        <span style={{ color: '#9ca3af' }}>Chưa cập nhật</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
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

export default HotelContactPage;
