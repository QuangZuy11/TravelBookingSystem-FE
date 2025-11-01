import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./DetailTour.css";
import { Star } from "lucide-react";

export default function DetailTour() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [itineraries, setItineraries] = useState([]);

  useEffect(() => {
    // Fetch tour detail
    const fetchTour = async () => {
      try {
        const res = await fetch(`/api/tours/${id}`);
        const data = await res.json();
        setTour(data);
      } catch (err) {
        console.error("Error loading tour:", err);
      }
    };

    // Fetch itineraries by tour_id
    const fetchItineraries = async () => {
      try {
        const res = await fetch(`/api/itineraries?tour_id=${id}`);
        const data = await res.json();
        setItineraries(data);
      } catch (err) {
        console.error("Error loading itineraries:", err);
      }
    };

    fetchTour();
    fetchItineraries();
  }, [id]);

  if (!tour) return <div className="loading">Đang tải thông tin tour...</div>;

  return (
    <div className="detail-container">
      {/* HERO SECTION */}
      <div className="hero-section">
        <img src={tour.image} alt={tour.title} className="hero-image" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">{tour.title}</h1>
          <div className="hero-info">
            <span className="rating">
              <Star size={18} fill="#FFD700" stroke="#FFD700" />
              {tour.rating} ({tour.total_rating})
            </span>
            <span className="location">
              {tour.destinations && tour.destinations.length > 0
                ? tour.destinations.map(dest => dest.name || dest).join(', ')
                : Array.isArray(tour.destination_id) && tour.destination_id.length > 0
                  ? tour.destination_id.map(dest => typeof dest === 'object' ? dest.name : dest).join(', ')
                  : tour.location || 'Chưa có địa điểm'
              }
            </span>
          </div>
          <div className="hero-price">
            <span>{tour.price.toLocaleString()}₫</span> / {tour.duration_hours}
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
                Ngày {day.day}: {day.title}
              </h3>
              <p className="itinerary-desc">{day.description}</p>
              <ul>
                {day.activities?.map((act, i) => (
                  <li key={i}>
                    <strong>{act.time || `${act.start_time} - ${act.end_time}`}:</strong> {act.action || act.activity_name || act}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
