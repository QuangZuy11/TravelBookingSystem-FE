import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../../../../../contexts/AuthContext';
import {
    Hotel, User, Phone, Mail, Bed, Calendar, CreditCard,
    QrCode, MapPin, ArrowLeft, Clock, X, AlertCircle,
    CheckCircle, Loader, DollarSign, Users, Building
} from 'lucide-react';
import './BookingModal.css';

const BookingModal = ({
    isOpen,
    onClose,
    selectedRoom,
    selectedRoomNumber,
    hotelData,
    previewData,
    previewLoading,
    previewError,
    onRetryPreview,
    bookingForm,
    onFormChange,
    discountPercent = 0
}) => {
    const { user } = useContext(AuthContext);
    const [currentStep, setCurrentStep] = useState(1);
    const [reservationData, setReservationData] = useState(null);
    const [countdown, setCountdown] = useState(120); // 2 minutes countdown
    const [isReserving, setIsReserving] = useState(false);
    const [error, setError] = useState(null);
    const [conflictDates, setConflictDates] = useState([]);
    const [paymentData, setPaymentData] = useState(null);
    const [isCreatingPayment, setIsCreatingPayment] = useState(false);

    // Handle cancel reservation
    const handleCancelReservation = useCallback(async () => {
        if (!reservationData?.bookingId) return;

        try {
            const response = await fetch(`/api/traveler/bookings/${reservationData.bookingId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const result = await response.json();

            if (result.success) {
                console.log('Reservation cancelled successfully');
            }
        } catch (error) {
            console.error('Error cancelling reservation:', error);
        }

        // Close modal regardless of API result
        onClose();
    }, [reservationData?.bookingId, onClose]);

    // Countdown timer effect
    useEffect(() => {
        if (currentStep === 2 && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        // Time expired, auto cancel booking
                        handleCancelReservation();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [currentStep, countdown, handleCancelReservation]);

    // Reset modal state when closed
    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(1);
            setReservationData(null);
            setPaymentData(null);
            setError(null);
            setConflictDates([]);
            setCountdown(120);
        }
    }, [isOpen]);

    // Format countdown time
    const formatCountdown = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Handle reservation creation (Step 1 -> Step 2)
    const handleCreateReservation = async () => {
        // Clear previous errors
        setError(null);
        setConflictDates([]);

        if (calculateNights() <= 0) {
            setError('Vui lòng chọn ngày nhận và trả phòng hợp lệ');
            return;
        }

        setIsReserving(true);

        // Get room ID - prioritize selectedRoomNumber (actual room instance)
        const roomId = selectedRoomNumber?._id || selectedRoomNumber?.id;

        console.log('🔍 Booking Data Debug:', {
            selectedRoom,
            selectedRoomNumber,
            roomId,
            checkInDate: bookingForm.checkInDate,
            checkOutDate: bookingForm.checkOutDate
        });

        // Validate room ID
        if (!roomId) {
            setError('Vui lòng chọn phòng trước khi đặt');
            setIsReserving(false);
            return;
        }

        try {
            const requestData = {
                hotel_room_id: roomId,
                check_in_date: new Date(bookingForm.checkInDate).toISOString(),
                check_out_date: new Date(bookingForm.checkOutDate).toISOString()
            };

            console.log('📤 Request Data:', requestData);

            // Call API to create reservation with NEW LOGIC
            // Backend will check date conflicts instead of room status
            const response = await fetch('/api/traveler/bookings/reserve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(requestData)
            });

            console.log('📥 Response Status:', response.status);

            const result = await response.json();
            console.log('📥 Response Data:', result);
            console.log('📥 Response Data Structure:', JSON.stringify(result.data, null, 2));

            if (response.ok && result.success) {
                // Success - move to step 2
                setReservationData(result.data);
                setError(null);

                // Calculate countdown from expiry time
                const expireTime = new Date(result.data.booking.reserveExpireTime);
                const now = new Date();
                const remainingSeconds = Math.floor((expireTime - now) / 1000);
                setCountdown(Math.max(0, remainingSeconds));

                // Create PayOS payment automatically (with error handling to not block booking)
                // Try multiple possible paths for booking ID
                const bookingId = result.data.booking?._id
                    || result.data.bookingId
                    || result.data._id
                    || result.data.booking?.id;

                console.log('🆔 Booking ID (extracted):', bookingId);
                console.log('🔍 result.data.booking:', result.data.booking);
                console.log('🔍 result.data.bookingId:', result.data.bookingId);
                console.log('🔍 result.data._id:', result.data._id);

                if (!bookingId) {
                    console.error('❌ Cannot find booking ID in response!');
                    setError('Đặt phòng thành công nhưng không tìm thấy booking ID. Vui lòng kiểm tra lại.');
                    setCurrentStep(2);
                    return;
                }

                try {
                    await handleCreatePayment(bookingId);
                } catch (paymentError) {
                    console.error('⚠️ Payment creation failed (non-blocking):', paymentError);
                    // Still move to step 2 even if payment fails
                    // User can manually retry payment later
                    setCurrentStep(2);
                }
            } else {
                // Handle errors with detailed messages
                console.error('❌ API Error:', result);

                if (response.status === 401) {
                    setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                } else if (response.status === 400) {
                    // Show conflict dates if available
                    if (result.conflictDates && result.conflictDates.length > 0) {
                        setError(result.message || 'Phòng đã được đặt trong khoảng thời gian này');
                        setConflictDates(result.conflictDates);
                    } else {
                        setError(result.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra thông tin đặt phòng.');
                    }
                } else if (response.status === 500) {
                    setError(result.message || 'Có lỗi xảy ra trên server. Vui lòng thử lại sau.');
                } else {
                    setError(result.message || 'Không thể tạo đặt phòng. Vui lòng thử lại.');
                }
            }
        } catch (error) {
            console.error('❌ Network Error:', error);
            setError('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
        } finally {
            setIsReserving(false);
        }
    };

    // Handle create PayOS payment
    const handleCreatePayment = async (bookingId) => {
        setIsCreatingPayment(true);
        setError(null); // Clear previous errors

        console.log('🔄 Creating payment for booking:', bookingId);

        try {
            const response = await fetch('http://localhost:3000/api/traveler/hotel-payments/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    booking_id: bookingId
                })
            });

            const result = await response.json();
            console.log('📥 Payment API Response:', result);

            if (response.ok && result.success) {
                console.log('✅ Payment created successfully');
                console.log('🖼️ QR Code Base64:', result.data.qr_code_base64 ? 'Available' : 'Missing');

                // Payment created successfully with QR code
                setPaymentData({
                    paymentId: result.data.payment_id,
                    qrCode: result.data.qr_code_base64 || result.data.qr_code, // Prioritize base64
                    qrCodeString: result.data.qr_code, // Keep original string for fallback
                    checkoutUrl: result.data.checkout_url,
                    amount: result.data.amount,
                    expiredAt: result.data.expired_at,
                    orderCode: result.data.order_code || result.data.payos_order_code
                });

                // Move to step 2 to show QR
                setCurrentStep(2);

                // Start polling payment status
                startPaymentStatusPolling(result.data.payment_id);
            } else {
                console.error('❌ Payment API Error:', {
                    status: response.status,
                    message: result.message,
                    errors: result.errors
                });

                // Throw error to be caught by try-catch in handleCreateReservation
                const errorMessage = response.status === 500
                    ? '⚠️ Backend PayOS chưa sẵn sàng. Vui lòng kiểm tra:\n1. PayOS credentials trong .env\n2. Backend console logs\n3. PayOS service initialization'
                    : response.status === 400
                        ? 'Thiếu booking_id hoặc booking không hợp lệ'
                        : response.status === 404
                            ? 'Không tìm thấy booking. Vui lòng đặt phòng lại.'
                            : response.status === 401
                                ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
                                : result.message || 'Không thể tạo thanh toán. Vui lòng thử lại.';

                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('❌ Payment Creation Error:', error);
            setError('Lỗi kết nối khi tạo thanh toán. Vui lòng thử lại.');
        } finally {
            setIsCreatingPayment(false);
        }
    };

    // Poll payment status every 3 seconds
    const startPaymentStatusPolling = (paymentId) => {
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`http://localhost:5178/api/traveler/hotel-payments/${paymentId}/status`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const result = await response.json();

                if (result.success) {
                    const status = result.data.status;

                    if (status === 'completed') {
                        clearInterval(pollInterval);
                        // Payment successful
                        alert('✅ Thanh toán thành công! Booking đã được xác nhận.');
                        onClose();
                    } else if (['failed', 'cancelled', 'expired'].includes(status)) {
                        clearInterval(pollInterval);
                        setError(`Thanh toán ${status === 'failed' ? 'thất bại' : status === 'cancelled' ? 'đã hủy' : 'hết hạn'}`);
                    }
                }
            } catch (error) {
                console.error('Poll error:', error);
            }
        }, 3000);

        // Stop polling after 2 minutes (when payment expires)
        setTimeout(() => {
            clearInterval(pollInterval);
        }, 120000);
    };



    // Handle back to step 1
    const handleBackToStep1 = async () => {
        // Cancel payment first if exists
        if (paymentData?.paymentId) {
            try {
                await fetch(`http://localhost:5178/api/traveler/hotel-payments/${paymentData.paymentId}/cancel`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
            } catch (error) {
                console.error('Error cancelling payment:', error);
            }
        }

        // Then cancel reservation
        handleCancelReservation();
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const formatAddress = (address) => {
        if (!address) return 'Địa chỉ khách sạn';

        if (typeof address === 'string') return address;

        // Nếu address là object, format thành string
        const parts = [
            address.street,
            address.city,
            address.state,
            address.country
        ].filter(Boolean); // Loại bỏ các giá trị null/undefined/empty

        return parts.length > 0 ? parts.join(', ') : 'Địa chỉ khách sạn';
    };

    // Function tính số đêm
    const calculateNights = () => {
        if (!bookingForm.checkInDate || !bookingForm.checkOutDate) return 0;
        const checkIn = new Date(bookingForm.checkInDate);
        const checkOut = new Date(bookingForm.checkOutDate);
        const diffTime = checkOut - checkIn;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    // Function tính tổng giá với giảm giá
    const calculateSubtotal = () => {
        const nights = calculateNights();
        const pricePerNight = previewData?.room?.pricePerNight || selectedRoom?.rawPrice || 0;
        return nights * pricePerNight;
    };

    const calculateDiscount = () => {
        return calculateSubtotal() * (discountPercent / 100);
    };

    const calculateTotalPrice = () => {
        return calculateSubtotal() - calculateDiscount();
    };

    if (!isOpen) return null;

    return (
        <div className="booking-modal-overlay" onClick={onClose}>
            <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
                <div className="booking-modal-header">
                    <h3>
                        {currentStep === 1 ? 'Thông tin đặt phòng' : 'Thanh toán'}
                        {currentStep === 2 && (
                            <span className="countdown-timer">
                                <Clock size={16} />
                                {formatCountdown(countdown)}
                            </span>
                        )}
                    </h3>
                    <button className="modal-close-btn" onClick={currentStep === 2 ? handleCancelReservation : onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="booking-modal-content">
                    {previewLoading ? (
                        <div className="booking-loading">
                            <Loader className="loading-spinner-icon" size={40} />
                            <p>Đang tải thông tin đặt phòng...</p>
                        </div>
                    ) : previewError ? (
                        <div className="booking-error">
                            <AlertCircle size={40} color="#dc3545" />
                            <p style={{ color: '#dc3545', marginTop: '12px' }}>{previewError}</p>
                            <button onClick={onRetryPreview} className="btn-retry">
                                Thử lại
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Step 1: Booking Information */}
                            {currentStep === 1 && (
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleCreateReservation();
                                }}>
                                    {/* Hotel Info Header */}
                                    <div className="booking-header-card">
                                        <div className="booking-hotel-info">
                                            <div className="hotel-logo">
                                                <Hotel size={32} color="#2d6a4f" />
                                            </div>
                                            <div className="hotel-details">
                                                <h3>{previewData?.hotel?.name || hotelData?.name || 'Tên khách sạn'}</h3>
                                                <div className="hotel-address">
                                                    <MapPin size={14} />
                                                    <span>
                                                        {formatAddress(previewData?.hotel?.address || hotelData?.address)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="booking-room-summary">
                                            <div className="room-summary-card">
                                                <h4>
                                                    <Bed size={20} style={{ marginRight: '8px' }} />
                                                    {selectedRoom?.name}
                                                </h4>
                                                <div className="room-details-grid">
                                                    <div className="detail-item">
                                                        <Building size={16} color="#666" />
                                                        <div>
                                                            <span className="detail-label">Phòng số</span>
                                                            <span className="detail-value">#{selectedRoomNumber?.roomNumber || 'TBA'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <Building size={16} color="#666" />
                                                        <div>
                                                            <span className="detail-label">Tầng</span>
                                                            <span className="detail-value">{selectedRoomNumber?.floor || 1}</span>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <Building size={16} color="#666" />
                                                        <div>
                                                            <span className="detail-label">Diện tích</span>
                                                            <span className="detail-value">25m²</span>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <Users size={16} color="#666" />
                                                        <div>
                                                            <span className="detail-label">Sức chứa</span>
                                                            <span className="detail-value">{selectedRoomNumber?.capacity || 2} người</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Guest Information */}
                                    <div className="booking-section">
                                        <h4>
                                            <User size={20} />
                                            Thông tin người đặt
                                        </h4>
                                        <div className="guest-info-notice" style={{
                                            backgroundColor: user ? '#e3f2fd' : '#fff3e0',
                                            border: user ? '1px solid #bbdefb' : '1px solid #ffcc02',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            marginBottom: '16px',
                                            fontSize: '14px',
                                            color: user ? '#1565c0' : '#f57c00'
                                        }}>
                                            <strong>ℹ️ Lưu ý:</strong>
                                            {user ?
                                                ' Thông tin người đặt được lấy từ tài khoản của bạn.' :
                                                ' Bạn chưa đăng nhập. Sử dụng thông tin demo để test đặt phòng.'
                                            }
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>
                                                    <User size={16} />
                                                    Họ và tên *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={previewData?.guest?.name || user?.fullName || user?.name || 'Hoàng'}
                                                    readOnly
                                                    disabled
                                                    className="readonly-input"
                                                    placeholder="Họ và tên từ tài khoản"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>
                                                    <Phone size={16} />
                                                    Số điện thoại *
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={previewData?.guest?.phone || user?.phone || user?.phoneNumber || '0971948009'}
                                                    readOnly
                                                    disabled
                                                    className="readonly-input"
                                                    placeholder="Số điện thoại từ tài khoản"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>
                                                <Mail size={16} />
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                value={previewData?.guest?.email || user?.email || 'phuc123@gmail.com'}
                                                readOnly
                                                disabled
                                                className="readonly-input"
                                                placeholder="Email từ tài khoản"
                                            />
                                        </div>
                                    </div>

                                    {/* Stay Information */}
                                    <div className="booking-section">
                                        <h4>
                                            <Calendar size={20} />
                                            Thông tin lưu trú
                                        </h4>

                                        <div className="date-selection-card">
                                            <div className="date-inputs">
                                                <div className="date-input-group">
                                                    <label>
                                                        <Calendar size={16} />
                                                        Nhận phòng
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={bookingForm.checkInDate}
                                                        onChange={(e) => onFormChange('checkInDate', e.target.value)}
                                                        required
                                                        min={new Date().toISOString().split('T')[0]}
                                                    />
                                                    <span className="time-hint">Từ 14:00</span>
                                                </div>

                                                <div className="date-separator">
                                                    <ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }} />
                                                </div>

                                                <div className="date-input-group">
                                                    <label>
                                                        <Calendar size={16} />
                                                        Trả phòng
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={bookingForm.checkOutDate}
                                                        onChange={(e) => onFormChange('checkOutDate', e.target.value)}
                                                        required
                                                        min={bookingForm.checkInDate || new Date().toISOString().split('T')[0]}
                                                    />
                                                    <span className="time-hint">Trước 12:00</span>
                                                </div>
                                            </div>

                                            {calculateNights() > 0 && (
                                                <div className="stay-duration">
                                                    <CheckCircle size={16} color="#2d6a4f" />
                                                    <span>{calculateNights()} đêm lưu trú</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                <AlertCircle size={16} />
                                                Yêu cầu đặc biệt
                                            </label>
                                            <textarea
                                                value={bookingForm.specialRequests}
                                                onChange={(e) => onFormChange('specialRequests', e.target.value)}
                                                placeholder="VD: Phòng tầng cao, gần thang máy, giường bổ sung..."
                                                rows="3"
                                            />
                                        </div>
                                    </div>

                                    {/* Error Display */}
                                    {error && (
                                        <div className="booking-error-banner">
                                            <div className="error-header">
                                                <AlertCircle size={20} color="#dc3545" />
                                                <span>{error}</span>
                                            </div>
                                            {conflictDates.length > 0 && (
                                                <div className="conflict-dates">
                                                    <p><strong>Phòng đã được đặt trong các ngày:</strong></p>
                                                    <ul>
                                                        {conflictDates.map((conflict, index) => (
                                                            <li key={index}>
                                                                <Calendar size={14} />
                                                                {new Date(conflict.checkIn).toLocaleDateString('vi-VN')} - {new Date(conflict.checkOut).toLocaleDateString('vi-VN')}
                                                                <span className={`status-badge ${conflict.status}`}>
                                                                    {conflict.status === 'confirmed' ? 'Đã xác nhận' : 'Đang giữ'}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Payment Summary */}
                                    <div className="booking-section">
                                        <h4>
                                            <CreditCard size={20} />
                                            Tóm tắt thanh toán
                                        </h4>
                                        <div className="payment-breakdown">
                                            <div className="payment-item">
                                                <span>
                                                    <Bed size={16} />
                                                    {formatPrice(previewData?.room?.pricePerNight || selectedRoom?.rawPrice || 0)} VNĐ × {calculateNights()} đêm
                                                </span>
                                                <span>{formatPrice(calculateSubtotal())} VNĐ</span>
                                            </div>

                                            {discountPercent > 0 && (
                                                <>
                                                    <div className="payment-item discount">
                                                        <span>
                                                            <DollarSign size={16} />
                                                            Giảm giá ({discountPercent}%)
                                                        </span>
                                                        <span className="discount-amount">-{formatPrice(calculateDiscount())} VNĐ</span>
                                                    </div>
                                                    <div className="payment-divider"></div>
                                                </>
                                            )}

                                            <div className="payment-item total">
                                                <span><strong>Tổng thanh toán</strong></span>
                                                <span><strong>{formatPrice(calculateTotalPrice())} VNĐ</strong></span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 1 Footer */}
                                    <div className="booking-modal-footer">
                                        <button type="button" className="btn-cancel" onClick={onClose}>
                                            <X size={18} style={{ marginRight: '6px' }} />
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-confirm"
                                            disabled={isReserving || calculateNights() <= 0}
                                            style={{
                                                opacity: (isReserving || calculateNights() <= 0) ? 0.7 : 1,
                                                cursor: (isReserving || calculateNights() <= 0) ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            {isReserving ? (
                                                <>
                                                    <Loader size={18} className="spinner-rotate" />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard size={18} />
                                                    Tiếp tục thanh toán
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Step 2: Payment QR Code */}
                            {currentStep === 2 && reservationData && (
                                <div className="payment-step">
                                    {/* Reservation Summary */}
                                    <div className="booking-header-card">
                                        <div className="countdown-warning">
                                            <Clock size={20} color="#d32f2f" />
                                            <div>
                                                <h4>Thời gian giữ phòng: {formatCountdown(countdown)}</h4>
                                                <p>Vui lòng hoàn tất thanh toán trước khi hết thời gian</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reservation Details */}
                                    <div className="booking-section">
                                        <h4>
                                            <CheckCircle size={20} color="#2d6a4f" />
                                            Thông tin đặt phòng
                                        </h4>
                                        <div className="reservation-summary">
                                            <div className="summary-item">
                                                <span>
                                                    <Building size={16} color="#666" />
                                                    Mã đặt phòng:
                                                </span>
                                                <span className="booking-id">{reservationData.bookingId}</span>
                                            </div>
                                            <div className="summary-item">
                                                <span>
                                                    <Hotel size={16} color="#666" />
                                                    Khách sạn:
                                                </span>
                                                <span>{reservationData.hotel.name}</span>
                                            </div>
                                            <div className="summary-item">
                                                <span>
                                                    <Bed size={16} color="#666" />
                                                    Phòng:
                                                </span>
                                                <span>#{reservationData.room.roomNumber} - {reservationData.room.type}</span>
                                            </div>
                                            <div className="summary-item">
                                                <span>
                                                    <Calendar size={16} color="#666" />
                                                    Thời gian:
                                                </span>
                                                <span>
                                                    {new Date(reservationData.booking.checkInDate).toLocaleDateString('vi-VN')} - {' '}
                                                    {new Date(reservationData.booking.checkOutDate).toLocaleDateString('vi-VN')}
                                                    ({reservationData.booking.nights} đêm)
                                                </span>
                                            </div>
                                            <div className="summary-item total">
                                                <span>
                                                    <DollarSign size={16} color="#2d6a4f" />
                                                    <strong>Tổng tiền:</strong>
                                                </span>
                                                <span className="total-amount"><strong>{formatPrice(reservationData.booking.totalAmount)} VNĐ</strong></span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR Code Payment */}
                                    <div className="booking-section">
                                        <h4>
                                            <QrCode size={20} />
                                            Thanh toán QR Code - PayOS
                                        </h4>

                                        {isCreatingPayment ? (
                                            <div className="qr-loading">
                                                <Loader className="loading-spinner-icon" size={40} />
                                                <p>Đang tạo mã thanh toán...</p>
                                            </div>
                                        ) : paymentData ? (
                                            <div className="qr-code-section">
                                                {/* PayOS QR Code */}
                                                <div className="qr-code-container">
                                                    {/* Check if qr_code is base64 image or raw string */}
                                                    {paymentData.qrCode.startsWith('data:image') ? (
                                                        <img
                                                            src={paymentData.qrCode}
                                                            alt="PayOS QR Code"
                                                            className="payos-qr-image"
                                                            style={{
                                                                width: '280px',
                                                                height: '280px',
                                                                border: '3px solid #0a5757',
                                                                borderRadius: '12px',
                                                                padding: '12px',
                                                                backgroundColor: 'white',
                                                                margin: '0 auto 16px',
                                                                display: 'block',
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                            }}
                                                        />
                                                    ) : (
                                                        /* Fallback: Show checkout URL button if QR is not image */
                                                        <div style={{
                                                            textAlign: 'center',
                                                            padding: '24px',
                                                            backgroundColor: '#f0f9ff',
                                                            borderRadius: '12px',
                                                            border: '2px solid #0a5757'
                                                        }}>
                                                            <QrCode size={64} color="#0a5757" style={{ marginBottom: '16px' }} />
                                                            <p style={{ marginBottom: '16px', color: '#0c4a6e', fontWeight: 500 }}>
                                                                QR Code format không được hỗ trợ
                                                            </p>
                                                            <a
                                                                href={paymentData.checkoutUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    display: 'inline-block',
                                                                    padding: '12px 24px',
                                                                    backgroundColor: '#0a5757',
                                                                    color: 'white',
                                                                    borderRadius: '8px',
                                                                    textDecoration: 'none',
                                                                    fontWeight: 600,
                                                                    boxShadow: '0 2px 8px rgba(10, 87, 87, 0.3)'
                                                                }}
                                                            >
                                                                Mở trang thanh toán PayOS
                                                            </a>
                                                            <p style={{ marginTop: '12px', fontSize: '13px', color: '#64748b' }}>
                                                                Hoặc copy link: <br />
                                                                <code style={{
                                                                    fontSize: '11px',
                                                                    padding: '4px 8px',
                                                                    backgroundColor: 'white',
                                                                    borderRadius: '4px',
                                                                    display: 'inline-block',
                                                                    marginTop: '4px',
                                                                    maxWidth: '300px',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis'
                                                                }}>
                                                                    {paymentData.checkoutUrl}
                                                                </code>
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="qr-instructions">
                                                        <div className="instruction-badge">
                                                            <QrCode size={16} />
                                                            <span>Quét mã QR bằng ứng dụng ngân hàng để thanh toán</span>
                                                        </div>
                                                        <div className="amount-display">
                                                            <DollarSign size={18} color="#0a5757" />
                                                            <span className="amount-text">
                                                                Số tiền: <strong>{formatPrice(paymentData.amount)} VNĐ</strong>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Payment Info */}
                                                <div className="payment-info-card">
                                                    <h5>
                                                        <AlertCircle size={16} />
                                                        Thông tin thanh toán
                                                    </h5>
                                                    <div className="payment-details">
                                                        <div className="detail-row">
                                                            <span className="label">Mã giao dịch:</span>
                                                            <span className="value">#{paymentData.orderCode}</span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="label">Hết hạn lúc:</span>
                                                            <span className="value">
                                                                {new Date(paymentData.expiredAt).toLocaleTimeString('vi-VN', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    second: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="label">Cổng thanh toán:</span>
                                                            <span className="value badge-payos">PayOS</span>
                                                        </div>
                                                    </div>

                                                    <div className="payment-notice">
                                                        <CheckCircle size={14} color="#059669" />
                                                        <p>Hệ thống sẽ tự động xác nhận sau khi thanh toán thành công</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="qr-error">
                                                <AlertCircle size={40} color="#dc3545" />
                                                <p>Không thể tạo mã thanh toán</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Step 2 Footer */}
                                    <div className="booking-modal-footer">
                                        <button type="button" className="btn-cancel" onClick={handleBackToStep1}>
                                            <ArrowLeft size={18} style={{ marginRight: '6px' }} />
                                            Quay lại
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-confirm"
                                            onClick={() => {
                                                alert('Thanh toán thành công! (Demo)');
                                                onClose();
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <CheckCircle size={18} />
                                            Đã thanh toán
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;