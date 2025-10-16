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
        <section id="reviews" className="content-section reviews-section">
            <div className="section-header">
                <h2 className="section-title">Đánh Giá Từ Khách Hàng</h2>
                <p className="section-description">Xem những trải nghiệm thực tế từ khách đã lưu trú</p>
            </div>

            <div className="reviews-container">
                <div className="reviews-summary">
                    <div className="overall-rating">
                        <div className="rating-score">8.4</div>
                        <div className="rating-info">
                            <div className="rating-stars">★★★★☆</div>
                            <div className="rating-text">Rất tốt</div>
                            <div className="rating-count">Dựa trên 60 đánh giá</div>
                        </div>
                    </div>

                    <div className="rating-breakdown">
                        {ratingStats.map((stat) => (
                            <div key={stat.stars} className="rating-bar-item">
                                <span className="rating-label">{stat.stars} sao</span>
                                <div className="rating-bar">
                                    <div className="rating-bar-fill" style={{ width: `${stat.percentage}%` }}></div>
                                </div>
                                <span className="rating-count">{stat.count}</span>
                            </div>
                        ))}
                    </div>

                    <button className="write-review-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Viết đánh giá
                    </button>
                </div>

                <div className="reviews-list">
                    {reviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <img src={review.avatar || "/placeholder.svg"} alt={review.name} className="reviewer-avatar" />
                                <div className="reviewer-info">
                                    <h4 className="reviewer-name">{review.name}</h4>
                                    <div className="review-meta">
                                        <div className="review-rating">
                                            {"★".repeat(review.rating)}
                                            {"☆".repeat(5 - review.rating)}
                                        </div>
                                        <span className="review-date">{review.date}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="review-comment">{review.comment}</p>
                            <div className="review-footer">
                                <button className="helpful-btn">
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
