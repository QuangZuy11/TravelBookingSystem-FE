import "../HotelHighlight/HotelHighlights.css";

export default function HotelHighlights() {
    return (
        <section className="highlights">
            <h2>Khách sạn nổi bật</h2>
            <div className="hotel-list">
                <div className="hotel-card">
                    <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" alt="Hotel 1" />
                    <div className="hotel-info">
                        <h3>Sunrise Hotel</h3>
                        <p>Hà Nội</p>
                        <span>4.9★</span>
                    </div>
                </div>
                <div className="hotel-card">
                    <img src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80" alt="Hotel 2" />
                    <div className="hotel-info">
                        <h3>Blue Ocean Resort</h3>
                        <p>Đà Nẵng</p>
                        <span>4.8★</span>
                    </div>
                </div>
                <div className="hotel-card">
                    <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80" alt="Hotel 3" />
                    <div className="hotel-info">
                        <h3>Luxury Saigon</h3>
                        <p>TP. Hồ Chí Minh</p>
                        <span>5.0★</span>
                    </div>
                </div>
            </div>
        </section>
    );
}