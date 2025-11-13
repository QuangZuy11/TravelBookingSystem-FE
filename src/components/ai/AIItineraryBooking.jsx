/**
 * AI ITINERARY BOOKING COMPONENT - REDESIGNED
 * Modal đặt tour với giao diện đồng nhất
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    createBookingRequest,
    validateBookingData,
    formatVND,
    calculateDaysBetween
} from '../../services/aiItineraryBookingService';
import { getOriginalItinerary } from '../../services/newAIItineraryService';

const AIItineraryBooking = ({ aiItineraryId, itineraryData, onClose, onSuccess }) => {
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [itinerary, setItinerary] = useState(itineraryData || null);

    // Form state
    const [formData, setFormData] = useState({
        start_date: '',
        participant_number: 1,
        special_requests: '',
        contact_info: {
            name: user?.name || '',
            email: user?.email || '',
            phone: ''
        }
    });

    const [selectedActivities, setSelectedActivities] = useState([]);
    const [totalBudget, setTotalBudget] = useState(0);

    // Load itinerary if not provided
    useEffect(() => {
        if (!itineraryData && aiItineraryId) {
            loadItinerary();
        }
    }, [aiItineraryId, itineraryData]);

    // Calculate total budget when activities selected
    useEffect(() => {
        calculateTotalBudget();
    }, [selectedActivities]);

    const loadItinerary = async () => {
        try {
            setLoading(true);
            const response = await getOriginalItinerary(aiItineraryId);
            setItinerary(response.data);

            // Pre-select all activities
            const allActivities = [];
            response.data.itinerary_data?.forEach((day, dayIndex) => {
                day.activities?.forEach((activity, actIndex) => {
                    allActivities.push({
                        dayNumber: dayIndex + 1,
                        activityIndex: actIndex,
                        activity: activity
                    });
                });
            });
            setSelectedActivities(allActivities);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalBudget = () => {
        const total = selectedActivities.reduce((sum, item) => {
            return sum + (item.activity.cost || 0);
        }, 0);
        setTotalBudget(total);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            contact_info: {
                ...prev.contact_info,
                [name]: value
            }
        }));
    };

    const toggleActivity = (dayIndex, activityIndex, activity) => {
        const existingIndex = selectedActivities.findIndex(
            item => item.dayNumber === dayIndex + 1 && item.activityIndex === activityIndex
        );

        if (existingIndex > -1) {
            // Remove
            setSelectedActivities(prev => prev.filter((_, index) => index !== existingIndex));
        } else {
            // Add
            setSelectedActivities(prev => [...prev, {
                dayNumber: dayIndex + 1,
                activityIndex: activityIndex,
                activity: activity
            }]);
        }
    };

    const isActivitySelected = (dayIndex, activityIndex) => {
        return selectedActivities.some(
            item => item.dayNumber === dayIndex + 1 && item.activityIndex === activityIndex
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            console.log('🎯 Starting booking submission...');
            console.log('📋 User:', user);
            console.log('🗺️ Itinerary:', itinerary);
            console.log('🎫 AI Itinerary ID:', aiItineraryId);

            // Prepare booking data
            const bookingData = {
                ai_itinerary_id: aiItineraryId,
                user_id: user._id,
                destination: itinerary.destination,
                duration_days: itinerary.duration_days,
                participant_number: parseInt(formData.participant_number),
                start_date: formData.start_date,
                total_budget: totalBudget,
                selected_activities: selectedActivities.map(item => ({
                    day_number: item.dayNumber,
                    activity_name: item.activity.activity || item.activity.name,
                    activity_type: item.activity.type,
                    location: item.activity.location,
                    cost: item.activity.cost
                })),
                special_requests: formData.special_requests,
                contact_info: formData.contact_info
            };

            console.log('📤 Booking data prepared:', bookingData);

            // Validate
            const validationErrors = validateBookingData(bookingData);
            if (validationErrors.length > 0) {
                console.error('❌ Validation errors:', validationErrors);
                setError(validationErrors.join(', '));
                return;
            }

            console.log('✅ Validation passed, calling API...');

            // Create booking
            const response = await createBookingRequest(bookingData);

            console.log('✅ API Response:', response);

            if (response.success) {
                alert('🎉 Yêu cầu đặt tour thành công! Nhà cung cấp sẽ xem xét yêu cầu của bạn sớm.');
                if (onSuccess) onSuccess(response.data);
                if (onClose) onClose();
            }
        } catch (err) {
            console.error('❌ Booking submission error:', err);
            const errorMessage = err.message || 'Không thể tạo yêu cầu đặt tour';
            setError(errorMessage);
            alert(`❌ Lỗi: ${errorMessage}\n\n⚠️ Backend API chưa sẵn sàng. Đây là demo UI.`);
        } finally {
            setLoading(false);
        }
    };

    if (!itinerary) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
                <div style={{
                    background: 'white',
                    padding: '3rem',
                    borderRadius: '16px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ fontSize: '1.25rem', color: '#475569' }}>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '1rem',
        transition: 'all 0.2s ease',
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#475569',
        marginBottom: '0.5rem'
    };

    const sectionStyle = {
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '1.5rem'
    };

    const sectionTitleStyle = {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-in'
        }}>
            <div style={{
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                animation: 'slideUp 0.3s ease-out'
            }}>
                {/* Header với gradient */}
                <div style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    padding: '2rem',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    color: 'white',
                    position: 'relative'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                marginBottom: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                margin: 0
                            }}>
                                <span>✈️</span>
                                Đặt Chuyến Đi Của Bạn
                            </h2>
                            <p style={{ fontSize: '1rem', opacity: 0.9, margin: '0.5rem 0 0 0' }}>
                                Hoàn tất thông tin để gửi yêu cầu đến nhà cung cấp
                            </p>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                style={{
                                    fontSize: '2rem',
                                    color: 'white',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    lineHeight: '1'
                                }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ padding: '2rem' }}>
                    {/* Itinerary Summary */}
                    <div style={{
                        marginBottom: '2rem',
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                        borderRadius: '12px',
                        border: '2px solid rgba(59, 130, 246, 0.2)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#1e293b',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            margin: '0 0 1rem 0'
                        }}>
                            🗺️ {itinerary.destination}
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '1rem'
                        }}>
                            <div style={{
                                padding: '1rem',
                                background: 'white',
                                borderRadius: '8px',
                                textAlign: 'center',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📅</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                                    {itinerary.duration_days}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Ngày</div>
                            </div>
                            <div style={{
                                padding: '1rem',
                                background: 'white',
                                borderRadius: '8px',
                                textAlign: 'center',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🎨</div>
                                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', textTransform: 'capitalize' }}>
                                    {itinerary.travel_style}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Phong cách</div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                            border: '2px solid #ef4444',
                            borderRadius: '12px',
                            color: '#991b1b',
                            fontSize: '0.95rem',
                            fontWeight: '500'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Travel Details */}
                        <div style={sectionStyle}>
                            <h3 style={sectionTitleStyle}>
                                📅 Chi Tiết Chuyến Đi
                            </h3>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '1rem'
                            }}>
                                <div>
                                    <label style={labelStyle}>Ngày Bắt Đầu *</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Số Người Tham Gia *</label>
                                    <input
                                        type="number"
                                        name="participant_number"
                                        value={formData.participant_number}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="50"
                                        required
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div style={sectionStyle}>
                            <h3 style={sectionTitleStyle}>
                                📞 Thông Tin Liên Hệ
                            </h3>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '1rem'
                            }}>
                                <div>
                                    <label style={labelStyle}>Họ và Tên *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.contact_info.name}
                                        onChange={handleContactChange}
                                        required
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.contact_info.email}
                                        onChange={handleContactChange}
                                        required
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Số Điện Thoại *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.contact_info.phone}
                                        onChange={handleContactChange}
                                        required
                                        pattern="[0-9]{10,11}"
                                        placeholder="0912345678"
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Select Activities */}
                        <div style={sectionStyle}>
                            <h3 style={sectionTitleStyle}>
                                ✅ Chọn Hoạt Động
                            </h3>

                            {itinerary.itinerary_data?.map((day, dayIndex) => (
                                <div key={dayIndex} style={{
                                    marginBottom: '1.5rem',
                                    padding: '1rem',
                                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                                    borderRadius: '8px',
                                    border: '1px solid #bae6fd'
                                }}>
                                    <h4 style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        color: '#0c4a6e',
                                        marginBottom: '1rem'
                                    }}>
                                        Day {dayIndex + 1}: {day.day || day.title}
                                    </h4>

                                    {day.activities?.map((activity, actIndex) => {
                                        const isSelected = isActivitySelected(dayIndex, actIndex);
                                        return (
                                            <div
                                                key={actIndex}
                                                onClick={() => toggleActivity(dayIndex, actIndex, activity)}
                                                style={{
                                                    padding: '0.75rem',
                                                    marginBottom: '0.5rem',
                                                    background: isSelected ? 'white' : '#f8fafc',
                                                    border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSelected) e.currentTarget.style.background = '#f1f5f9';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                                                }}
                                            >
                                                <div>
                                                    <div style={{
                                                        fontWeight: '600',
                                                        color: '#1e293b',
                                                        marginBottom: '0.25rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}>
                                                        {isSelected && <span style={{ color: '#3b82f6' }}>✓</span>}
                                                        {activity.activity || activity.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                                        📍 {activity.location} • {activity.type}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: '1rem',
                                                    fontWeight: '700',
                                                    color: isSelected ? '#3b82f6' : '#475569'
                                                }}>
                                                    {formatVND(activity.cost)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {/* Special Requests */}
                        <div style={sectionStyle}>
                            <h3 style={sectionTitleStyle}>
                                💬 Yêu Cầu Đặc Biệt
                            </h3>
                            <textarea
                                name="special_requests"
                                value={formData.special_requests}
                                onChange={handleInputChange}
                                rows="4"
                                placeholder="Có yêu cầu đặc biệt nào không? (tùy chọn)"
                                style={{
                                    ...inputStyle,
                                    resize: 'vertical',
                                    minHeight: '100px'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>

                        {/* Total Budget */}
                        <div style={{
                            ...sectionStyle,
                            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                            border: '2px solid #3b82f6'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '1rem', color: '#1e40af', fontWeight: '600' }}>
                                        Tổng Chi Phí Dự Kiến
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.25rem' }}>
                                        {selectedActivities.length} hoạt động đã chọn
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    color: '#1e40af'
                                }}>
                                    {formatVND(totalBudget)}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || selectedActivities.length === 0}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: loading || selectedActivities.length === 0
                                    ? '#94a3b8'
                                    : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1.125rem',
                                fontWeight: '700',
                                cursor: loading || selectedActivities.length === 0 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: loading || selectedActivities.length === 0
                                    ? 'none'
                                    : '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                                marginTop: '1.5rem'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading && selectedActivities.length > 0) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 15px 20px -5px rgba(59, 130, 246, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading && selectedActivities.length > 0) {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.3)';
                                }
                            }}
                        >
                            {loading ? '⏳ Đang Gửi...' : '🚀 Gửi Yêu Cầu Đặt Tour'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIItineraryBooking;
