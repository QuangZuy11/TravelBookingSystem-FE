import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/shared/Breadcrumb';
import { Phone, Mail, Globe, ArrowLeft, Edit, Save, X } from 'lucide-react';

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

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        fontSize: '1rem',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        outline: 'none',
        background: 'white'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
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

    const infoCardStyle = {
        padding: '1rem',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e0e0e0'
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
                        <h1 style={titleStyle}>
                            <Phone size={28} color="#0a5757" />
                            Thông tin liên hệ
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
                                        fetchHotelContact();
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

                {/* Primary Contact */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>
                        <Phone size={20} color="#0a5757" />
                        Thông tin liên hệ chính
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>
                                <Phone size={16} color="#0a5757" />
                                Điện thoại
                            </label>
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
                                    <a href={`tel:${contact.phone}`} style={{ color: '#0a5757', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none' }}>
                                        {contact.phone || 'Chưa cập nhật'}
                                    </a>
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>
                                <Mail size={16} color="#0a5757" />
                                Email
                            </label>
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
                                    <a href={`mailto:${contact.email}`} style={{ color: '#0a5757', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none' }}>
                                        {contact.email || 'Chưa cập nhật'}
                                    </a>
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>
                                <Globe size={16} color="#0a5757" />
                                Website
                            </label>
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
                                        <a href={contact.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0a5757', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none' }}>
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

export default HotelContactPage;
