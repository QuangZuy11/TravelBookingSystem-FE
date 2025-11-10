import React, { useEffect, useState } from "react";
import "./FeaturedTours.css";
import "../../../../src/pages/traveler/components/BookTour/TourCard.css";
import { Clock, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { getProxiedGoogleDriveUrl } from "../../../utils/googleDriveImageHelper";

export default function FeaturedTours() {
  const [tours, setTours] = useState([]);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/ad-bookings/active");
        const data = await res.json();
        setTours(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách tour:", error);
      }
    };
    fetchTours();
  }, []);

  return (
    <div className="featured-tours-wrapper">
      <div className="featured-tours-container">
        {/* Header */}
        <div className="featured-tours-header">
          <h2>Tour Nổi Bật</h2>
          <p>
            Khám phá những điểm đến tuyệt vời nhất Việt Nam với các tour được
            yêu thích nhất
          </p>
        </div>

        {/* Tour Grid */}
        <div className="featured-tours-grid">
          {tours.length === 0 ? (
            <p className="no-data">Đang tải dữ liệu...</p>
          ) : (
            tours.map((tour) => {
              // Đảm bảo highlights là mảng
              const highlights = Array.isArray(tour.highlights)
                ? tour.highlights
                : typeof tour.highlights === "string"
                ? [tour.highlights]
                : [];

              // Tính giá hiển thị
              const hasPromotion =
                tour.promotion &&
                tour.originalPrice &&
                tour.originalPrice > tour.price;
              const displayPrice = tour.price || 0;
              const displayOriginalPrice = hasPromotion
                ? tour.originalPrice
                : null;

              return (
                <div key={tour._id} className="tour-card">
                  <div className="tour-image-container">
                    <img
                      src={getProxiedGoogleDriveUrl(
                        tour.image || "/placeholder.svg"
                      )}
                      alt={tour.title || tour.name}
                      className="tour-image"
                    />
                    <div className="promotion-badge">Nổi bật</div>
                  </div>

                  <div className="tour-info">
                    <h3 className="tour-name">{tour.title || tour.name}</h3>

                    <div className="tour-meta">
                      {tour.location && (
                        <div className="tour-destination">
                          <MapPin size={16} />
                          <span>{tour.location}</span>
                        </div>
                      )}
                      {tour.duration && (
                        <div className="tour-duration">
                          <Clock size={16} />
                          <span>{tour.duration}</span>
                        </div>
                      )}
                    </div>

                    {highlights.length > 0 && (
                      <ul className="tour-highlights">
                        {highlights.slice(0, 3).map((h, index) => (
                          <li key={index}>{h}</li>
                        ))}
                      </ul>
                    )}

                    <div className="tour-rating">
                      <Star size={16} fill="#FFD700" color="#FFD700" />
                      <span className="rating-value">{tour.rating || 0}</span>
                      <span className="rating-reviews">
                        ({tour.total_rating || 0} đánh giá)
                      </span>
                    </div>

                    <div className="tour-footer">
                      <div className="tour-price">
                        {displayPrice === 0 ? (
                          <span className="free">Miễn phí</span>
                        ) : (
                          <>
                            {displayOriginalPrice &&
                            displayOriginalPrice > displayPrice ? (
                              <>
                                <span className="original-price">
                                  {displayOriginalPrice.toLocaleString("vi-VN")}{" "}
                                  ₫
                                </span>
                                <span className="price">
                                  {displayPrice.toLocaleString("vi-VN")} ₫
                                </span>
                              </>
                            ) : (
                              <span className="price">
                                {displayPrice.toLocaleString("vi-VN")} ₫
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <Link
                        to={`/tour/${tour?._id || tour?.id}`}
                        className="btn-book"
                      >
                        Đặt Ngay
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="featured-tours-view-all">
          <Link to="/tour" className="featured-tours-button">
            Xem Tất Cả Tour
          </Link>
        </div>
      </div>
    </div>
  );
}
