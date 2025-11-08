import {
    Waves as PoolIcon,
    Sparkles as SpaIcon,
    Dumbbell as GymIcon,
    Wifi as WifiIcon,
    Car as ParkingIcon,
    Wine as BarIcon,
    UtensilsCrossed as RestaurantIcon,
    Building2 as BusinessCenterIcon,
    Plane as AirportShuttleIcon,
    Snowflake as AirConditioningIcon,
    Users as ConferenceRoomIcon,
    Shirt as LaundryServiceIcon,
    Star as DefaultIcon,
    Tag as LocalOfferIcon,
    Building as ElevatorIcon,
    Bell as RoomServiceIcon,
    MapPin as LocationIcon,
    Layers as ServicesIcon,
    UserCheck as UsersIcon,
    Smile as SmileIcon,
    MessageCircle as MessageIcon
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SmartImage from '../../../../../components/common/SmartImage';
import { calculateDiscountedPrice, formatPromotionDiscount } from '../../../../../utils/promotionHelpers';

export default function Overview({ hotelData }) {
    // State for image carousel
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // smooth scroll handler must be defined at top-level (hooks rule)
    const navigate = useNavigate();
    const handleSelectRooms = (e) => {
        e?.preventDefault?.();
        const el = document.getElementById('rooms');
        if (el) {
            const headerOffset = 80; // adjust if your header has different height
            const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        } else {
            navigate(window.location.pathname + '#rooms');
        }
    };
    // Helper function to get star display based on category
    const getStarDisplay = (category) => {
        const starMap = {
            '1_star': '★ ☆ ☆ ☆ ☆',
            '2_star': '★ ★ ☆ ☆ ☆',
            '3_star': '★ ★ ★ ☆ ☆',
            '4_star': '★ ★ ★ ★ ☆',
            '5_star': '★ ★ ★ ★ ★'
        };
        return starMap[category] || '☆ ☆ ☆ ☆ ☆';
    };

    // Helper function to format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    // Get active promotion (first one from backend - already filtered for active promotions)
    const getActivePromotion = () => {
        if (!hotelData.promotions || hotelData.promotions.length === 0) return null;
        return hotelData.promotions[0]; // Backend đã filter active promotions
    };

    // Helper function to get amenity name in Vietnamese (matching HotelResult)
    const getAmenityName = (amenity) => {
        const amenityMap = {
            // 12 amenities chuẩn từ Backend API (matching HotelResult)
            'Wifi': 'Wifi',
            'Bãi đậu xe': 'Bãi đậu xe',
            'Hồ bơi': 'Hồ bơi',
            'Phòng gym': 'Phòng gym',
            'Nhà hàng': 'Nhà hàng',
            'Spa': 'Spa',
            'Quầy bar': 'Quầy bar',
            'Trung tâm thương mại': 'Trung tâm thương mại',
            'Thang máy': 'Thang máy',
            'Đưa đón sân bay': 'Đưa đón sân bay',
            'Điều hòa': 'Điều hòa',
            'Dịch vụ giặt là': 'Dịch vụ giặt là',

            // Legacy support for old data format
            'pool': 'Hồ bơi',
            'gym': 'Phòng tập',
            'spa': 'Spa',
            'wifi': 'WiFi miễn phí',
            'parking': 'Đỗ xe miễn phí',
            'bar': 'Quầy bar',
            'restaurant': 'Nhà hàng',
            'ac': 'Máy lạnh',
            'reception_24h': 'Lễ tân 24/7',
            'room_service': 'Dịch vụ phòng',
            'business_center': 'Trung tâm thương mại',
            'airport_shuttle': 'Đưa đón sân bay',
            'air_conditioning': 'Máy lạnh',
            'conference_room': 'Phòng hội nghị',
            'laundry_service': 'Dịch vụ giặt ủi',

            // Backend format (Title Case with spaces)
            'Pool': 'Hồ bơi',
            'Gym': 'Phòng tập',
            'Wi-Fi': 'Wi-Fi',
            'Bar': 'Quầy bar',
            'Parking': 'Đỗ xe miễn phí',
            'Restaurant': 'Nhà hàng',
            'Room Service': 'Dịch vụ phòng',
            'Business Center': 'Trung tâm thương mại',
            'Airport Shuttle': 'Đưa đón sân bay',
            'Air Conditioning': 'Máy lạnh',
            'Conference Room': 'Phòng hội nghị',
            'Laundry Service': 'Dịch vụ giặt ủi',
        };
        return amenityMap[amenity] || amenity;
    };

    // Helper function to get amenity icon component (using lucide-react icons)
    const getAmenityIconComponent = (amenity) => {
        const iconMap = {
            // 12 amenities chuẩn từ Backend API (matching HotelResult)
            'Wifi': WifiIcon,
            'Bãi đậu xe': ParkingIcon,
            'Hồ bơi': PoolIcon,
            'Phòng gym': GymIcon,
            'Nhà hàng': RestaurantIcon,
            'Spa': SpaIcon,
            'Quầy bar': BarIcon,
            'Trung tâm thương mại': BusinessCenterIcon,
            'Thang máy': ElevatorIcon,
            'Đưa đón sân bay': AirportShuttleIcon,
            'Điều hòa': AirConditioningIcon,
            'Dịch vụ giặt là': LaundryServiceIcon,

            // Legacy support for old data format
            'pool': PoolIcon,
            'gym': GymIcon,
            'spa': SpaIcon,
            'wifi': WifiIcon,
            'parking': ParkingIcon,
            'bar': BarIcon,
            'restaurant': RestaurantIcon,
            'ac': AirConditioningIcon,
            'reception_24h': RoomServiceIcon,
            'room_service': RoomServiceIcon,
            'business_center': BusinessCenterIcon,
            'airport_shuttle': AirportShuttleIcon,
            'air_conditioning': AirConditioningIcon,
            'conference_room': ConferenceRoomIcon,
            'laundry_service': LaundryServiceIcon,

            // Backend format (Title Case with spaces)
            'Pool': PoolIcon,
            'Gym': GymIcon,
            'Wi-Fi': WifiIcon,
            'Bar': BarIcon,
            'Parking': ParkingIcon,
            'Restaurant': RestaurantIcon,
            'Room Service': RoomServiceIcon,
            'Business Center': BusinessCenterIcon,
            'Airport Shuttle': AirportShuttleIcon,
            'Air Conditioning': AirConditioningIcon,
            'Conference Room': ConferenceRoomIcon,
            'Laundry Service': LaundryServiceIcon,
        };
        return iconMap[amenity] || DefaultIcon;
    };

    if (!hotelData) {
        return <div>Đang tải thông tin khách sạn...</div>;
    }

    // Chỉ lấy ảnh có sẵn từ backend (SmartImage sẽ tự xử lý Google Drive/CORS)
    const hotelImages = Array.isArray(hotelData.images) ? hotelData.images : [];

    const hasMultipleImages = hotelImages.length > 1;

    // Handlers for carousel navigation
    const handlePrevImage = () => {
        setCurrentImageIndex(prev =>
            prev === 0 ? hotelImages.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex(prev =>
            prev === hotelImages.length - 1 ? 0 : prev + 1
        );
    };

    return (
        <section id="overview">
            {/* Gallery Section with Carousel */}
            {hotelImages.length > 0 && (
                <div className="hotel-detail-gallery-section">
                    <div
                        className="hotel-detail-gallery-container"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr',
                            gap: '16px',
                            alignItems: 'stretch'
                        }}
                    >
                        {/* Left: Main Image */}
                        <div
                            className="hotel-detail-main-image"
                            style={{
                                position: 'relative',
                                height: '380px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '1px solid #e5e7eb',
                                backgroundColor: '#f8fafc'
                            }}
                        >
                            <SmartImage
                                src={hotelImages[currentImageIndex]}
                                alt={`${hotelData.name} - Hình ${currentImageIndex + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />

                            {/* Carousel Controls */}
                            {hasMultipleImages && (
                                <>
                                    {/* Previous Button */}
                                    <button
                                        onClick={handlePrevImage}
                                        style={{
                                            position: 'absolute',
                                            left: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(0, 0, 0, 0.6)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '20px',
                                            transition: 'all 0.2s ease',
                                            zIndex: 10
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                                            e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                        }}
                                        aria-label="Ảnh trước"
                                    >
                                        ◀
                                    </button>

                                    {/* Next Button */}
                                    <button
                                        onClick={handleNextImage}
                                        style={{
                                            position: 'absolute',
                                            right: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(0, 0, 0, 0.6)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '20px',
                                            transition: 'all 0.2s ease',
                                            zIndex: 10
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                                            e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                        }}
                                        aria-label="Ảnh tiếp theo"
                                    >
                                        ▶
                                    </button>

                                    {/* Image Counter Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '16px',
                                        right: '16px',
                                        background: 'rgba(0, 0, 0, 0.7)',
                                        color: 'white',
                                        padding: '6px 12px',
                                        borderRadius: '16px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        zIndex: 10
                                    }}>
                                        {currentImageIndex + 1} / {hotelImages.length}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Right: 2x3 Thumbnail Grid */}
                        {hasMultipleImages && (
                            <div
                                className="hotel-detail-thumbnail-grid side"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gridTemplateRows: 'repeat(3, 1fr)',
                                    gap: '12px',
                                    height: '380px'
                                }}
                            >
                                {hotelImages.slice(0, 6).map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        style={{
                                            padding: 0,
                                            border: currentImageIndex === index ? '3px solid #0a5757' : '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            background: 'transparent'
                                        }}
                                        aria-label={`Chọn ảnh ${index + 1}`}
                                    >
                                        <SmartImage
                                            src={image}
                                            alt={`${hotelData.name} - Thumbnail ${index + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Hotel Info Section */}
            <div className="hotel-detail-info-wrapper">
                <div className="hotel-detail-info">
                    <div className="hotel-detail-header">
                        <div className="hotel-detail-title-section">
                            <h1 className="hotel-detail-name">{hotelData.name}</h1>

                            {/* Destination Badge */}
                            {/* {destination && (
                                <div className="destination-badge">
                                    📍 {destination.name}, {destination.country}
                                </div>
                            )} */}

                            <div className="hotel-detail-rating">
                                <span className="hotel-detail-stars">{getStarDisplay(hotelData.category)}</span>
                            </div>
                            <div className="hotel-detail-location">
                                <LocationIcon className="hotel-detail-location-icon" size={16} />
                                <span>
                                    {hotelData.address?.street && `${hotelData.address.street}, `}
                                    {hotelData.address?.city}, {hotelData.address?.country}
                                </span>
                            </div>
                        </div>

                        <div className="hotel-detail-booking-card">
                            <div className="hotel-detail-price-section">
                                <span className="hotel-detail-price-label">Giá phòng/ đêm từ</span>

                                {/* Show promotion info if available */}
                                {getActivePromotion() && (
                                    <div style={{
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        marginBottom: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <LocalOfferIcon size={14} />
                                        {getActivePromotion().name} - {getActivePromotion().code}
                                    </div>
                                )}

                                <div className="hotel-detail-price">
                                    {/* Show original price with strikethrough if there's a promotion */}
                                    {getActivePromotion() && (
                                        <div style={{
                                            fontSize: '0.9rem',
                                            textDecoration: 'line-through',
                                            color: '#64748b',
                                            marginBottom: '4px'
                                        }}>
                                            {formatPrice(hotelData.priceRange?.min || 0)} VNĐ
                                        </div>
                                    )}

                                    {/* Show discounted price or regular price */}
                                    {formatPrice(
                                        getActivePromotion()
                                            ? calculateDiscountedPrice(hotelData.priceRange?.min || 0, getActivePromotion())
                                            : (hotelData.priceRange?.min || 0)
                                    )} <span className="hotel-detail-currency">VNĐ</span>

                                    {/* Show discount badge */}
                                    {getActivePromotion() && (
                                        <div style={{
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            marginLeft: '8px',
                                            display: 'inline-block'
                                        }}>
                                            {formatPromotionDiscount(getActivePromotion())}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button className="hotel-detail-book-button" onClick={handleSelectRooms}>Chọn Phòng</button>
                        </div>
                    </div>

                    <p className="hotel-detail-description">
                        {hotelData.description}
                    </p>
                </div>
            </div>

            {/* Info Cards */}
            <div className="hotel-detail-info-cards">

                <div className="hotel-detail-info-card">
                    <h3 className="hotel-detail-card-title">
                        <ServicesIcon className="hotel-detail-card-icon" size={20} />
                        Tiện ích chính
                    </h3>
                    <div className="hotel-detail-amenity-list">
                        {hotelData.amenities && hotelData.amenities.length > 0 ? (
                            hotelData.amenities.map((amenity, index) => {
                                const IconComponent = getAmenityIconComponent(amenity);
                                return (
                                    <div key={index} className="hotel-detail-amenity-item">
                                        <IconComponent className="hotel-detail-amenity-icon" size={20} />
                                        <span>{getAmenityName(amenity)}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="hotel-detail-amenity-item">
                                <DefaultIcon className="hotel-detail-amenity-icon" size={20} />
                                <span>Không có thông tin tiện ích</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="hotel-detail-info-card">
                    <h3 className="hotel-detail-card-title">
                        <LocationIcon className="hotel-detail-card-icon" size={20} />
                        Trong khu vực
                    </h3>
                    <div className="hotel-detail-location-list">
                        <div className="hotel-detail-location-item">
                            <LocationIcon className="hotel-detail-location-marker" size={16} />
                            <span>Hồ Hoàn Kiếm</span>
                        </div>
                        <div className="hotel-detail-location-item">
                            <LocationIcon className="hotel-detail-location-marker" size={16} />
                            <span>Phố Ẩm Thực Tạ Hiện</span>
                        </div>
                        <div className="hotel-detail-location-item">
                            <LocationIcon className="hotel-detail-location-marker" size={16} />
                            <span>Nhà Hát Lớn</span>
                        </div>
                        <div className="hotel-detail-location-item">
                            <LocationIcon className="hotel-detail-location-marker" size={16} />
                            <span>Cổng Viên Thống Nhất</span>
                        </div>
                    </div>
                </div>

                <div className="hotel-detail-info-card">
                    <h3 className="hotel-detail-card-title">
                        <DefaultIcon className="hotel-detail-card-icon" size={20} />
                        Đánh giá
                    </h3>
                    <div className="hotel-detail-review-stats">
                        <div className="hotel-detail-review-item">
                            <UsersIcon className="hotel-detail-review-icon" size={20} />
                            <span>{hotelData.bookingsCount || 0} lượt book</span>
                        </div>
                        <div className="hotel-detail-review-item">
                            <SmileIcon className="hotel-detail-review-icon" size={20} />
                            <span>{hotelData.rating || 0} / 10 điểm đánh giá</span>
                        </div>
                        <div className="hotel-detail-review-item">
                            <MessageIcon className="hotel-detail-review-icon" size={20} />
                            <span>{hotelData.reviews ? hotelData.reviews.length : 0} Reviews</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
