import React, { useEffect, useState } from "react";
import "./FeaturedTours.css";
import { Clock, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

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

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

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
            tours.map((tour) => (
              <div key={tour._id} className="tour-card-new">
                {/* Image */}
                <div className="tour-card-image-wrapper">
                  <img
                    className="tour-card-image"
                    src={tour.image || "/placeholder.svg"}
                    alt={tour.title}
                  />
                  <div className="tour-card-badge">Nổi bật</div>
                </div>

                {/* Content */}
                <div className="tour-card-content">
                  <h3 className="tour-card-title">{tour.title}</h3>

                  {/* Location */}
                  <div className="tour-card-location">
                    <MapPin className="tour-card-icon" />
                    <span>{tour.location}</span>
                  </div>

                  {/* Duration */}
                  <div className="tour-card-duration">
                    <Clock className="tour-card-icon" />
                    <span>{tour.duration_hours}</span>
                  </div>

                  {/* Description */}
                  {tour.description && tour.description.length > 0 && (
                    <ul className="tour-card-description">
                      {tour.description.slice(0, 3).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}

                  {/* Rating */}
                  <div className="tour-card-rating">
                    <Star className="tour-card-star-icon" />
                    <span>
                      {tour.rating} ({tour.total_rating} đánh giá)
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="tour-card-footer">
                    <span className="tour-card-price">
                      {formatPrice(tour.price)}
                    </span>
                    <Link to={`/book/${tour._id}`} className="tour-card-button">
                      Đặt Ngay
                    </Link>
                  </div>
                </div>
              </div>
            ))
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
