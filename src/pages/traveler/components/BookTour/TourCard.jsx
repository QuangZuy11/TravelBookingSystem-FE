import React from "react";
import "./TourCard.css";
import { Star, MapPin, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { getDifficultyText } from "../../../../utils/tourHelpers";

export function TourCard({ tour }) {
  // Đảm bảo highlights là mảng
  const highlights = Array.isArray(tour.highlights)
    ? tour.highlights
    : typeof tour.highlights === "string"
    ? [tour.highlights]
    : [];

  // Tính giá hiển thị
  const hasPromotion =
    tour.promotion && tour.originalPrice && tour.originalPrice > tour.price;
  const displayPrice = tour.price || 0;
  const displayOriginalPrice = hasPromotion ? tour.originalPrice : null;

  return (
    <div className="tour-card">
      <div className="tour-image-container">
        <img src={tour.image} alt={tour.title} className="tour-image" />
        {hasPromotion && tour.promotion && (
          <div className="promotion-badge">{tour.promotion.code}</div>
        )}
      </div>

      <div className="tour-info">
        <h3 className="tour-name">{tour.name}</h3>

        <div className="tour-meta">
          <div className="tour-destination">
            <MapPin size={16} />
            <span>
              {tour.destinations && tour.destinations.length > 0
                ? tour.destinations.map((dest) => dest.name || dest).join(", ")
                : Array.isArray(tour.destination_id) &&
                  tour.destination_id.length > 0
                ? tour.destination_id
                    .map((dest) =>
                      typeof dest === "object" ? dest.name : dest
                    )
                    .join(", ")
                : tour.name || "Chưa có địa điểm"}
            </span>
          </div>

          <div className="tour-duration">
            <Clock size={16} />
            <span>{tour.duration}</span>
          </div>
          {tour.difficulty && (
            <div className="tour-duration">
              <TrendingUp size={16} />
              <span>
                Độ khó:{"   "} {getDifficultyText(tour.difficulty)}
              </span>
            </div>
          )}
        </div>

        <ul className="tour-highlights">
          {highlights.map((h, index) => (
            <li key={index}>{h}</li>
          ))}
        </ul>

        <div className="tour-rating">
          <Star size={16} fill="#FFD700" color="#FFD700" />
          <span className="rating-value">{tour.rating}</span>
          <span className="rating-reviews">({tour.total_rating} đánh giá)</span>
        </div>

        <div className="tour-footer">
          <div className="tour-price">
            {displayPrice === 0 ? (
              <span className="free">Miễn phí</span>
            ) : (
              <>
                {displayOriginalPrice && displayOriginalPrice > displayPrice ? (
                  <>
                    <span className="original-price">
                      {displayOriginalPrice.toLocaleString("vi-VN")} ₫
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
          <Link to={`/tour/${tour?._id || tour?.id}`} className="btn-book">
            Đặt Ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
