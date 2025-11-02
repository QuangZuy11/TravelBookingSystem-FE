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
        if (calculateNights() <= 0) {
            alert('Vui lòng chọn ngày nhận và trả phòng hợp lệ');
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
            alert('Vui lòng chọn phòng trước khi đặt');
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

            if (response.ok && result.success) {
                // Success - move to step 2
                setReservationData(result.data);
                setCurrentStep(2);

                // Calculate countdown from expiry time
                const expireTime = new Date(result.data.booking.reserveExpireTime);
                const now = new Date();
                const remainingSeconds = Math.floor((expireTime - now) / 1000);
                setCountdown(Math.max(0, remainingSeconds));
            } else {
                // Handle errors with detailed messages
                console.error('❌ API Error:', result);

                if (response.status === 401) {
                    alert('⚠️ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                } else if (response.status === 400) {
                    // Show conflict dates if available
                    if (result.conflictDates && result.conflictDates.length > 0) {
                        const conflictInfo = result.conflictDates.map(c =>
                            `• ${new Date(c.checkIn).toLocaleDateString('vi-VN')} - ${new Date(c.checkOut).toLocaleDateString('vi-VN')} (${c.status})`
                        ).join('\n');

                        alert(`❌ ${result.message}\n\nPhòng đã được đặt trong các ngày:\n${conflictInfo}`);
                    } else {
                        alert(`❌ ${result.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra thông tin đặt phòng.'}`);
                    }
                } else if (response.status === 500) {
                    alert(`⚠️ Lỗi server: ${result.message || 'Có lỗi xảy ra trên server. Vui lòng thử lại sau.'}`);
                } else {
                    alert(result.message || 'Không thể tạo đặt phòng. Vui lòng thử lại.');
                }
            }
        } catch (error) {
            console.error('❌ Network Error:', error);
            alert('🔌 Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
        } finally {
            setIsReserving(false);
        }
    };



    // Handle back to step 1
    const handleBackToStep1 = () => {
        // Cancel reservation first
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
                                                            <span className="detail-value">{selectedRoomNumber?.area || 25}m²</span>
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
                                            Thanh toán QR Code
                                        </h4>
                                        <div className="qr-code-section">
                                            <div className="qr-code-placeholder">
                                                <div style={{
                                                    width: '250px',
                                                    height: '250px',
                                                    border: '2px solid #ddd',
                                                    borderRadius: '8px',
                                                    backgroundColor: '#f9f9f9',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    color: '#666',
                                                    margin: '0 auto 16px'
                                                }}>
                                                    <svg width="100" height="100" viewBox="0 0 100 100" fill="#333">
                                                        <rect x="10" y="10" width="20" height="20" fill="#333" />
                                                        <rect x="40" y="10" width="10" height="10" fill="#333" />
                                                        <rect x="60" y="10" width="10" height="10" fill="#333" />
                                                        <rect x="80" y="10" width="10" height="10" fill="#333" />
                                                        <rect x="10" y="40" width="10" height="10" fill="#333" />
                                                        <rect x="30" y="40" width="20" height="20" fill="#333" />
                                                        <rect x="60" y="40" width="30" height="10" fill="#333" />
                                                        <rect x="10" y="70" width="30" height="20" fill="#333" />
                                                        <rect x="50" y="70" width="10" height="10" fill="#333" />
                                                        <rect x="70" y="70" width="20" height="20" fill="#333" />
                                                    </svg>
                                                    <div style={{ marginTop: '8px', textAlign: 'center' }}>
                                                        QR Code Thanh Toán
                                                    </div>
                                                </div>

                                                <p>Quét mã QR để thanh toán</p>
                                                <p style={{ fontSize: '12px', color: '#666' }}>
                                                    Số tiền: {formatPrice(reservationData.booking.totalAmount)} VNĐ
                                                </p>

                                                <div className="bank-info">
                                                    <h5>Thông tin chuyển khoản</h5>
                                                    <div className="bank-details">
                                                        <div>Ngân hàng: <strong>Vietcombank</strong></div>
                                                        <div>Số tài khoản: <strong>1234567890</strong></div>
                                                        <div>Chủ tài khoản: <strong>Hotel Booking System</strong></div>
                                                        <div>Nội dung: <strong>THANHTOAN {reservationData.bookingId}</strong></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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