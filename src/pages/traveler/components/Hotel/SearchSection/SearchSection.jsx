import { useState } from "react";
import "../SearchSection/SearchSection.css";

export default function SearchSection() {
    const [location, setLocation] = useState("");
    const [workTrip, setWorkTrip] = useState(false);
    const [star, setStar] = useState(null);

    return (
        <div className="search-bg">
            <div className="search-title">
                Khách sạn & Nhà ở <span className="dot">.</span>
            </div>
            <div className="search-box">
                <form className="search-form">
                    <div className="search-input location">
                        <i className="fa-solid fa-location-dot"></i>
                        <input
                            type="text"
                            placeholder="Đi đâu?"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                        />
                    </div>
                    <div className="search-input date">
                        <i className="fa-solid fa-calendar-days"></i>
                        <span className="date-label">Chọn ngày</span>
                        <span className="date-sep">-</span>
                        <span className="date-label">Chọn ngày</span>
                        <span className="nights">0 đêm</span>
                    </div>
                    <div className="search-input guests">
                        <i className="fa-solid fa-user"></i>
                        <span>
                            1 phòng , 2 người lớn , 0 trẻ em
                        </span>
                    </div>
                    <button className="search-btn" type="submit">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <span>Tìm kiếm</span>
                    </button>
                </form>
                <div className="search-options">
                    <label className="work-trip">
                        <input
                            type="checkbox"
                            checked={workTrip}
                            onChange={e => setWorkTrip(e.target.checked)}
                        />
                        Tôi đang đi công tác
                        <span className="info-icon" title="Công tác sẽ gợi ý các khách sạn phù hợp cho công việc.">
                            <i className="fa-solid fa-circle-info"></i>
                        </span>
                    </label>
                    <div className="star-filter">
                        <span>Xếp hạng sao</span>
                        {[2, 3, 4, 5].map(s => (
                            <button
                                key={s}
                                type="button"
                                className={`star-btn ${star === s ? "active" : ""}`}
                                onClick={() => setStar(s)}
                            >
                                {s === 2 ? "≤ 2" : s} <i className="fa-regular fa-star"></i>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}