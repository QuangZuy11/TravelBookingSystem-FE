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
        <section id="location" className="hotel-detail-content-section location-section">
            <div className="hotel-detail-section-header">
                <h2 className="hotel-detail-section-title">Vị Trí & Xung Quanh</h2>
                <p className="hotel-detail-section-description">Khám phá những địa điểm gần khách sạn</p>
            </div>

            <div className="hotel-detail-location-content">
                <div className="hotel-detail-map-container">
                    <div className="hotel-detail-map-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <p>Bản đồ sẽ được hiển thị ở đây</p>
                    </div>
                    <div className="hotel-detail-address-card">
                        <h4>Địa chỉ khách sạn</h4>
                        <p>123 Đường ABC, Quận XYZ, Thành phố Hà Nội</p>
                        <button className="hotel-detail-direction-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                            </svg>
                            Chỉ đường
                        </button>
                    </div>
                </div>

                <div className="hotel-detail-nearby-places">
                    <h3 className="hotel-detail-nearby-title">Địa điểm lân cận</h3>
                    <div className="hotel-detail-places-list">
                        {nearbyPlaces.map((place, index) => (
                            <div key={index} className="hotel-detail-place-item">
                                <div className="hotel-detail-place-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                </div>
                                <div className="hotel-detail-place-info">
                                    <h4>{place.name}</h4>
                                    <div className="hotel-detail-place-meta">
                                        <span className="hotel-detail-place-type">{place.type}</span>
                                        <span className="hotel-detail-place-distance">{place.distance}</span>
                                        <span className="hotel-detail-place-time">{place.time}</span>
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
