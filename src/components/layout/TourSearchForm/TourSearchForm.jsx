import React, { useState } from "react";
import "./TourSearchForm.css";

const TourSearchForm = () => {
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");

  const handleSearch = () => {
    console.log("Điểm đến:", destination);
    console.log("Ngày:", date);
    console.log("Số khách:", guests);
  };

  return (
    <div className="tour-search-container">
      <div className="tour-search-header">
        <h1 className="tour-search-title">Tìm Kiếm Tour Lý Tưởng</h1>
        <p className="tour-search-subtitle">
          Sử dụng AI để tìm kiếm và gợi ý những tour du lịch phù hợp nhất với sở
          thích của bạn
        </p>
      </div>

      <div className="tour-search-form-wrapper">
        {/* Labels Row */}
        <div className="tour-search-labels-row">
          <div className="tour-search-label">Điểm Đến</div>
          <div className="tour-search-label">Ngày Khởi Hành</div>
          <div className="tour-search-label">Số Khách</div>
          <div></div>
        </div>

        {/* Inputs Row */}
        <div className="tour-search-inputs-row">
          <div className="tour-search-input-wrapper">
            <svg
              className="tour-search-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Hà Nội, Hồ Chí Minh..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="tour-search-input"
            />
          </div>

          <div className="tour-search-input-wrapper">
            <svg
              className="tour-search-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="tour-search-input"
            />
          </div>

          <div className="tour-search-input-wrapper">
            <svg
              className="tour-search-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>

            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="tour-search-select"
            >
              <option value="">Chọn số khách</option>
              <option value="1">1 người</option>
              <option value="2">2 người</option>
              <option value="3-5">3-5 người</option>
              <option value="6-10">6-10 người</option>
            </select>
          </div>
          <button onClick={handleSearch} className="tour-search-button">
            <svg
              className="tour-search-button-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Tìm Kiếm
          </button>
        </div>

        <div className="tour-search-quick-search">
          <span className="tour-search-quick-label">Tìm kiếm nhanh:</span>
          {[
            "Hà Nội",
            "Hồ Chí Minh",
            "Đà Nẵng",
            "Nha Trang",
            "Phú Quốc",
            "Sapa",
            "Hạ Long",
          ].map((city) => (
            <button
              key={city}
              onClick={() => setDestination(city)}
              className="tour-search-city-button"
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TourSearchForm;
