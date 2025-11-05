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
                setHotel(response.data.hotel);
                // Load contact from hotel data if exists
                if (response.data.hotel.contact) {
                    setContact({
                        ...contact,
                        ...response.data.hotel.contact
                    });
                } else {
                    // Use basic fields from hotel if contact object doesn't exist
                    setContact(prev => ({
                        ...prev,
                        phone: response.data.hotel.phone || '',
                        email: response.data.hotel.email || ''
                    }));
                }
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
        background: '#10b981',
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

                {/* Department Contact */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>🏢</span>
                        Liên hệ phòng ban
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Lễ tân</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={contact.receptionPhone}
                                    onChange={(e) => handleContactChange('receptionPhone', e.target.value)}
                                    placeholder="+84 123 456 789"
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={infoCardStyle}>
                                    {contact.receptionPhone ? (
                                        <a href={`tel:${contact.receptionPhone}`} style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none' }}>
                                            {contact.receptionPhone}
                                        </a>
                                    ) : (
                                        <span style={{ color: '#9ca3af' }}>Chưa cập nhật</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>Đặt phòng</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={contact.bookingPhone}
                                    onChange={(e) => handleContactChange('bookingPhone', e.target.value)}
                                    placeholder="+84 123 456 789"
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={infoCardStyle}>
                                    {contact.bookingPhone ? (
                                        <a href={`tel:${contact.bookingPhone}`} style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none' }}>
                                            {contact.bookingPhone}
                                        </a>
                                    ) : (
                                        <span style={{ color: '#9ca3af' }}>Chưa cập nhật</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>Hỗ trợ</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={contact.supportEmail}
                                    onChange={(e) => handleContactChange('supportEmail', e.target.value)}
                                    placeholder="support@example.com"
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={infoCardStyle}>
                                    {contact.supportEmail ? (
                                        <a href={`mailto:${contact.supportEmail}`} style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none' }}>
                                            {contact.supportEmail}
                                        </a>
                                    ) : (
                                        <span style={{ color: '#9ca3af' }}>Chưa cập nhật</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>Khẩn cấp</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={contact.emergencyPhone}
                                    onChange={(e) => handleContactChange('emergencyPhone', e.target.value)}
                                    placeholder="+84 123 456 789"
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={infoCardStyle}>
                                    {contact.emergencyPhone ? (
                                        <a href={`tel:${contact.emergencyPhone}`} style={{ color: '#ef4444', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none' }}>
                                            🚨 {contact.emergencyPhone}
                                        </a>
                                    ) : (
                                        <span style={{ color: '#9ca3af' }}>Chưa cập nhật</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>Fax</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={contact.fax}
                                    onChange={(e) => handleContactChange('fax', e.target.value)}
                                    placeholder="+84 123 456 789"
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={infoCardStyle}>
                                    <span style={{ color: '#1f2937', fontSize: '1.1rem', fontWeight: '600' }}>
                                        {contact.fax || <span style={{ color: '#9ca3af' }}>Chưa cập nhật</span>}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>🌐</span>
                        Mạng xã hội
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>📘 Facebook</label>
                            {isEditing ? (
                                <input
                                    type="url"
                                    value={contact.facebook}
                                    onChange={(e) => handleContactChange('facebook', e.target.value)}
                                    placeholder="https://facebook.com/..."
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={infoCardStyle}>
                                    {contact.facebook ? (
                                        <a href={contact.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#1877f2', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none' }}>
                                            {contact.facebook}
                                        </a>
                                    ) : (
                                        <span style={{ color: '#9ca3af' }}>Chưa cập nhật</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>📷 Instagram</label>
                            {isEditing ? (
                                <input
                                    type="url"
                                    value={contact.instagram}
                                    onChange={(e) => handleContactChange('instagram', e.target.value)}
                                    placeholder="https://instagram.com/..."
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={infoCardStyle}>
                                    {contact.instagram ? (
                                        <a href={contact.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#e4405f', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none' }}>
                                            {contact.instagram}
                                        </a>
                                    ) : (
                                        <span style={{ color: '#9ca3af' }}>Chưa cập nhật</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>🐦 Twitter</label>
                            {isEditing ? (
                                <input
                                    type="url"
                                    value={contact.twitter}
                                    onChange={(e) => handleContactChange('twitter', e.target.value)}
                                    placeholder="https://twitter.com/..."
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={infoCardStyle}>
                                    {contact.twitter ? (
                                        <a href={contact.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#1da1f2', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none' }}>
                                            {contact.twitter}
                                        </a>
                                    ) : (
                                        <span style={{ color: '#9ca3af' }}>Chưa cập nhật</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>💬 WhatsApp</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={contact.whatsapp}
                                    onChange={(e) => handleContactChange('whatsapp', e.target.value)}
                                    placeholder="+84 123 456 789"
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={infoCardStyle}>
                                    {contact.whatsapp ? (
                                        <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25d366', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none' }}>
                                            {contact.whatsapp}
                                        </a>
                                    ) : (
                                        <span style={{ color: '#9ca3af' }}>Chưa cập nhật</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Persons */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>👥</span>
                        Người liên hệ
                    </h2>
                    {isEditing && (
                        <button
                            onClick={addContactPerson}
                            style={{
                                ...buttonStyle,
                                background: '#10b981',
                                color: 'white',
                                marginBottom: '1.5rem'
                            }}
                        >
                            ➕ Thêm người liên hệ
                        </button>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {contact.contactPersons.map((person, index) => (
                            <div key={index} style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
                                {isEditing ? (
                                    <>
                                        <div style={gridStyle}>
                                            <div>
                                                <label style={labelStyle}>Họ tên</label>
                                                <input
                                                    type="text"
                                                    value={person.name}
                                                    onChange={(e) => updateContactPerson(index, 'name', e.target.value)}
                                                    placeholder="Nguyễn Văn A"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Chức vụ</label>
                                                <input
                                                    type="text"
                                                    value={person.position}
                                                    onChange={(e) => updateContactPerson(index, 'position', e.target.value)}
                                                    placeholder="Quản lý"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Điện thoại</label>
                                                <input
                                                    type="tel"
                                                    value={person.phone}
                                                    onChange={(e) => updateContactPerson(index, 'phone', e.target.value)}
                                                    placeholder="+84 123 456 789"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Email</label>
                                                <input
                                                    type="email"
                                                    value={person.email}
                                                    onChange={(e) => updateContactPerson(index, 'email', e.target.value)}
                                                    placeholder="email@example.com"
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeContactPerson(index)}
                                            style={{
                                                ...buttonStyle,
                                                background: '#ef4444',
                                                color: 'white',
                                                marginTop: '1rem',
                                                padding: '0.5rem 1rem'
                                            }}
                                        >
                                            🗑️ Xóa
                                        </button>
                                    </>
                                ) : (
                                    <div style={gridStyle}>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Họ tên</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>{person.name}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Chức vụ</div>
                                            <div style={{ fontSize: '1.1rem', color: '#1f2937' }}>{person.position}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Điện thoại</div>
                                            <a href={`tel:${person.phone}`} style={{ fontSize: '1.1rem', color: '#10b981', fontWeight: '600', textDecoration: 'none' }}>
                                                {person.phone}
                                            </a>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Email</div>
                                            <a href={`mailto:${person.email}`} style={{ fontSize: '1.1rem', color: '#10b981', fontWeight: '600', textDecoration: 'none' }}>
                                                {person.email}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {contact.contactPersons.length === 0 && !isEditing && (
                            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                                Chưa có người liên hệ nào
                            </div>
                        )}
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
