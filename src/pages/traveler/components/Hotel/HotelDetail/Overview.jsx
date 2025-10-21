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
            'pool': 'Hồ bơi',
            'gym': 'Phòng tập',
            'spa': 'Spa',
            'wifi': 'WiFi miễn phí',
            'parking': 'Đỗ xe miễn phí',
            'bar': 'Quầy bar',
            'restaurant': 'Nhà hàng',
            'ac': 'Máy lạnh',
            'reception_24h': 'Lễ tân 24/7'
        };
        return amenityMap[amenity] || amenity;
    };

    // Helper function to get amenity icon
    const getAmenityIcon = (amenity) => {
        const iconMap = {
            'pool': (
                <path d="M2 12h20M2 12l4-4M2 12l4 4M22 12l-4-4M22 12l-4 4" />
            ),
            'gym': (
                <path d="M12 2L2 7l10 5 10-5z" />
            ),
            'spa': (
                <circle cx="12" cy="12" r="10" />
            ),
            'wifi': (
                <>
                    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <circle cx="12" cy="20" r="1" />
                </>
            ),
            'parking': (
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            ),
            'bar': (
                <path d="M5 12V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5M5 12l6 6 6-6" />
            )
        };
        return iconMap[amenity] || (
            <path d="M12 2L2 7l10 5 10-5z" />
        );
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
                            hotelData.amenities.map((amenity, index) => (
                                <div key={index} className="hotel-detail-amenity-item">
                                    <svg className="hotel-detail-amenity-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        {getAmenityIcon(amenity)}
                                    </svg>
                                    <span>{getAmenityName(amenity)}</span>
                                </div>
                            ))
                        ) : (
                            <div className="hotel-detail-amenity-item">
                                <svg className="hotel-detail-amenity-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5z"></path>
                                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                                </svg>
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
