export default function Policies({ hotelData }) {
    // Debug log để kiểm tra dữ liệu
    console.log('Policies component received hotelData:', hotelData);

    // Function để format payment options
    const formatPaymentOptions = (paymentOptions) => {
        if (!paymentOptions || paymentOptions.length === 0) {
            return "Tiền mặt, Thẻ tín dụng, Chuyển khoản";
        }

        const translations = {
            "Cash": "Tiền mặt",
            "Credit Card": "Thẻ tín dụng",
            "Debit Card": "Thẻ ghi nợ",
            "Bank Transfer": "Chuyển khoản",
            "Online Payment": "Thanh toán online"
        };

        return paymentOptions.map(option => translations[option] || option).join(", ");
    };

    // Tạo dữ liệu policies từ hotelData API
    const createPoliciesFromHotelData = (hotelData) => {
        const policies = hotelData?.policies;

        return [
            {
                title: "Giờ nhận & trả phòng",
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                ),
                items: [
                    { label: "Nhận phòng", value: `Từ ${policies?.checkInTime || "14:00"}` },
                    { label: "Trả phòng", value: `Trước ${policies?.checkOutTime || "12:00"}` },
                    { label: "Nhận phòng sớm", value: "Có thể yêu cầu (phụ thu)" },
                    { label: "Trả phòng muộn", value: "Có thể yêu cầu (phụ thu)" },
                ],
            },
            {
                title: "Chính sách hủy phòng",
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                ),
                items: [
                    { label: "Hủy miễn phí", value: policies?.cancellationPolicy || "Trước 48 giờ" },

                    { label: "Không đến", value: "Phí 100% giá phòng" },
                ],
            },
            {
                title: "Thanh toán",
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                ),
                items: [
                    { label: "Phương thức", value: formatPaymentOptions(policies?.paymentOptions) },
                    { label: "Đặt cọc", value: "Không yêu cầu" },
                    { label: "Thanh toán", value: "Thanh toán online " },
                    { label: "Thuế VAT", value: "Đã bao gồm trong giá" },
                ],
            },
            {
                title: "Quy định chung",
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                ),
                items: [
                    { label: "Trẻ em", value: "Chấp nhận mọi lứa tuổi" },
                    { label: "Thú cưng", value: policies?.petsAllowed ? "Cho phép" : "Không cho phép" },
                    { label: "Hút thuốc", value: "Chỉ ở khu vực quy định" },
                    { label: "Tiệc tùng", value: "Không cho phép" },
                ],
            },
            {
                title: "Giấy tờ cần thiết",
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                ),
                items: [
                    { label: "CMND/CCCD", value: "Bắt buộc" },
                    { label: "Hộ chiếu", value: "Đối với khách nước ngoài" },
                    { label: "Giấy khai báo", value: "Điền tại quầy lễ tân" },
                    { label: "Xác nhận đặt phòng", value: "Email hoặc SMS" },
                ],
            },
        ];
    };

    // Lấy dữ liệu policies từ hotelData hoặc sử dụng default nếu không có dữ liệu
    const policies = hotelData ? createPoliciesFromHotelData(hotelData) : [];

    // Xử lý trường hợp không có dữ liệu
    if (!hotelData) {
        return (
            <section id="policies" className="hotel-detail-content-section policies-section">
                <div className="hotel-detail-section-header">
                    <h2 className="hotel-detail-section-title">Chính Sách Khách Sạn</h2>
                    <p className="hotel-detail-section-description">Đang tải thông tin chính sách...</p>
                </div>
            </section>
        );
    }

    return (
        <section id="policies" className="hotel-detail-content-section policies-section">
            <div className="hotel-detail-section-header">
                <h2 className="hotel-detail-section-title">Chính Sách Khách Sạn</h2>
                <p className="hotel-detail-section-description">Vui lòng đọc kỹ các chính sách trước khi đặt phòng</p>
            </div>

            <div className="hotel-detail-policies-grid">
                {policies.map((policy, index) => (
                    <div key={index} className="hotel-detail-policy-card">
                        <div className="hotel-detail-policy-header">
                            <div className="hotel-detail-policy-icon">{policy.icon}</div>
                            <h3 className="hotel-detail-policy-title">{policy.title}</h3>
                        </div>
                        <div className="hotel-detail-policy-content">
                            {policy.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="hotel-detail-policy-item">
                                    <span className="hotel-detail-policy-label">{item.label}:</span>
                                    <span className="hotel-detail-policy-value">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
