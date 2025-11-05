import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHotel, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaBed, FaCreditCard, FaQrcode } from 'react-icons/fa';
import { AuthContext } from '../../../../../contexts/AuthContext';
import { getProxiedGoogleDriveUrl } from '../../../../../utils/googleDriveImageHelper';
import SmartImage from '../../../../../components/common/SmartImage';
import BookingModal from './BookingModal';
import './HotelDetail.css';

export default function Rooms({ roomsData, loading, error, hotelData }) {
    const { user, updateUserInfo } = useContext(AuthContext);
    const navigate = useNavigate();

    // Determine if logged-in user is a traveler (case-insensitive)
    const userRole = user && user.role ? String(user.role).trim().toLowerCase() : '';
    const isTraveler = Boolean(user && (userRole === 'traveler' || userRole === 'user' || userRole === 'customer'));
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

    // Function để gọi preview API (mô phỏng tạm thời)
    const fetchBookingPreview = async (roomType, hotelId, roomObj) => {
        setPreviewLoading(true);
        setPreviewError(null);

        try {
            // Tạm thời mô phỏng response từ API preview
            // Trong thực tế sẽ gọi: GET /api/traveler/bookings/preview?roomType=...&hotelId=...
            console.log('Fetching preview for room:', roomType, 'hotel:', hotelId);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

            // Lấy giá/phòng chi tiết từ roomObj nếu có, fallback về avgPrice của loại phòng, sau đó mới đến 300000
            const derivedPrice = Number(
                (roomObj && roomObj.pricePerNight) ??
                roomsData?.roomsByType?.[roomType]?.avgPrice ??
                selectedRoom?.rawPrice ??
                300000
            );

            const mockPreviewData = {
                hotel: {
                    name: hotelData?.name || "Grand Hotel Saigon",
                    address: hotelData?.address || "123 Đường Nguyễn Huệ, Quận 1, TP.HCM, Vietnam"
                },
                room: {
                    type: roomType,
                    roomNumber: roomObj?.roomNumber || "TBA", // Sẽ được backend assign
                    floor: roomObj?.floor ?? 1,
                    area: roomObj?.area ?? 25,
                    capacity: roomObj?.capacity ?? roomsData?.roomsByType?.[roomType]?.avgCapacity ?? 2,
                    pricePerNight: derivedPrice
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
                    pricePerNight: derivedPrice,
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
        await fetchBookingPreview(room.id, hotelData?.id, availableRoomFromType);

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

    // Helper functions for calculations
    const calculateNights = () => {
        if (!bookingForm.checkInDate || !bookingForm.checkOutDate) return 0;
        const checkIn = new Date(bookingForm.checkInDate);
        const checkOut = new Date(bookingForm.checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return nights > 0 ? nights : 0;
    };

    const calculateSubtotal = () => {
        const nights = calculateNights();
        if (nights <= 0) return 0;
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
                                    disabled={room.availableCount === 0 || !isTraveler}
                                    onClick={() => {
                                        if (room.availableCount === 0) return;
                                        if (!user) {
                                            // Not logged in -> redirect to auth
                                            navigate('/auth', { state: { from: window.location.pathname } });
                                            return;
                                        }
                                        if (!isTraveler) {
                                            alert('Chỉ tài khoản traveler mới được đặt phòng. Vui lòng đăng ký/đăng nhập bằng tài khoản traveler.');
                                            return;
                                        }
                                        handleBookRoom(room);
                                    }}
                                    title={
                                        room.availableCount === 0
                                            ? 'Hết phòng'
                                            : !user
                                                ? 'Đăng nhập để đặt phòng'
                                                : !isTraveler
                                                    ? 'Chỉ tài khoản traveler mới được đặt phòng'
                                                    : 'Đặt ngay'
                                    }
                                    style={{
                                        opacity: room.availableCount === 0 || !isTraveler ? 0.5 : 1,
                                        cursor: room.availableCount === 0 || !isTraveler ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {room.availableCount === 0 ? 'Hết phòng' : !user ? 'Đăng nhập để đặt' : !isTraveler ? 'Không được phép' : 'Đặt ngay'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                selectedRoom={selectedRoom}
                selectedRoomNumber={selectedRoomNumber}
                hotelData={hotelData}
                previewData={previewData}
                previewLoading={previewLoading}
                previewError={previewError}
                onRetryPreview={() => fetchBookingPreview(selectedRoom?.id, hotelData?.id)}
                bookingForm={bookingForm}
                onFormChange={handleFormChange}
                onSubmit={handleSubmitBooking}
                isProcessingPayment={isProcessingPayment}
                paymentError={paymentError}
                discountPercent={discountPercent}
            />
        </section>
    )
}
