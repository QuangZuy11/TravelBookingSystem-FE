import React, { useEffect, useState } from "react";
import "./FeaturedTours.css";

export default function FeaturedTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm định dạng giá tiền
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // Gọi API để lấy danh sách tour
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/tours"); // 👉 endpoint backend của bạn
        const data = await res.json();
        setTours(data);
      } catch (err) {
        console.error("Lỗi khi load tours:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  if (loading) {
    return <div className="loading">Đang tải danh sách tour...</div>;
  }

  return (
    <section className="featured-section">
      <div className="container">
        <div className="text-center">
          <h2 className="section-title">Tour Nổi Bật</h2>
          <p className="section-subtitle">
            Khám phá những điểm đến tuyệt vời nhất Việt Nam với các tour được
            yêu thích nhất
          </p>
        </div>

        <div className="tours-grid">
          {tours.map((tour) => (
            <div key={tour._id} className="tour-card">
              <div className="image-container">
                <img
                  src={tour.image || "/placeholder.jpg"}
                  alt={tour.title}
                  className="tour-image"
                />
                {tour.discount && (
                  <span className="badge discount">-{tour.discount}%</span>
                )}
                {tour.tag && <span className="badge tag">{tour.tag}</span>}
                <button className="heart-btn">❤️</button>
              </div>

              <div className="card-content">
                <h3 className="tour-title">{tour.title}</h3>
                <p className="tour-location">📍 {tour.location}</p>

                <div className="tour-info">
                  <span>⏱ {tour.duration_hours}</span>
                  <span>
                    ⭐ {tour.rating || "4.5"} ({tour.reviews || 0})
                  </span>
                </div>

                {tour.description && (
                  <ul className="highlights">
                    {tour.description.map((desc, i) => (
                      <li key={i}>• {desc}</li>
                    ))}
                  </ul>
                )}

                <div className="price-row">
                  <div>
                    <span className="price">{formatPrice(tour.price)}</span>
                    {tour.originalPrice && (
                      <span className="old-price">
                        {formatPrice(tour.originalPrice)}
                      </span>
                    )}
                    <div className="per-person">/ người</div>
                  </div>
                  <a href={`/book/${tour._id}`} className="book-btn">
                    Đặt Ngay
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a href="/search" className="view-all-btn">
            Xem Tất Cả Tour
          </a>
        </div>
      </div>
    </section>
  );
}
