import {
    Pool as PoolIcon,
    Spa as SpaIcon,
    FitnessCenter as GymIcon,
    Wifi as WifiIcon,
    DirectionsCar as ParkingIcon,
    Liquor as BarIcon,
    Restaurant as RestaurantIcon,
    RoomPreferences as RoomServiceIcon,
    Work as BusinessCenterIcon,
    FlightTakeoff as AirportShuttleIcon,
    AcUnit as AirConditioningIcon,
    MeetingRoom as ConferenceRoomIcon,
    LocalLaundryService as LaundryServiceIcon,
    Star as DefaultIcon
} from '@mui/icons-material';

export default function Overview({ hotelData }) {
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

    // Helper function to get amenity name in Vietnamese
    const getAmenityName = (amenity) => {
        const amenityMap = {
            // Lowercase versions (for consistency with old data)
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
            'Spa': 'Spa',
            'Gym': 'Phòng tập',
            'Wifi': 'WiFi miễn phí',
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

    // Helper function to get amenity icon component
    const getAmenityIconComponent = (amenity) => {
        const iconMap = {
            // Lowercase versions (for consistency with old data)
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
            'Spa': SpaIcon,
            'Gym': GymIcon,
            'Wifi': WifiIcon,
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

    const mainImage = hotelData.images && hotelData.images.length > 0 ? hotelData.images[0] : "/luxury-hotel-room.png";
    const thumbnailImages = hotelData.images && hotelData.images.length > 1 ? hotelData.images.slice(1) : [];

    return (
        <section id="overview">
            {/* Gallery Section */}
            <div className="hotel-detail-gallery-section">
                <div className="hotel-detail-gallery-container">
                    <div className="hotel-detail-main-image">
                        <img src={mainImage} alt={`${hotelData.name} - Phòng khách sạn chính`} />
                    </div>
                    <div className="hotel-detail-thumbnail-grid">
                        {thumbnailImages.map((image, index) => (
                            <img key={index} src={image} alt={`${hotelData.name} - Hình ${index + 2}`} />
                        ))}
                        {/* Fallback images if not enough images from API */}
                        {thumbnailImages.length < 6 && (
                            <>
                                <img src="/hotel-bedroom.png" alt="Phòng ngủ" />
                                <img src="/modern-hotel-bathroom.png" alt="Phòng tắm" />
                                <img src="/hotel-balcony-ocean-view.png" alt="Tầm nhìn" />
                                <img src="/elegant-hotel-lobby.png" alt="Sảnh khách sạn" />
                                <img src="/hotel-restaurant.png" alt="Nhà hàng" />
                                <img src="/hotel-pool.png" alt="Hồ bơi" />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Hotel Info Section */}
            <div className="hotel-detail-info-wrapper">
                <div className="hotel-detail-info">
                    <div className="hotel-detail-header">
                        <div className="hotel-detail-title-section">
                            <h1 className="hotel-detail-name">{hotelData.name}</h1>
                            <div className="hotel-detail-rating">
                                <span className="hotel-detail-stars">{getStarDisplay(hotelData.category)}</span>
                            </div>
                            <div className="hotel-detail-location">
                                <svg className="hotel-detail-location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span>
                                    {hotelData.address?.street && `${hotelData.address.street}, `}
                                    {hotelData.address?.city}, {hotelData.address?.country}
                                </span>
                            </div>
                        </div>

                        <div className="hotel-detail-booking-card">
                            <div className="hotel-detail-price-section">
                                <span className="hotel-detail-price-label">Giá phòng/ đêm từ</span>
                                <div className="hotel-detail-price">
                                    {formatPrice(hotelData.priceRange?.min || 0)} <span className="hotel-detail-currency">VNĐ</span>
                                </div>
                            </div>
                            <button className="hotel-detail-book-button">Chọn Phòng</button>
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
                        <svg className="hotel-detail-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5z"></path>
                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                        Tiện ích chính
                    </h3>
                    <div className="hotel-detail-amenity-list">
                        {hotelData.amenities && hotelData.amenities.length > 0 ? (
                            hotelData.amenities.map((amenity, index) => {
                                const IconComponent = getAmenityIconComponent(amenity);
                                return (
                                    <div key={index} className="hotel-detail-amenity-item">
                                        <IconComponent className="hotel-detail-amenity-icon" />
                                        <span>{getAmenityName(amenity)}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="hotel-detail-amenity-item">
                                <DefaultIcon className="hotel-detail-amenity-icon" />
                                <span>Không có thông tin tiện ích</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="hotel-detail-info-card">
                    <h3 className="hotel-detail-card-title">
                        <svg className="hotel-detail-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Trong khu vực
                    </h3>
                    <div className="hotel-detail-location-list">
                        <div className="hotel-detail-location-item">
                            <svg className="hotel-detail-location-marker" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            </svg>
                            <span>Hồ Hoàn Kiếm</span>
                        </div>
                        <div className="hotel-detail-location-item">
                            <svg className="hotel-detail-location-marker" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            </svg>
                            <span>Phố Ẩm Thực Tạ Hiện</span>
                        </div>
                        <div className="hotel-detail-location-item">
                            <svg className="hotel-detail-location-marker" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            </svg>
                            <span>Nhà Hát Lớn</span>
                        </div>
                        <div className="hotel-detail-location-item">
                            <svg className="hotel-detail-location-marker" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            </svg>
                            <span>Cổng Viên Thống Nhất</span>
                        </div>
                    </div>
                </div>

                <div className="hotel-detail-info-card">
                    <h3 className="hotel-detail-card-title">
                        <svg className="hotel-detail-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        Đánh giá
                    </h3>
                    <div className="hotel-detail-review-stats">
                        <div className="hotel-detail-review-item">
                            <svg className="hotel-detail-review-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>{hotelData.bookingsCount || 0} lượt book</span>
                        </div>
                        <div className="hotel-detail-review-item">
                            <svg className="hotel-detail-review-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                                <line x1="15" y1="9" x2="15.01" y2="9"></line>
                            </svg>
                            <span>{hotelData.rating || 0} / 10 điểm đánh giá</span>
                        </div>
                        <div className="hotel-detail-review-item">
                            <svg className="hotel-detail-review-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span>{hotelData.reviews ? hotelData.reviews.length : 0} Reviews</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
