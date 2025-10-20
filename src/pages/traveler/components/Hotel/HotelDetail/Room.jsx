export default function Rooms() {
    const rooms = [
        {
            id: 1,
            name: "Phòng Deluxe",
            price: "500.000",
            image: "/luxury-hotel-room.png",
            size: "25m²",
            bed: "1 giường đôi",
            guests: "2 người",
            amenities: ["Wifi miễn phí", "Máy lạnh", "TV màn hình phẳng", "Minibar"],
        },
        {
            id: 2,
            name: "Phòng Superior",
            price: "700.000",
            image: "/hotel-bedroom.png",
            size: "30m²",
            bed: "1 giường King",
            guests: "2-3 người",
            amenities: ["Wifi miễn phí", "Máy lạnh", "TV màn hình phẳng", "Minibar", "Ban công"],
        },
        {
            id: 3,
            name: "Phòng Suite",
            price: "1.200.000",
            image: "/elegant-hotel-lobby.png",
            size: "45m²",
            bed: "1 giường King + Sofa",
            guests: "3-4 người",
            amenities: ["Wifi miễn phí", "Máy lạnh", "TV màn hình phẳng", "Minibar", "Ban công", "Bồn tắm"],
        },
    ]

    return (
        <section id="rooms" className="hotel-detail-content-section rooms-section">
            <div className="hotel-detail-section-header">
                <h2 className="hotel-detail-section-title">Các Loại Phòng</h2>
                <p className="hotel-detail-section-description">Lựa chọn phòng phù hợp với nhu cầu của bạn</p>
            </div>

            <div className="hotel-detail-rooms-grid">
                {rooms.map((room) => (
                    <div key={room.id} className="room-card">
                        <div className="room-image">
                            <img src={room.image || "/placeholder.svg"} alt={room.name} />
                            <div className="room-badge">Phổ biến</div>
                        </div>
                        <div className="room-content">
                            <h3 className="room-name">{room.name}</h3>
                            <div className="room-details">
                                <div className="room-detail-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="3" y1="9" x2="21" y2="9"></line>
                                    </svg>
                                    <span>{room.size}</span>
                                </div>
                                <div className="room-detail-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M2 4v16"></path>
                                        <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                                        <path d="M2 17h20"></path>
                                        <path d="M6 8v9"></path>
                                    </svg>
                                    <span>{room.bed}</span>
                                </div>
                                <div className="room-detail-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    <span>{room.guests}</span>
                                </div>
                            </div>
                            <div className="room-amenities">
                                {room.amenities.map((amenity, index) => (
                                    <span key={index} className="amenity-tag">
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                            <div className="room-footer">
                                <div className="room-price">
                                    <span className="price-amount">{room.price}</span>
                                    <span className="price-unit">VNĐ/đêm</span>
                                </div>
                                <button className="room-book-btn">Đặt ngay</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
