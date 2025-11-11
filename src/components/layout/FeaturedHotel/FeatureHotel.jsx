import React, { useEffect, useState } from "react";
import "./FeatureHotel.css";
import "../../../../src/pages/traveler/components/BookTour/TourCard.css";
import { MapPin, Star, Wifi, Car, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { getProxiedGoogleDriveUrl } from "../../../utils/googleDriveImageHelper";

export default function FeaturedHotel() {
  const [hotels, setHotels] = useState([]);

  // Helper function để format địa chỉ
  const formatAddress = (hotel) => {
    const raw = hotel.address || hotel.location?.address || hotel.location;
    if (!raw) return "Chưa cập nhật địa chỉ";

    if (typeof raw === "string") {
      return raw;
    }

    if (typeof raw === "object" && raw !== null) {
      const parts = [
        raw.street || raw.streetAddress,
        raw.ward,
        raw.district || raw.county,
        raw.city || raw.town,
        raw.state,
        raw.country,
        raw.zipCode || raw.postalCode,
      ]
        .map((part) => (typeof part === "string" ? part.trim() : ""))
        .filter(Boolean);

      if (parts.length) {
        return parts.join(", ");
      }
    }

    return "Chưa cập nhật địa chỉ";
  };

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/ad-bookings/active?type=hotel");
        const data = await res.json();
        setHotels(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách khách sạn:", error);
      }
    };
    fetchHotels();
  }, []);

  // Helper function để render icon tiện nghi
  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) {
      return <Wifi size={14} />;
    }
    if (amenityLower.includes('parking') || amenityLower.includes('đỗ xe')) {
      return <Car size={14} />;
    }
    if (amenityLower.includes('restaurant') || amenityLower.includes('nhà hàng') || amenityLower.includes('ăn uống')) {
      return <Utensils size={14} />;
    }
    return null;
  };

  return (
    <div className="featured-hotels-wrapper">
      <div className="featured-hotels-container">
        {/* Header */}
        <div className="featured-hotels-header">
          <h2>Khách sạn Nổi Bật</h2>
          <p>
            Khám phá những khách sạn tuyệt vời nhất Việt Nam với dịch vụ chất lượng cao
          </p>
        </div>

        {/* Hotel Grid */}
        <div className="featured-hotels-grid">
          {hotels.length === 0 ? (
            <p className="no-data">Đang tải dữ liệu...</p>
          ) : (
            hotels.map((hotel) => {
              // Đảm bảo amenities là mảng
              const amenities = Array.isArray(hotel.amenities)
                ? hotel.amenities
                : typeof hotel.amenities === "string"
                  ? [hotel.amenities]
                  : [];

              return (
                <div key={hotel._id} className="tour-card">
                  <div className="tour-image-container">
                    <img
                      src={getProxiedGoogleDriveUrl(
                        hotel.images?.[0] || "/placeholder.svg"
                      )}
                      alt={hotel.name}
                      className="tour-image"
                    />
                    <div className="promotion-badge">Nổi bật</div>
                  </div>

                  <div className="tour-info">
                    <h3 className="tour-name">{hotel.name || "Khách sạn chưa đặt tên"}</h3>

                    <div className="tour-meta">
                      {hotel.address && (
                        <div className="tour-destination">
                          <MapPin size={16} />
                          <span>{formatAddress(hotel)}</span>
                        </div>
                      )}
                      {hotel.city && typeof hotel.city === 'string' && (
                        <div className="tour-duration">
                          <span>{hotel.city}</span>
                        </div>
                      )}
                    </div>

                    {amenities.length > 0 && (
                      <ul className="tour-highlights">
                        {amenities.slice(0, 3).map((amenity, index) => {
                          // Đảm bảo amenity là string
                          const amenityText = typeof amenity === 'string' ? amenity : 
                            (typeof amenity === 'object' && amenity?.name) ? amenity.name : 
                            'Tiện nghi';
                          return (
                            <li key={index}>
                              {getAmenityIcon(amenityText)}
                              <span style={{ marginLeft: '4px' }}>{amenityText}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    <div className="tour-rating">
                      <Star size={16} fill="#FFD700" color="#FFD700" />
                      <span className="rating-value">{Number(hotel.rating) || 0}</span>
                      <span className="rating-reviews">
                        ({Number(hotel.reviews_count) || 0} đánh giá)
                      </span>
                    </div>

                    <div className="tour-footer">
                      <div className="tour-price">
                        <span className="free">Liên hệ</span>
                      </div>
                      <Link
                        to={`/hotel-detail/${hotel?._id || hotel?.id}`}
                        className="btn-book"
                      >
                        Xem Chi Tiết
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="featured-hotels-view-all">
          <Link to="/hotel" className="featured-hotels-button">
            Xem Tất Cả Khách sạn
          </Link>
        </div>
      </div>
    </div>
  );
}
