import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/shared/Breadcrumb';

const HotelPoliciesPage = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const provider = localStorage.getItem('provider');
    const providerId = provider ? JSON.parse(provider)._id : null;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hotel, setHotel] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [policies, setPolicies] = useState({
        checkIn: '14:00',
        checkOut: '12:00',
        cancellationPolicy: 'free_cancellation',
        cancellationDays: 3,
        childPolicy: 'allowed',
        petPolicy: 'not_allowed',
        smokingPolicy: 'no_smoking',
        partyPolicy: 'not_allowed',
        ageRestriction: 18,
        additionalPolicies: [],
        houseRules: []
    });

    useEffect(() => {
        fetchHotelPolicies();
    }, [hotelId]);

    const fetchHotelPolicies = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `/api/hotel/provider/${providerId}/hotels/${hotelId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setHotel(response.data.hotel);
                // Load policies from hotel data if exists
                if (response.data.hotel.policies) {
                    setPolicies({
                        ...policies,
                        ...response.data.hotel.policies
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching hotel policies:', error);
            toast.error('Không thể tải chính sách khách sạn!');
        } finally {
            setLoading(false);
        }
    };

    const handlePolicyChange = (field, value) => {
        setPolicies(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addAdditionalPolicy = () => {
        setPolicies(prev => ({
            ...prev,
            additionalPolicies: [...prev.additionalPolicies, { title: '', description: '' }]
        }));
    };

    const updateAdditionalPolicy = (index, field, value) => {
        setPolicies(prev => ({
            ...prev,
            additionalPolicies: prev.additionalPolicies.map((policy, i) =>
                i === index ? { ...policy, [field]: value } : policy
            )
        }));
    };

    const removeAdditionalPolicy = (index) => {
        setPolicies(prev => ({
            ...prev,
            additionalPolicies: prev.additionalPolicies.filter((_, i) => i !== index)
        }));
    };

    const addHouseRule = () => {
        setPolicies(prev => ({
            ...prev,
            houseRules: [...prev.houseRules, '']
        }));
    };

    const updateHouseRule = (index, value) => {
        setPolicies(prev => ({
            ...prev,
            houseRules: prev.houseRules.map((rule, i) => i === index ? value : rule)
        }));
    };

    const removeHouseRule = (index) => {
        setPolicies(prev => ({
            ...prev,
            houseRules: prev.houseRules.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await axios.put(
                `/api/hotel/provider/${providerId}/hotels/${hotelId}`,
                { policies },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('✅ Đã cập nhật chính sách thành công!');
                setIsEditing(false);
                fetchHotelPolicies();
            }
        } catch (error) {
            console.error('Error updating policies:', error);
            toast.error('Có lỗi xảy ra khi cập nhật chính sách!');
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
        gap: '1.5rem',
        marginBottom: '1.5rem'
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

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/provider' },
        { label: 'Hotel Overview', path: `/provider/hotels/${hotelId}/overview` },
        { label: 'Policies' }
    ];

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={{ textAlign: 'center', padding: '4rem', color: 'white' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <div style={{ fontSize: '1.5rem' }}>Đang tải chính sách...</div>
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
                        <h1 style={titleStyle}>📋 Chính sách khách sạn</h1>
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
                                        fetchHotelPolicies();
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

                {/* Check-in/Check-out Times */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>🕐</span>
                        Thời gian nhận/trả phòng
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Giờ nhận phòng</label>
                            {isEditing ? (
                                <input
                                    type="time"
                                    value={policies.checkIn}
                                    onChange={(e) => handlePolicyChange('checkIn', e.target.value)}
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937' }}>
                                    {policies.checkIn}
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>Giờ trả phòng</label>
                            {isEditing ? (
                                <input
                                    type="time"
                                    value={policies.checkOut}
                                    onChange={(e) => handlePolicyChange('checkOut', e.target.value)}
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937' }}>
                                    {policies.checkOut}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cancellation Policy */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>🔄</span>
                        Chính sách hủy phòng
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Loại chính sách</label>
                            {isEditing ? (
                                <select
                                    value={policies.cancellationPolicy}
                                    onChange={(e) => handlePolicyChange('cancellationPolicy', e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="free_cancellation">Hủy miễn phí</option>
                                    <option value="partial_refund">Hoàn tiền một phần</option>
                                    <option value="no_refund">Không hoàn tiền</option>
                                    <option value="flexible">Linh hoạt</option>
                                </select>
                            ) : (
                                <div style={{ fontSize: '1.1rem', color: '#1f2937' }}>
                                    {policies.cancellationPolicy === 'free_cancellation' && '✅ Hủy miễn phí'}
                                    {policies.cancellationPolicy === 'partial_refund' && '💰 Hoàn tiền một phần'}
                                    {policies.cancellationPolicy === 'no_refund' && '❌ Không hoàn tiền'}
                                    {policies.cancellationPolicy === 'flexible' && '🔄 Linh hoạt'}
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>Số ngày trước khi hủy miễn phí</label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    min="0"
                                    max="30"
                                    value={policies.cancellationDays}
                                    onChange={(e) => handlePolicyChange('cancellationDays', parseInt(e.target.value))}
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937' }}>
                                    {policies.cancellationDays} ngày
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* General Policies */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>📜</span>
                        Chính sách chung
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Chính sách trẻ em</label>
                            {isEditing ? (
                                <select
                                    value={policies.childPolicy}
                                    onChange={(e) => handlePolicyChange('childPolicy', e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="allowed">Cho phép</option>
                                    <option value="not_allowed">Không cho phép</option>
                                    <option value="with_conditions">Có điều kiện</option>
                                </select>
                            ) : (
                                <div style={{ fontSize: '1.1rem', color: '#1f2937' }}>
                                    {policies.childPolicy === 'allowed' && '✅ Cho phép'}
                                    {policies.childPolicy === 'not_allowed' && '❌ Không cho phép'}
                                    {policies.childPolicy === 'with_conditions' && '⚠️ Có điều kiện'}
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>Chính sách thú cưng</label>
                            {isEditing ? (
                                <select
                                    value={policies.petPolicy}
                                    onChange={(e) => handlePolicyChange('petPolicy', e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="allowed">Cho phép</option>
                                    <option value="not_allowed">Không cho phép</option>
                                    <option value="with_fee">Cho phép (có phí)</option>
                                </select>
                            ) : (
                                <div style={{ fontSize: '1.1rem', color: '#1f2937' }}>
                                    {policies.petPolicy === 'allowed' && '✅ Cho phép'}
                                    {policies.petPolicy === 'not_allowed' && '❌ Không cho phép'}
                                    {policies.petPolicy === 'with_fee' && '💰 Cho phép (có phí)'}
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>Chính sách hút thuốc</label>
                            {isEditing ? (
                                <select
                                    value={policies.smokingPolicy}
                                    onChange={(e) => handlePolicyChange('smokingPolicy', e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="no_smoking">Không hút thuốc</option>
                                    <option value="designated_areas">Khu vực chỉ định</option>
                                    <option value="allowed">Cho phép</option>
                                </select>
                            ) : (
                                <div style={{ fontSize: '1.1rem', color: '#1f2937' }}>
                                    {policies.smokingPolicy === 'no_smoking' && '🚭 Không hút thuốc'}
                                    {policies.smokingPolicy === 'designated_areas' && '📍 Khu vực chỉ định'}
                                    {policies.smokingPolicy === 'allowed' && '✅ Cho phép'}
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>Chính sách tiệc tùng</label>
                            {isEditing ? (
                                <select
                                    value={policies.partyPolicy}
                                    onChange={(e) => handlePolicyChange('partyPolicy', e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="not_allowed">Không cho phép</option>
                                    <option value="with_permission">Cần xin phép</option>
                                    <option value="allowed">Cho phép</option>
                                </select>
                            ) : (
                                <div style={{ fontSize: '1.1rem', color: '#1f2937' }}>
                                    {policies.partyPolicy === 'not_allowed' && '❌ Không cho phép'}
                                    {policies.partyPolicy === 'with_permission' && '📝 Cần xin phép'}
                                    {policies.partyPolicy === 'allowed' && '✅ Cho phép'}
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>Giới hạn độ tuổi</label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={policies.ageRestriction}
                                    onChange={(e) => handlePolicyChange('ageRestriction', parseInt(e.target.value))}
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937' }}>
                                    {policies.ageRestriction}+ tuổi
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* House Rules */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>🏠</span>
                        Nội quy khách sạn
                    </h2>
                    {isEditing && (
                        <button
                            onClick={addHouseRule}
                            style={{
                                ...buttonStyle,
                                background: '#10b981',
                                color: 'white',
                                marginBottom: '1rem'
                            }}
                        >
                            ➕ Thêm nội quy
                        </button>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {policies.houseRules.map((rule, index) => (
                            <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={rule}
                                            onChange={(e) => updateHouseRule(index, e.target.value)}
                                            placeholder="Nhập nội quy..."
                                            style={{ ...inputStyle, flex: 1 }}
                                        />
                                        <button
                                            onClick={() => removeHouseRule(index)}
                                            style={{
                                                ...buttonStyle,
                                                background: '#ef4444',
                                                color: 'white',
                                                padding: '0.75rem 1rem'
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ fontSize: '1rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
                                        {rule}
                                    </div>
                                )}
                            </div>
                        ))}
                        {policies.houseRules.length === 0 && !isEditing && (
                            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                                Chưa có nội quy nào
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Policies */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>📝</span>
                        Chính sách bổ sung
                    </h2>
                    {isEditing && (
                        <button
                            onClick={addAdditionalPolicy}
                            style={{
                                ...buttonStyle,
                                background: '#10b981',
                                color: 'white',
                                marginBottom: '1rem'
                            }}
                        >
                            ➕ Thêm chính sách
                        </button>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {policies.additionalPolicies.map((policy, index) => (
                            <div key={index} style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={policy.title}
                                            onChange={(e) => updateAdditionalPolicy(index, 'title', e.target.value)}
                                            placeholder="Tiêu đề chính sách..."
                                            style={{ ...inputStyle, marginBottom: '1rem' }}
                                        />
                                        <textarea
                                            value={policy.description}
                                            onChange={(e) => updateAdditionalPolicy(index, 'description', e.target.value)}
                                            placeholder="Mô tả chính sách..."
                                            rows="3"
                                            style={{ ...inputStyle, marginBottom: '1rem' }}
                                        />
                                        <button
                                            onClick={() => removeAdditionalPolicy(index)}
                                            style={{
                                                ...buttonStyle,
                                                background: '#ef4444',
                                                color: 'white',
                                                padding: '0.5rem 1rem'
                                            }}
                                        >
                                            🗑️ Xóa
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
                                            {policy.title}
                                        </h3>
                                        <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: '1.6' }}>
                                            {policy.description}
                                        </p>
                                    </>
                                )}
                            </div>
                        ))}
                        {policies.additionalPolicies.length === 0 && !isEditing && (
                            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                                Chưa có chính sách bổ sung nào
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

export default HotelPoliciesPage;
