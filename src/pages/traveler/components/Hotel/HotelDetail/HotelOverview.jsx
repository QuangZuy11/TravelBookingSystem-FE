import React, { useState } from 'react';
import {
    FaStar,
    FaMapMarkerAlt,
    FaWifi,
    FaSnowflake,
    FaUserTie,
    FaCar,
    FaSmile,
    FaComment,
} from 'react-icons/fa';
import '../HotelDetail/HotelOverview.css';

const HotelOverview = () => {
    const [selectedImage, setSelectedImage] = useState(0);

    // Gallery images (placeholder)
    const galleryImages = [
        { id: 1, src: 'https://via.placeholder.com/600x400?text=Hotel+Main' },
        { id: 2, src: 'https://via.placeholder.com/200x150?text=Room+1' },
        { id: 3, src: 'https://via.placeholder.com/200x150?text=Room+2' },
        { id: 4, src: 'https://via.placeholder.com/200x150?text=Room+3' },
        { id: 5, src: 'https://via.placeholder.com/200x150?text=Room+4' },
        { id: 6, src: 'https://via.placeholder.com/200x150?text=Room+5' },
    ];

    const amenities = [
        { icon: FaSnowflake, label: 'Máy Lạnh' },
        { icon: FaWifi, label: 'Wifi' },
        { icon: FaUserTie, label: 'Lễ Tân' },
        { icon: FaCar, label: 'Đỗ xe' },
    ];

    const locations = [
        'Hồ Hoàn Kiếm',
        'Phố Ẩm Thực Tạ Hiện',
        'Nhà Hát Lớn',
        'Công Viên Thống Nhất',
    ];

    const ratings = {
        stars: 4,
        score: 8.4,
        totalScore: 10,
        bookings: 120,
        reviews: 4,
    };

    const pricePerNight = '500.000';
    const currency = 'VNĐ';

    return (
        <div className="hotel-overview">
            {/* Main Gallery Section */}
            <div className="gallery-container">
                <div className="main-gallery">
                    <img
                        src={galleryImages[selectedImage].src}
                        alt="Hotel Main"
                        className="main-image"
                    />
                </div>

                <div className="thumbnail-gallery">
                    {galleryImages.slice(1).map((image, index) => (
                        <div
                            key={image.id}
                            className={`thumbnail ${selectedImage === index + 1 ? 'active' : ''}`}
                            onClick={() => setSelectedImage(index + 1)}
                        >
                            <img src={image.src} alt={`Hotel ${index + 2}`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Hotel Info & Price Section */}
            <div className="hotel-info-section">
                <div className="hotel-header">
                    <div className="hotel-title-area">
                        <h1 className="hotel-name">Tên Khách Sạn</h1>
                        <div className="rating-stars">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className={`star ${i < ratings.stars ? 'filled' : ''}`}
                                />
                            ))}
                        </div>
                        <div className="location-info">
                            <FaMapMarkerAlt className="location-icon" />
                            <span>Địa chỉ khách sạn</span>
                        </div>
                        <p className="hotel-description">
                            Mô tả khách sạn Mô tả khách sạn Mô tả khách sạn Mô tả khách sạn
                            Mô tả khách sạn Mô tả khách sạn Mô tả khách sạn Mô tả khách sạn
                            Mô tả khách sạn
                        </p>
                    </div>

                    <div className="price-booking-area">
                        <div className="price-section">
                            <span className="price-label">Giá phòng/ đêm</span>
                            <div className="price-display">
                                <span className="price">{pricePerNight}</span>
                                <span className="currency">{currency}</span>
                            </div>
                        </div>
                        <button className="booking-btn">Chọn Phòng</button>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="details-grid">
                    {/* Amenities */}
                    <div className="details-card amenities-card">
                        <h3 className="card-title">Tiện ích chính</h3>
                        <div className="amenities-list">
                            {amenities.map((amenity, index) => {
                                const IconComponent = amenity.icon;
                                return (
                                    <div key={index} className="amenity-item">
                                        <IconComponent className="amenity-icon" />
                                        <span>{amenity.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Locations */}
                    <div className="details-card locations-card">
                        <h3 className="card-title">
                            <FaMapMarkerAlt className="card-icon" />
                            Trong khu vực
                        </h3>
                        <ul className="locations-list">
                            {locations.map((location, index) => (
                                <li key={index}>
                                    <FaMapMarkerAlt className="location-dot" />
                                    {location}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Ratings & Reviews */}
                    <div className="details-card ratings-card">
                        <h3 className="card-title">
                            <FaSmile className="card-icon" />
                            Đánh giá
                        </h3>
                        <div className="ratings-content">
                            <div className="rating-item">
                                <FaComment className="rating-icon" />
                                <span>{ratings.bookings} lượt book</span>
                            </div>
                            <div className="rating-item">
                                <div className="score-badge">
                                    {ratings.score}
                                    <span className="score-max">/ {ratings.totalScore}</span>
                                </div>
                                <span>điểm đánh giá</span>
                            </div>
                            <div className="rating-item">
                                <FaComment className="rating-icon" />
                                <span>{ratings.reviews} Reviews</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelOverview;