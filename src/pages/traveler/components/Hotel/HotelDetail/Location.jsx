export default function Location() {
    const nearbyPlaces = [
        { name: "Hồ Hoàn Kiếm", distance: "500m", time: "5 phút đi bộ", type: "Địa danh" },
        { name: "Phố Cổ Hà Nội", distance: "800m", time: "10 phút đi bộ", type: "Khu phố" },
        { name: "Nhà Hát Lớn", distance: "1.2km", time: "15 phút đi bộ", type: "Văn hóa" },
        { name: "Chợ Đồng Xuân", distance: "1.5km", time: "5 phút lái xe", type: "Mua sắm" },
        { name: "Văn Miếu Quốc Tử Giám", distance: "3km", time: "10 phút lái xe", type: "Di tích" },
        { name: "Sân bay Nội Bài", distance: "25km", time: "35 phút lái xe", type: "Sân bay" },
    ]

    return (
        <section id="location" className="content-section location-section">
            <div className="section-header">
                <h2 className="section-title">Vị Trí & Xung Quanh</h2>
                <p className="section-description">Khám phá những địa điểm gần khách sạn</p>
            </div>

            <div className="location-content">
                <div className="map-container">
                    <div className="map-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <p>Bản đồ Google Maps sẽ được hiển thị ở đây</p>
                    </div>
                    <div className="address-card">
                        <h4>Địa chỉ chính xác</h4>
                        <p>123 Phố Huế, Quận Hai Bà Trưng, Hà Nội, Việt Nam</p>
                        <button className="direction-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                            </svg>
                            Chỉ đường
                        </button>
                    </div>
                </div>

                <div className="nearby-places">
                    <h3 className="nearby-title">Địa điểm lân cận</h3>
                    <div className="places-list">
                        {nearbyPlaces.map((place, index) => (
                            <div key={index} className="place-item">
                                <div className="place-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                </div>
                                <div className="place-info">
                                    <h4>{place.name}</h4>
                                    <div className="place-meta">
                                        <span className="place-type">{place.type}</span>
                                        <span className="place-distance">{place.distance}</span>
                                        <span className="place-time">{place.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
