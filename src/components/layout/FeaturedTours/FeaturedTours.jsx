import React, { useEffect, useState } from "react";
import "./FeaturedTours.css";
import "../../../../src/pages/traveler/components/BookTour/TourCard.css";
import { Clock, MapPin, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { getProxiedGoogleDriveUrl } from "../../../utils/googleDriveImageHelper";
import {
  calculateDiscountedPrice,
  formatPromotionDiscount,
} from "../../../utils/promotionHelpers";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";

export default function FeaturedTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        // Fetch tours from ad-bookings
        const res = await fetch(
          "http://localhost:3000/api/ad-bookings/active?type=tour"
        );
        const toursData = await res.json();

        // Fetch promotions for all tours
        const toursWithPromotions = await Promise.all(
          toursData.map(async (tour) => {
            try {
              // Fetch active promotions for this tour
              const promoRes = await fetch(
                `http://localhost:3000/api/traveler/promotions?targetType=tour&targetId=${tour._id}`
              );
              const promoData = await promoRes.json();

              // Get the first active promotion
              let activePromotion = null;
              if (
                promoData.success &&
                promoData.data &&
                promoData.data.length > 0
              ) {
                // Filter active promotions (check dates)
                const now = new Date();
                activePromotion = promoData.data.find((promo) => {
                  const startDate = new Date(promo.startDate);
                  const endDate = new Date(promo.endDate);
                  return (
                    now >= startDate &&
                    now <= endDate &&
                    promo.status === "active"
                  );
                });

                // If no active promotion found by date, use the first one
                if (!activePromotion && promoData.data[0].status === "active") {
                  activePromotion = promoData.data[0];
                }
              }

              return {
                ...tour,
                promotion: activePromotion,
              };
            } catch (error) {
              console.error(
                `Error fetching promotions for tour ${tour._id}:`,
                error
              );
              return {
                ...tour,
                promotion: null,
              };
            }
          })
        );

        setTours(toursWithPromotions);
      } catch (error) {
        console.error("Lỗi khi tải danh sách tour:", error);
      } finally {
        setLoading(false);
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
          {loading ? (
            <p className="no-data">Đang tải dữ liệu...</p>
          ) : tours.length === 0 ? (
            <p className="no-data">Không có tour nổi bật</p>
          ) : (
            tours.map((tour) => {
              // Đảm bảo included_services là mảng
              const highlights = Array.isArray(tour.included_services)
                ? tour.included_services
                : typeof tour.included_services === "string"
                ? [tour.included_services]
                : [];

              // Get price from tour data
              const originalPrice = tour.price || 0;

              // Calculate discounted price
              const discountPrice = calculateDiscountedPrice(
                originalPrice,
                tour.promotion
              );

              return (
                <div key={tour._id} className="tour-card">
                  <div
                    className="tour-image-container"
                    style={{ position: "relative" }}
                  >
                    <img
                      src={getProxiedGoogleDriveUrl(
                        tour.image || "/placeholder.svg"
                      )}
                      alt={tour.title}
                      className="tour-image"
                    />

                    {/* Promotion badge */}
                    {tour.promotion && (
                      <div
                        className="promotion-badge"
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                          backgroundColor: "#dc2626",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          whiteSpace: "nowrap",
                          width: "fit-content",
                          display: "inline-block",
                        }}
                      >
                        {formatPromotionDiscount(tour.promotion)}
                      </div>
                    )}

                    {/* Featured badge */}
                    <div
                      className="promotion-badge"
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: tour.promotion ? "12px" : "12px",
                        backgroundColor: "#2d6a4f",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        whiteSpace: "nowrap",
                        width: "fit-content",
                        display: "inline-block",
                      }}
                    >
                      Nổi bật
                    </div>
                  </div>

                  <div className="tour-info">
                    <h3 className="tour-name">{tour.title}</h3>

                    <div className="tour-meta">
                      {tour.location && (
                        <div className="tour-destination">
                          <MapPin size={16} />
                          <span>{tour.location}</span>
                        </div>
                      )}
                      {tour.difficulty && (
                        <div className="tour-duration">
                          <Clock size={16} />
                          <span>Thời lượng: {tour.duration}</span>
                        </div>
                      )}
                      {tour.difficulty && (
                        <div className="tour-duration">
                          <TrendingUp size={16} />
                          <span>Độ khó: {tour.difficulty}</span>
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

                    <div
                      className="tour-footer"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "auto",
                        paddingTop: "12px",
                      }}
                    >
                      <div className="tour-price">
                        {tour.promotion && originalPrice > 0 && (
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "#999",
                              fontSize: "14px",
                              marginRight: "8px",
                            }}
                          >
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                        {originalPrice > 0 ? (
                          <span
                            style={{
                              color: "#2d6a4f",
                              fontWeight: "700",
                              fontSize: "18px",
                            }}
                          >
                            {formatPrice(discountPrice)}
                          </span>
                        ) : (
                          <span className="free">Liên hệ</span>
                        )}
                      </div>
                      <Link
                        to={`/tour/${tour?._id || tour?.id}`}
                        className="btn-book"
                        style={{
                          backgroundColor: "#2d6a4f",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          textDecoration: "none",
                          fontWeight: "600",
                          fontSize: "14px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#003C3C";
                          e.target.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#0F766E";
                          e.target.style.transform = "translateY(0)";
                        }}
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

        <div className="featured-tours-view-all">
          <Link to="/tour" className="featured-tours-button">
            Xem Tất Cả Tour
          </Link>
        </div>
      </div>
    </div>
  );
}
