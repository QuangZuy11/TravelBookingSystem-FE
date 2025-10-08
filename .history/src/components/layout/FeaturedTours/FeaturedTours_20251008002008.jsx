import React, { useEffect, useState } from "react";
import "./FeaturedTours.css";
import { Star, Clock, MapPin, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
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
    <section className="featured-section">
      <div className="featured-container">
        <div className="featured-header">
          <h2>Tour Nổi Bật</h2>
          <p>
            Khám phá những điểm đến tuyệt vời nhất Việt Nam với các tour được
            yêu thích nhất
          </p>
        </div>

        <div className="tour-grid">
          {tours.length === 0 ? (
            <p className="no-data">Đang tải dữ liệu...</p>
          ) : (
            tours.map((tour) => (
              <div key={tour._id} className="tour-card">
                <div className="tour-image-wrapper">
                  <img
                    src={tour.image || "/placeholder.svg"}
                    alt={tour.title}
                    className="tour-image"
                  />
                  {tour.discount && (
                    <span className="badge-discount">
                      -{tour.advertisement_id}%
                    </span>
                  )}
                  {tour.tag && <span className="badge-tag">{tour.tag}</span>}
                  <button className="btn-heart">
                    <Heart className="icon-heart" />
                  </button>
                </div>

                <div className="tour-content">
                  <h3>{tour.title}</h3>
                  <div className="tour-location">
                    <MapPin className="icon-small" />
                    <span>{tour.location}</span>
                  </div>

                  <div className="tour-info">
                    <div className="tour-location">
                      <Clock className="icon-small" />
                      <span>{tour.duration_hours}</span>
                    </div>
                    <div className="info-right">
                      <FaStar className="icon-star" />
                      <span>{tour.rating}</span>
                      <span className="text-muted">({tour.total_rating})</span>
                    </div>
                  </div>

                  <ul className="tour-highlights">
                    {tour.description?.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                  <div className="tour-footer">
                    <div className="price-group">
                      <span className="price-current">
                        {formatPrice(tour.price)}
                      </span>
                      {tour.originalPrice && (
                        <span className="price-old">
                          {formatPrice(tour.originalPrice)}
                        </span>
                      )}
                      <div className="price-note">/ người</div>
                    </div>
                    <Link to={`/book/${tour._id}`} className="btn-book">
                      Đặt Ngay
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="btn-all">
          <Link to="/tour" className="btn-outline">
            Xem Tất Cả Tour
          </Link>
        </div>
      </div>
    </section>
  );
}
