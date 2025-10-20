export default function Reviews() {
    const reviews = [
        {
            id: 1,
            name: "Nguyễn Văn A",
            avatar: "https://i.pravatar.cc/150?img=1",
            rating: 5,
            date: "15/01/2025",
            comment:
                "Khách sạn rất tuyệt vời! Phòng sạch sẽ, nhân viên thân thiện. Vị trí thuận tiện gần nhiều địa điểm du lịch. Tôi sẽ quay lại lần sau.",
            helpful: 12,
        },
        {
            id: 2,
            name: "Trần Thị B",
            avatar: "https://i.pravatar.cc/150?img=2",
            rating: 4,
            date: "10/01/2025",
            comment: "Phòng đẹp, view tốt. Bữa sáng ngon. Tuy nhiên wifi hơi yếu. Nhìn chung vẫn đáng giá tiền.",
            helpful: 8,
        },
        {
            id: 3,
            name: "Lê Văn C",
            avatar: "https://i.pravatar.cc/150?img=3",
            rating: 5,
            date: "05/01/2025",
            comment:
                "Trải nghiệm tuyệt vời! Nhân viên nhiệt tình, phòng rộng rãi và sạch sẽ. Hồ bơi đẹp. Rất hài lòng với dịch vụ.",
            helpful: 15,
        },
        {
            id: 4,
            name: "Phạm Thị D",
            avatar: "https://i.pravatar.cc/150?img=4",
            rating: 4,
            date: "28/12/2024",
            comment: "Khách sạn tốt, giá cả hợp lý. Vị trí thuận tiện. Sẽ giới thiệu cho bạn bè.",
            helpful: 6,
        },
    ]

    const ratingStats = [
        { stars: 5, count: 45, percentage: 75 },
        { stars: 4, count: 12, percentage: 20 },
        { stars: 3, count: 2, percentage: 3 },
        { stars: 2, count: 1, percentage: 2 },
        { stars: 1, count: 0, percentage: 0 },
    ]

    return (
        <section id="reviews" className="hotel-detail-content-section reviews-section">
            <div className="hotel-detail-section-header">
                <h2 className="hotel-detail-section-title">Đánh Giá Từ Khách Hàng</h2>
                <p className="hotel-detail-section-description">Xem những trải nghiệm thực tế từ khách đã lưu trú</p>
            </div>

            <div className="hotel-detail-reviews-container">
                <div className="hotel-detail-reviews-summary">
                    <div className="hotel-detail-overall-rating">
                        <div className="hotel-detail-rating-score">8.4</div>
                        <div className="hotel-detail-rating-info">
                            <div className="hotel-detail-rating-stars">★★★★☆</div>
                            <div className="hotel-detail-rating-text">Rất tốt</div>
                            <div className="hotel-detail-rating-count">Dựa trên 60 đánh giá</div>
                        </div>
                    </div>

                    <div className="hotel-detail-rating-breakdown">
                        {ratingStats.map((stat) => (
                            <div key={stat.stars} className="hotel-detail-rating-bar-item">
                                <span className="hotel-detail-rating-label">{stat.stars} sao</span>
                                <div className="hotel-detail-rating-bar">
                                    <div className="hotel-detail-rating-bar-fill" style={{ width: `${stat.percentage}%` }}></div>
                                </div>
                                <span className="hotel-detail-rating-count">{stat.count}</span>
                            </div>
                        ))}
                    </div>

                    <button className="hotel-detail-write-review-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Viết đánh giá
                    </button>
                </div>

                <div className="hotel-detail-reviews-list">
                    {reviews.map((review) => (
                        <div key={review.id} className="hotel-detail-review-card">
                            <div className="hotel-detail-review-header">
                                <img src={review.avatar || "/placeholder.svg"} alt={review.name} className="hotel-detail-reviewer-avatar" />
                                <div className="hotel-detail-reviewer-info">
                                    <h4 className="hotel-detail-reviewer-name">{review.name}</h4>
                                    <div className="hotel-detail-review-meta">
                                        <div className="hotel-detail-review-rating">
                                            {"★".repeat(review.rating)}
                                            {"☆".repeat(5 - review.rating)}
                                        </div>
                                        <span className="hotel-detail-review-date">{review.date}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="hotel-detail-review-comment">{review.comment}</p>
                            <div className="hotel-detail-review-footer">
                                <button className="hotel-detail-helpful-btn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                                    </svg>
                                    Hữu ích ({review.helpful})
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
