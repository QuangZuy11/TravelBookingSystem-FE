export default function Amenities() {
    const amenityCategories = [
        {
            title: "Tiện nghi phòng",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 4v16"></path>
                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                    <path d="M2 17h20"></path>
                    <path d="M6 8v9"></path>
                </svg>
            ),
            items: ["Máy lạnh", "TV màn hình phẳng", "Minibar", "Két an toàn", "Bàn làm việc", "Tủ quần áo"],
        },
        {
            title: "Phòng tắm",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
                    <line x1="10" y1="5" x2="8" y2="7"></line>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <line x1="7" y1="19" x2="7" y2="21"></line>
                    <line x1="17" y1="19" x2="17" y2="21"></line>
                </svg>
            ),
            items: ["Vòi sen", "Bồn tắm", "Máy sấy tóc", "Đồ vệ sinh cá nhân", "Khăn tắm", "Dép đi trong phòng"],
        },
        {
            title: "Dịch vụ",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            ),
            items: ["Lễ tân 24/7", "Dọn phòng hàng ngày", "Giặt ủi", "Đưa đón sân bay", "Hỗ trợ du lịch", "Đặt tour"],
        },
        {
            title: "Ăn uống",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                </svg>
            ),
            items: ["Nhà hàng", "Quầy bar", "Phục vụ phòng", "Bữa sáng buffet", "Cafe", "Khu vực BBQ"],
        },
        {
            title: "Giải trí & Thư giãn",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
            ),
            items: ["Hồ bơi ngoài trời", "Phòng gym", "Spa & Massage", "Sauna", "Sân tennis", "Khu vui chơi trẻ em"],
        },
        {
            title: "Kết nối",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                    <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                    <circle cx="12" cy="20" r="1"></circle>
                </svg>
            ),
            items: ["Wifi miễn phí", "Trung tâm doanh nhân", "Phòng họp", "Dịch vụ fax/photocopy", "Máy tính", "Máy in"],
        },
    ]

    return (
        <section id="amenities" className="hotel-detail-content-section amenities-section">
            <div className="hotel-detail-section-header">
                <h2 className="hotel-detail-section-title">Tiện Ích & Dịch Vụ</h2>
                <p className="hotel-detail-section-description">Tất cả những gì bạn cần cho một kỳ nghỉ hoàn hảo</p>
            </div>

            <div className="hotel-detail-amenities-grid">
                {amenityCategories.map((category, index) => (
                    <div key={index} className="hotel-detail-amenity-category">
                        <div className="hotel-detail-category-header">
                            <div className="hotel-detail-category-icon">{category.icon}</div>
                            <h3 className="hotel-detail-category-title">{category.title}</h3>
                        </div>
                        <ul className="hotel-detail-category-items">
                            {category.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="hotel-detail-category-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    )
}
