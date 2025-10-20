export default function Overview() {
    return (
        <section id="overview">
            {/* Gallery Section */}
            <div className="hotel-detail-gallery-section">
                <div className="hotel-detail-gallery-container">
                    <div className="hotel-detail-main-image">
                        <img src="/luxury-hotel-room.png" alt="Phòng khách sạn chính" />
                    </div>
                    <div className="hotel-detail-thumbnail-grid">
                        <img src="/hotel-bedroom.png" alt="Phòng ngủ" />
                        <img src="/modern-hotel-bathroom.png" alt="Phòng tắm" />
                        <img src="/hotel-balcony-ocean-view.png" alt="Tầm nhìn" />
                        <img src="/elegant-hotel-lobby.png" alt="Sảnh khách sạn" />
                        <img src="/hotel-restaurant.png" alt="Nhà hàng" />
                        <img src="/hotel-pool.png" alt="Hồ bơi" />
                    </div>
                </div>
            </div>

            {/* Hotel Info Section */}
            <div className="hotel-detail-info-wrapper">
                <div className="hotel-detail-info">
                    <div className="hotel-detail-header">
                        <div className="hotel-detail-title-section">
                            <h1 className="hotel-detail-name">Tên Khách Sạn</h1>
                            <div className="hotel-detail-rating">
                                <span className="hotel-detail-stars">★ ★ ★ ★ ☆</span>
                            </div>
                            <div className="hotel-detail-location">
                                <svg className="hotel-detail-location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span>Địa chỉ khách sạn</span>
                            </div>
                        </div>

                        <div className="hotel-detail-booking-card">
                            <div className="hotel-detail-price-section">
                                <span className="hotel-detail-price-label">Giá phòng/ đêm</span>
                                <div className="hotel-detail-price">
                                    500.000 <span className="hotel-detail-currency">VNĐ</span>
                                </div>
                            </div>
                            <button className="hotel-detail-book-button">Chọn Phòng</button>
                        </div>
                    </div>

                    <p className="hotel-detail-description">
                        Mô tả khách sạn Mô tả khách sạn Mô tả khách sạn Mô tả khách sạn Mô tả khách sạn Mô tả khách sạn Mô tả khách
                        sạn Mô tả khách sạn Mô tả khách sạn Mô tả khách sạn Mô tả khách sạn Mô tả khách sạn Mô tả khách sạn Mô tả
                        khách sạn Mô tả khách sạn
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
                        <div className="hotel-detail-amenity-item">
                            <svg className="hotel-detail-amenity-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5z"></path>
                                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                            </svg>
                            <span>Máy Lạnh</span>
                        </div>
                        <div className="hotel-detail-amenity-item">
                            <svg className="hotel-detail-amenity-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                                <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                                <circle cx="12" cy="20" r="1"></circle>
                            </svg>
                            <span>Wifi</span>
                        </div>
                        <div className="hotel-detail-amenity-item">
                            <svg className="hotel-detail-amenity-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span>Lễ Tân 24/7</span>
                        </div>
                        <div className="hotel-detail-amenity-item">
                            <svg className="hotel-detail-amenity-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                            </svg>
                            <span>Đỗ xe miễn phí</span>
                        </div>
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
                            <span>120 lượt book</span>
                        </div>
                        <div className="hotel-detail-review-item">
                            <svg className="hotel-detail-review-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                                <line x1="15" y1="9" x2="15.01" y2="9"></line>
                            </svg>
                            <span>8.4 / 10 điểm đánh giá</span>
                        </div>
                        <div className="hotel-detail-review-item">
                            <svg className="hotel-detail-review-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span>4 Reviews</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
