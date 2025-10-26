import { useState, useContext, useEffect } from 'react';
import { FaHotel, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaBed, FaCreditCard, FaQrcode } from 'react-icons/fa';
import { AuthContext } from '../../../../../contexts/AuthContext';
import { getProxiedGoogleDriveUrl } from '../../../../../utils/googleDriveImageHelper';
import SmartImage from '../../../../../components/common/SmartImage';
import './HotelDetail.css';

export default function Rooms({ roomsData, loading, error, hotelData }) {
    const { user, updateUserInfo } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [bookingForm, setBookingForm] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        checkInDate: '',
        checkOutDate: '',
        specialRequests: ''
    });
    const [selectedRoomNumber, setSelectedRoomNumber] = useState(null);
    const [discountPercent] = useState(0); // Giảm giá 0%

    // Preview & Payment states
    const [previewData, setPreviewData] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    // Debug log để kiểm tra dữ liệu nhận được
    console.log('Rooms component received:', { roomsData, loading, error });
    console.log('Hotel Data:', hotelData);
    console.log('User Data from AuthContext:', user);
    console.log('AuthContext available:', !!user, user?.name, user?.email, user?.phone);

    // Check và update user info từ localStorage nếu user thiếu email/phone
    useEffect(() => {
        if (user && (!user.email || !user.phone)) {
            let storedEmail = localStorage.getItem('email');
            let storedPhone = localStorage.getItem('phone');

            // Temporary fix: Nếu localStorage không có, set thông tin từ profile
            if (!storedEmail || !storedPhone) {
                // Thông tin từ hình ảnh profile bạn gửi
                const profileEmail = 'phuc123@gmail.com';
                const profilePhone = '0971948009';

                if (!storedEmail) {
                    localStorage.setItem('email', profileEmail);
                    storedEmail = profileEmail;
                }
                if (!storedPhone) {
                    localStorage.setItem('phone', profilePhone);
                    storedPhone = profilePhone;
                }

                console.log('📝 Set missing user info from profile:', {
                    email: profileEmail,
                    phone: profilePhone
                });
            }

            // Nếu có trong localStorage nhưng chưa có trong user object
            if ((storedEmail && !user.email) || (storedPhone && !user.phone)) {
                console.log('🔄 Updating user info from localStorage...', {
                    storedEmail,
                    storedPhone,
                    currentUser: user
                });

                updateUserInfo({
                    email: storedEmail || user.email,
                    phone: storedPhone || user.phone
                });
            }
        }
    }, [user, updateUserInfo]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const getBedType = (type) => {
        // Fix cứng theo yêu cầu: type single = "1 giường đôi"
        if (type === 'single') return '1 giường đôi';
        if (type === 'double') return '2 giường đôi';
        if (type === 'suite') return '1 giường King + Sofa';
        return '1 giường đôi';
    };

    const getRoomTypeName = (type) => {
        if (type === 'single') return 'Phòng Đơn';
        if (type === 'double') return 'Phòng Đôi';
        if (type === 'suite') return 'Phòng Suite';
        return 'Phòng Tiêu Chuẩn';
    };

    const translateAmenity = (amenity) => {
        const translations = {
            'Wi-Fi': 'Wifi miễn phí',
            'TV': 'TV',
            'Air Conditioning': 'Điều hòa',
            'Mini Bar': 'Minibar',
            'Balcony': 'Ban công',
            'Safe Box': 'Safe Box',
            'Pool': 'Hồ bơi',
            'Spa': 'Spa',
            'Gym': 'Phòng tập gym',
            'Restaurant': 'Nhà hàng',
            'Room Service': 'Dịch vụ phòng',
            'Business Center': 'Trung tâm thương mại'
        };
        return translations[amenity] || amenity;
    };

    // Helper function để format địa chỉ
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

    // Function để gọi preview API (mô phỏng tạm thời)
    const fetchBookingPreview = async (roomType, hotelId) => {
        setPreviewLoading(true);
        setPreviewError(null);

        try {
            // Tạm thời mô phỏng response từ API preview
            // Trong thực tế sẽ gọi: GET /api/traveler/bookings/preview?roomType=...&hotelId=...
            console.log('Fetching preview for room:', roomType, 'hotel:', hotelId);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

            const mockPreviewData = {
                hotel: {
                    name: hotelData?.name || "Grand Hotel Saigon",
                    address: formatAddress(hotelData?.address) || "123 Đường Nguyễn Huệ, Quận 1, TP.HCM, Vietnam"
                },
                room: {
                    type: roomType,
                    roomNumber: "101", // Sẽ được backend assign
                    floor: 1,
                    area: 25,
                    capacity: 2,
                    pricePerNight: 300000
                },
                guest: {
                    name: user?.fullName || user?.name || "Hoàng", // Fallback từ profile
                    email: user?.email || "phuc123@gmail.com", // Fallback từ profile  
                    phone: user?.phone || user?.phoneNumber || "0971948009" // Fallback từ profile
                },
                booking: {
                    bookingId: null, // Chưa có vì chưa tạo
                    checkInDate: "",
                    checkOutDate: "",
                    nights: 0,
                    bookingDate: new Date().toISOString(),
                    bookingStatus: "preview",
                    paymentStatus: "pending"
                },
                pricing: {
                    pricePerNight: 300000,
                    nights: 0,
                    totalAmount: 0,
                    calculation: "Chưa chọn ngày lưu trú"
                }
            };

            setPreviewData(mockPreviewData);

            // Prefill form with preview data
            setBookingForm(prev => ({
                ...prev,
                customerName: mockPreviewData.guest.name,
                customerEmail: mockPreviewData.guest.email,
                customerPhone: mockPreviewData.guest.phone
            }));

        } catch (error) {
            console.error('Error fetching preview:', error);
            setPreviewError('Không thể tải thông tin đặt phòng. Vui lòng thử lại.');
        } finally {
            setPreviewLoading(false);
        }
    };

    // Function để mở modal booking
    const handleBookRoom = async (room) => {
        setSelectedRoom(room);
        // Tìm phòng available đầu tiên và gán số phòng
        const availableRoomFromType = roomsData?.roomsByType?.[room.id]?.rooms?.find(r => r.status === 'available');
        setSelectedRoomNumber(availableRoomFromType);

        // Gọi preview API để lấy thông tin đầy đủ
        await fetchBookingPreview(room.id, hotelData?.id);

        setIsModalOpen(true);
    };

    // Function để đóng modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRoom(null);
        setPreviewData(null);
        setPreviewError(null);
        setPaymentError(null);
        setBookingForm({
            customerName: '', // Sẽ được auto-fill từ user data
            customerPhone: '', // Sẽ được auto-fill từ user data
            customerEmail: '', // Sẽ được auto-fill từ user data
            checkInDate: '',
            checkOutDate: '',
            specialRequests: ''
        });
    };

    // Function để xử lý thay đổi form
    const handleFormChange = (field, value) => {
        setBookingForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Function tính số đêm
    const calculateNights = () => {
        if (!bookingForm.checkInDate || !bookingForm.checkOutDate) return 0;
        const checkIn = new Date(bookingForm.checkInDate);
        const checkOut = new Date(bookingForm.checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return nights > 0 ? nights : 0;
    };

    // Function tính tổng giá với giảm giá
    const calculateSubtotal = () => {
        const nights = calculateNights();
        if (nights <= 0) return 0;

        // Ưu tiên sử dụng giá từ preview data, sau đó từ selected room
        const roomPrice = previewData?.room?.pricePerNight || selectedRoom?.rawPrice || 300000;
        return nights * roomPrice;
    };

    const calculateDiscount = () => {
        return Math.round((calculateSubtotal() * discountPercent) / 100);
    };

    const calculateTotalPrice = () => {
        return calculateSubtotal() - calculateDiscount();
    };

    // Function xử lý thanh toán và tạo booking
    const handlePaymentAndBooking = async () => {
        if (!previewData || calculateNights() <= 0) {
            alert('Vui lòng chọn ngày nhận và trả phòng hợp lệ');
            return;
        }

        setIsProcessingPayment(true);
        setPaymentError(null);

        try {
            // Bước 1: Mô phỏng thanh toán
            console.log('Processing payment...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate payment processing

            // Mô phỏng thành công/thất bại thanh toán (90% thành công)
            const paymentSuccess = Math.random() > 0.1;

            if (!paymentSuccess) {
                throw new Error('Thanh toán thất bại. Vui lòng thử lại.');
            }

            // Bước 2: Tạo booking sau khi thanh toán thành công
            const bookingPayload = {
                hotelId: hotelData?.id,
                hotelName: previewData.hotel.name,
                hotelAddress: previewData.hotel.address,
                room: {
                    type: previewData.room.type,
                    roomNumber: previewData.room.roomNumber,
                    floor: previewData.room.floor,
                    area: previewData.room.area,
                    capacity: previewData.room.capacity,
                    pricePerNight: previewData.room.pricePerNight
                },
                guest: {
                    name: previewData?.guest?.name || user?.fullName || user?.name,
                    email: previewData?.guest?.email || user?.email,
                    phone: previewData?.guest?.phone || user?.phone || user?.phoneNumber
                },
                checkInDate: bookingForm.checkInDate,
                checkOutDate: bookingForm.checkOutDate,
                nights: calculateNights(),
                totalAmount: calculateTotalPrice(),
                specialRequests: bookingForm.specialRequests,
                payment: {
                    method: "mock_payment",
                    providerRef: `txn_${Date.now()}`,
                    amount: calculateTotalPrice(),
                    currency: "VND",
                    status: "completed"
                }
            };

            console.log('Creating booking with payload:', bookingPayload);

            // Mô phỏng gọi API tạo booking
            // Trong thực tế: POST /api/traveler/bookings
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockBookingResponse = {
                success: true,
                data: {
                    bookingId: `booking_${Date.now()}`,
                    status: "confirmed",
                    paymentStatus: "completed"
                }
            };

            // Thành công
            alert(`Đặt phòng thành công! Mã đặt phòng: ${mockBookingResponse.data.bookingId}`);
            handleCloseModal();

        } catch (error) {
            console.error('Payment/Booking error:', error);
            setPaymentError(error.message || 'Có lỗi xảy ra trong quá trình đặt phòng');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    // Function xử lý submit form (validation)
    const handleSubmitBooking = (e) => {
        e.preventDefault();

        // Validation - Chỉ check thông tin user có đầy đủ không (từ database hoặc fallback)
        const guestName = previewData?.guest?.name || user?.fullName || user?.name || "Hoàng";
        const guestEmail = previewData?.guest?.email || user?.email || "phuc123@gmail.com";
        const guestPhone = previewData?.guest?.phone || user?.phone || user?.phoneNumber || "0971948009";

        if (!guestName || !guestEmail || !guestPhone) {
            alert('Thông tin tài khoản chưa đầy đủ. Vui lòng cập nhật thông tin cá nhân trong tài khoản trước khi đặt phòng.');
            return;
        }

        if (!bookingForm.checkInDate || !bookingForm.checkOutDate) {
            alert('Vui lòng chọn ngày nhận và trả phòng');
            return;
        }

        if (calculateNights() <= 0) {
            alert('Ngày trả phòng phải sau ngày nhận phòng');
            return;
        }

        // Proceed to payment
        handlePaymentAndBooking();
    };

    if (loading) {
        return (
            <section id="rooms" className="hotel-detail-content-section rooms-section">
                <div className="hotel-detail-section-header">
                    <h2 className="hotel-detail-section-title">Các Loại Phòng</h2>
                    <p className="hotel-detail-section-description">Đang tải dữ liệu phòng...</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Loading: {loading ? 'true' : 'false'}</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="rooms" className="hotel-detail-content-section rooms-section">
                <div className="hotel-detail-section-header">
                    <h2 className="hotel-detail-section-title">Các Loại Phòng</h2>
                    <p className="hotel-detail-section-description" style={{ color: 'red' }}>{error}</p>
                </div>
            </section>
        );
    }

    if (!roomsData || !roomsData.roomsByType) {
        return (
            <section id="rooms" className="hotel-detail-content-section rooms-section">
                <div className="hotel-detail-section-header">
                    <h2 className="hotel-detail-section-title">Các Loại Phòng</h2>
                    <p className="hotel-detail-section-description">Không có dữ liệu phòng</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                        Debug - roomsData: {roomsData ? 'có dữ liệu' : 'null'},
                        roomsByType: {roomsData?.roomsByType ? 'có' : 'không có'}
                    </p>
                    <pre style={{ fontSize: '10px', background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                        {JSON.stringify(roomsData, null, 2)}
                    </pre>
                </div>
            </section>
        );
    }

    // Chuyển đổi dữ liệu từ backend thành format hiển thị
    const rooms = Object.values(roomsData.roomsByType).map((roomType) => {
        // Lấy phòng đầu tiên trong list phòng làm mẫu để hiển thị thông tin loại phòng
        const sampleRoom = roomType.rooms && roomType.rooms.length > 0 ? roomType.rooms[0] : null;

        // Lấy ảnh đầu tiên của phòng đầu tiên trong list phòng để hiển thị cho loại phòng này
        const roomImage = sampleRoom?.images && sampleRoom.images.length > 0
            ? getProxiedGoogleDriveUrl(sampleRoom.images[0])
            : "/placeholder.svg";

        return {
            id: roomType.type,
            name: getRoomTypeName(roomType.type),
            price: formatPrice(roomType.avgPrice),
            rawPrice: roomType.avgPrice, // Giá gốc để tính toán
            image: roomImage,
            size: `${sampleRoom?.area || 25}m²`,
            bed: getBedType(roomType.type),
            guests: `${roomType.avgCapacity} người`,
            amenities: sampleRoom?.amenities?.map(translateAmenity) || [],
            availableCount: roomType.availableCount, // Số lượng phòng trống
            totalCount: roomType.count // Tổng số phòng
        };
    });

    return (
        <section id="rooms" className="hotel-detail-content-section rooms-section">
            <div className="hotel-detail-section-header">
                <h2 className="hotel-detail-section-title">Các Loại Phòng</h2>
                <p className="hotel-detail-section-description">Lựa chọn phòng phù hợp với nhu cầu của bạn</p>
            </div>

            <div className="hotel-detail-rooms-grid">
                {rooms.map((room) => (
                    <div key={room.id} className="room-card">
                        <div className="room-image">
                            <SmartImage src={room.image || "/placeholder.svg"} alt={room.name} />
                            <div className="room-badge">
                                {room.availableCount > 0
                                    ? `${room.availableCount} phòng trống`
                                    : 'Hết phòng'
                                }
                            </div>
                        </div>
                        <div className="room-content">
                            <h3 className="room-name">
                                {room.name}
                                <span className="room-availability">
                                    ({room.availableCount}/{room.totalCount} phòng)
                                </span>
                            </h3>
                            <div className="room-details">
                                <div className="room-detail-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="3" y1="9" x2="21" y2="9"></line>
                                    </svg>
                                    <span>{room.size}</span>
                                </div>
                                <div className="room-detail-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M2 4v16"></path>
                                        <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                                        <path d="M2 17h20"></path>
                                        <path d="M6 8v9"></path>
                                    </svg>
                                    <span>{room.bed}</span>
                                </div>
                                <div className="room-detail-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    <span>{room.guests}</span>
                                </div>
                            </div>
                            <div className="room-amenities">
                                {room.amenities.map((amenity, index) => (
                                    <span key={index} className="amenity-tag">
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                            <div className="room-footer">
                                <div className="room-price">
                                    <span className="price-amount">{room.price}</span>
                                    <span className="price-unit">VNĐ/đêm</span>
                                </div>
                                <button
                                    className="room-book-btn"
                                    disabled={room.availableCount === 0}
                                    onClick={() => handleBookRoom(room)}
                                    style={{
                                        opacity: room.availableCount === 0 ? 0.5 : 1,
                                        cursor: room.availableCount === 0 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {room.availableCount > 0 ? 'Đặt ngay' : 'Hết phòng'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Booking */}
            {isModalOpen && (
                <div className="booking-modal-overlay" onClick={handleCloseModal}>
                    <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="booking-modal-header">
                            <h3>Thông tin đặt phòng</h3>
                            <button className="modal-close-btn" onClick={handleCloseModal}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="booking-modal-content">
                            {previewLoading ? (
                                <div className="booking-loading">
                                    <div className="loading-spinner"></div>
                                    <p>Đang tải thông tin đặt phòng...</p>
                                </div>
                            ) : previewError ? (
                                <div className="booking-error">
                                    <p style={{ color: 'red' }}>{previewError}</p>
                                    <button
                                        onClick={() => fetchBookingPreview(selectedRoom?.id, hotelData?.id)}
                                        className="btn-retry"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitBooking}>
                                    {/* Thông tin đặt phòng - Header */}
                                    <div className="booking-header-card">
                                        <div className="booking-hotel-info">
                                            <div className="hotel-logo">
                                                <FaHotel size={32} />
                                            </div>
                                            <div className="hotel-details">
                                                <h3>{previewData?.hotel?.name || hotelData?.name || 'Tên khách sạn'}</h3>
                                                <div className="hotel-address">
                                                    <FaMapMarkerAlt size={14} />
                                                    <span>
                                                        {previewData?.hotel?.address || formatAddress(hotelData?.address)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="booking-room-summary">
                                            <div className="room-summary-card">
                                                <h4>{selectedRoom?.name}</h4>
                                                <div className="room-details-grid">
                                                    <div className="detail-item">
                                                        <span className="detail-label">Phòng số</span>
                                                        <span className="detail-value">#{selectedRoomNumber?.roomNumber || 'TBA'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Tầng</span>
                                                        <span className="detail-value">{selectedRoomNumber?.floor || 1}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Diện tích</span>
                                                        <span className="detail-value">{selectedRoomNumber?.area || 25}m²</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Sức chứa</span>
                                                        <span className="detail-value">{selectedRoomNumber?.capacity || 2} người</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thông tin người đặt */}
                                    <div className="booking-section">
                                        <h4>
                                            <FaUser size={20} />
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
                                                    <FaUser size={16} />
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
                                                    <FaPhone size={16} />
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
                                                <FaEnvelope size={16} />
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

                                    {/* Thông tin đặt phòng */}
                                    <div className="booking-section">
                                        <h4>
                                            <FaBed size={20} />
                                            Thông tin lưu trú
                                        </h4>

                                        <div className="date-selection-card">
                                            <div className="date-inputs">
                                                <div className="date-input-group">
                                                    <label>
                                                        <FaCalendarAlt size={16} />
                                                        Nhận phòng
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={bookingForm.checkInDate}
                                                        onChange={(e) => handleFormChange('checkInDate', e.target.value)}
                                                        required
                                                        min={new Date().toISOString().split('T')[0]}
                                                    />
                                                    <span className="time-hint">Từ 14:00</span>
                                                </div>

                                                <div className="date-separator">
                                                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                                        <path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z" />
                                                    </svg>
                                                </div>

                                                <div className="date-input-group">
                                                    <label>
                                                        <FaCalendarAlt size={16} />
                                                        Trả phòng
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={bookingForm.checkOutDate}
                                                        onChange={(e) => handleFormChange('checkOutDate', e.target.value)}
                                                        required
                                                        min={bookingForm.checkInDate || new Date().toISOString().split('T')[0]}
                                                    />
                                                    <span className="time-hint">Trước 12:00</span>
                                                </div>
                                            </div>

                                            {calculateNights() > 0 && (
                                                <div className="stay-duration">
                                                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                    </svg>
                                                    <span>{calculateNights()} đêm lưu trú</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                                    <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 16H5V8h14v10zm-7-9h5v5h-5z" />
                                                </svg>
                                                Yêu cầu đặc biệt
                                            </label>
                                            <textarea
                                                value={bookingForm.specialRequests}
                                                onChange={(e) => handleFormChange('specialRequests', e.target.value)}
                                                placeholder="VD: Phòng tầng cao, gần thang máy, giường bổ sung..."
                                                rows="3"
                                            />
                                        </div>
                                    </div>

                                    {/* Thông tin thanh toán */}
                                    <div className="booking-section">
                                        <h4>
                                            <FaCreditCard size={20} />
                                            Chi tiết thanh toán
                                        </h4>
                                        <div className="payment-breakdown">
                                            <div className="payment-item">
                                                <span>
                                                    <FaBed size={16} />
                                                    {selectedRoom?.price} VNĐ × {calculateNights()} đêm
                                                </span>
                                                <span>{formatPrice(calculateSubtotal())} VNĐ</span>
                                            </div>

                                            {discountPercent > 0 && (
                                                <>
                                                    <div className="payment-item discount">
                                                        <span>
                                                            <FaQrcode size={16} />
                                                            Giảm giá ({discountPercent}%)
                                                        </span>
                                                        <span className="discount-amount">-{formatPrice(calculateDiscount())} VNĐ</span>
                                                    </div>

                                                    <div className="payment-divider"></div>
                                                </>
                                            )}

                                            <div className="payment-item total">
                                                <span>Tổng thanh toán</span>
                                                <span>{formatPrice(calculateTotalPrice())} VNĐ</span>
                                            </div>

                                            {discountPercent > 0 && (
                                                <div className="savings-badge">
                                                    <FaQrcode size={16} />
                                                    Bạn tiết kiệm được {formatPrice(calculateDiscount())} VNĐ!
                                                </div>
                                            )}
                                        </div>

                                        {/* QR Code cố định tạm thời */}
                                        <div className="qr-code-section">
                                            <h5>
                                                <FaQrcode size={18} />
                                                Quét mã QR để thanh toán
                                            </h5>
                                            <div className="qr-code-placeholder">
                                                <div style={{
                                                    width: '200px',
                                                    height: '200px',
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
                                                    <svg width="80" height="80" viewBox="0 0 100 100" fill="#ccc">
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
                                                        QR Code Demo
                                                    </div>
                                                </div>
                                                <p>Mã QR thanh toán</p>
                                                <p style={{ fontSize: '12px', color: '#666' }}>
                                                    Quét mã để chuyển khoản {formatPrice(calculateTotalPrice())} VNĐ
                                                </p>
                                                <div style={{
                                                    marginTop: '12px',
                                                    padding: '8px 12px',
                                                    backgroundColor: '#e0f2fe',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    color: '#0277bd'
                                                }}>
                                                    Ngân hàng: Vietcombank<br />
                                                    STK: 1234567890<br />
                                                    Chủ TK: Hotel Booking System
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Error */}
                                    {paymentError && (
                                        <div className="payment-error" style={{
                                            color: 'red',
                                            backgroundColor: '#fee',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            marginTop: '16px'
                                        }}>
                                            {paymentError}
                                        </div>
                                    )}

                                    {/* Buttons */}
                                    <div className="booking-modal-footer">
                                        <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-confirm"
                                            disabled={isProcessingPayment}
                                            style={{
                                                opacity: isProcessingPayment ? 0.7 : 1,
                                                cursor: isProcessingPayment ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {isProcessingPayment ? 'Đang xử lý...' : 'Xác nhận đặt phòng'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
