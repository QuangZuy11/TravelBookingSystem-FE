import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./DetailTour.css";
import { Star } from "lucide-react";

export default function DetailTour() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch tour detail with itineraries included
        const tourRes = await fetch(
          `http://localhost:3000/api/traveler/tours/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!tourRes.ok) {
          throw new Error(`Lỗi tải tour: ${tourRes.status}`);
        }

        const response = await tourRes.json();

        if (response.success && response.data) {
          setTour(response.data);
          // Itineraries are already included in the tour data
          setItineraries(response.data.itineraries || []);
        } else {
          throw new Error("Dữ liệu tour không hợp lệ");
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) return <div className="loading">Đang tải thông tin tour...</div>;
  if (error) return <div className="error">Lỗi: {error}</div>;
  if (!tour) return <div className="error">Không tìm thấy thông tin tour.</div>;

  return (
    <div className="detail-container">
      {/* HERO SECTION */}
      <div className="hero-section">
        <img src={tour.image} alt={tour.name} className="hero-image" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">{tour.name}</h1>
          <div className="hero-info">
            <span className="rating">
              <Star size={18} fill="#FFD700" stroke="#FFD700" />
              {tour.rating} ({tour.total_rating})
            </span>
            <span className="location">
              {tour.destination || "Chưa có địa điểm"}
            </span>
          </div>
          <div className="hero-price">
            <span>{tour.price.toLocaleString()}₫</span> / {tour.duration}
          </div>
          <button className="btn-book">Đặt ngay</button>
        </div>
      </div>

      {/* TOUR DETAILS */}
      <div className="tour-detail-section">
        <div className="tour-info-card">
          <h2>Điểm nổi bật</h2>
          <ul>
            {tour.highlights?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="tour-info-card">
          <h2>Dịch vụ bao gồm</h2>
          <ul>
            {tour.included_services?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="tour-description">
          <h2>Mô tả tour</h2>
          <p>{tour.description}</p>
        </div>
      </div>

      {/* ITINERARY SECTION */}
      <div className="itinerary-section">
        <h2>Lịch trình chi tiết</h2>
        {itineraries.length === 0 ? (
          <p className="no-itinerary">Chưa có lịch trình cho tour này.</p>
        ) : (
          itineraries.map((day) => (
            <div key={day._id} className="itinerary-day">
              <h3>
                Ngày {day.day_number}: {day.title}
              </h3>
              <p className="itinerary-desc">{day.description}</p>

              {/* Render activities */}
              {day.activities && day.activities.length > 0 && (
                <ul className="activities-list">
                  {day.activities.map((activity, actIndex) => (
                    <li
                      key={activity._id || actIndex}
                      className="activity-item"
                    >
                      <strong>{activity.time}:</strong> {activity.action}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
