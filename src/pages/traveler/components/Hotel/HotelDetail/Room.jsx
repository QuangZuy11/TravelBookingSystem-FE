import './HotelDetail.css';

export default function Rooms({ roomsData, loading, error }) {
    // Debug log để kiểm tra dữ liệu nhận được
    console.log('Rooms component received:', { roomsData, loading, error });

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const getBedType = (type) => {
        // Fix cứng theo yêu cầu: type single = "1 giường đôi"
        if (type === 'single') return '1 giường đôi';
        if (type === 'double') return '2 giường đôi';
        if (type === 'suite') return '1 giường King + Sofa';
        return '1 giường đôi';
    };

    const getRoomTypeName = (type) => {
        if (type === 'single') return 'Phòng Đơn';
        if (type === 'double') return 'Phòng Đôi';
        if (type === 'suite') return 'Phòng Suite';
        return 'Phòng Tiêu Chuẩn';
    };

    const translateAmenity = (amenity) => {
        const translations = {
            'Wi-Fi': 'Wifi miễn phí',
            'TV': 'TV',
            'Air Conditioning': 'Điều hòa',
            'Mini Bar': 'Minibar',
            'Balcony': 'Ban công',
            'Safe Box': 'Safe Box',
            'Pool': 'Hồ bơi',
            'Spa': 'Spa',
            'Gym': 'Phòng tập gym',
            'Restaurant': 'Nhà hàng',
            'Room Service': 'Dịch vụ phòng',
            'Business Center': 'Trung tâm thương mại'
        };
        return translations[amenity] || amenity;
    };

    if (loading) {
        return (
            <section id="rooms" className="hotel-detail-content-section rooms-section">
                <div className="hotel-detail-section-header">
                    <h2 className="hotel-detail-section-title">Các Loại Phòng</h2>
                    <p className="hotel-detail-section-description">Đang tải dữ liệu phòng...</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Loading: {loading ? 'true' : 'false'}</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="rooms" className="hotel-detail-content-section rooms-section">
                <div className="hotel-detail-section-header">
                    <h2 className="hotel-detail-section-title">Các Loại Phòng</h2>
                    <p className="hotel-detail-section-description" style={{ color: 'red' }}>{error}</p>
                </div>
            </section>
        );
    }

    if (!roomsData || !roomsData.roomsByType) {
        return (
            <section id="rooms" className="hotel-detail-content-section rooms-section">
                <div className="hotel-detail-section-header">
                    <h2 className="hotel-detail-section-title">Các Loại Phòng</h2>
                    <p className="hotel-detail-section-description">Không có dữ liệu phòng</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                        Debug - roomsData: {roomsData ? 'có dữ liệu' : 'null'},
                        roomsByType: {roomsData?.roomsByType ? 'có' : 'không có'}
                    </p>
                    <pre style={{ fontSize: '10px', background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                        {JSON.stringify(roomsData, null, 2)}
                    </pre>
                </div>
            </section>
        );
    }

    // Chuyển đổi dữ liệu từ backend thành format hiển thị
    const rooms = Object.values(roomsData.roomsByType).map((roomType) => {
        // Lấy phòng đầu tiên làm mẫu để hiển thị thông tin
        const sampleRoom = roomType.rooms[0];

        return {
            id: roomType.type,
            name: getRoomTypeName(roomType.type),
            price: formatPrice(roomType.avgPrice),
            image: sampleRoom?.images?.[0] || "/placeholder.svg",
            size: `${sampleRoom?.area || 25}m²`,
            bed: getBedType(roomType.type),
            guests: `${roomType.avgCapacity} người`,
            amenities: sampleRoom?.amenities?.map(translateAmenity) || [],
            availableCount: roomType.availableCount, // Số lượng phòng trống
            totalCount: roomType.count // Tổng số phòng
        };
    });

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
                            <div className="room-badge">
                                {room.availableCount > 0
                                    ? `${room.availableCount} phòng trống`
                                    : 'Hết phòng'
                                }
                            </div>
                        </div>
                        <div className="room-content">
                            <h3 className="room-name">
                                {room.name}
                                <span className="room-availability">
                                    ({room.availableCount}/{room.totalCount} phòng)
                                </span>
                            </h3>
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
                                <button
                                    className="room-book-btn"
                                    disabled={room.availableCount === 0}
                                    style={{
                                        opacity: room.availableCount === 0 ? 0.5 : 1,
                                        cursor: room.availableCount === 0 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {room.availableCount > 0 ? 'Đặt ngay' : 'Hết phòng'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
