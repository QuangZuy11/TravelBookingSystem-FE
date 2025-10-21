import React from "react";
import "./TourCard.css";
import { Star } from "lucide-react";
import { getProxiedGoogleDriveUrl } from '../../../../utils/googleDriveImageHelper';

export function TourCard({ tour }) {
  // Đảm bảo highlights là mảng
  const highlights = Array.isArray(tour.highlights)
    ? tour.highlights
    : typeof tour.highlights === "string"
      ? [tour.highlights]
      : [];

  return (
    <div className="tour-card">
      <img src={getProxiedGoogleDriveUrl(tour.image)} alt={tour.name} className="tour-image" />

      <div className="tour-info">
        <h3 className="tour-name">{tour.name}</h3>
        <p className="tour-destination">{tour.destination}</p>
        <p className="tour-duration">{tour.duration}</p>

        <div className="tour-rating">
          <Star size={16} color="#FFD700" />
          <span>{tour.rating}</span> ({tour.reviews} đánh giá)
        </div>

        <ul className="tour-highlights">
          {highlights.map((h, index) => (
            <li key={index}>{h}</li>
          ))}
        </ul>

        <div className="tour-price">
          {tour.price === 0 ? (
            <span className="free">Miễn phí</span>
          ) : (
            <>
              <span className="price">
                {tour.price.toLocaleString("vi-VN")}₫
              </span>
              {tour.originalPrice && (
                <span className="original-price">
                  {tour.originalPrice.toLocaleString("vi-VN")}₫
                </span>
              )}
            </>
          )}
        </div>

        <button className="btn-book">Đặt ngay</button>
      </div>
    </div>
  );
}
