import { useMemo } from 'react';

export default function Reviews({ hotelData }) {
    // Get reviews from hotelData
    const reviews = useMemo(() => {
        if (!hotelData?.reviews || !Array.isArray(hotelData.reviews)) {
            return [];
        }

        return hotelData.reviews
            .filter(review => review.comment && review.rating)
            .map(review => ({
                id: review._id || review.userId?._id,
                name: review.userId?.name || 'Khách hàng',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userId?.name || 'Guest')}&background=2d6a4f&color=fff`,
                rating: review.rating || 0,
                date: review.date ? new Date(review.date).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
                comment: review.comment || '',
                helpful: 0, // Backend doesn't have helpful count yet
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first
    }, [hotelData]);

    // Calculate rating statistics
    const ratingStats = useMemo(() => {
        const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
            if (review.rating >= 1 && review.rating <= 5) {
                stats[review.rating]++;
            }
        });

        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;

        return {
            stats: [5, 4, 3, 2, 1].map(stars => ({
                stars,
                count: stats[stars],
                percentage: totalReviews > 0 ? Math.round((stats[stars] / totalReviews) * 100) : 0
            })),
            avgRating: avgRating.toFixed(1),
            totalReviews
        };
    }, [reviews]);

    return (
        <section id="reviews" className="hotel-detail-content-section reviews-section">
            <div className="hotel-detail-section-header">
                <h2 className="hotel-detail-section-title">Đánh Giá Từ Khách Hàng</h2>
                <p className="hotel-detail-section-description">Xem những trải nghiệm thực tế từ khách đã lưu trú</p>
            </div>

            <div className="hotel-detail-reviews-container">
                <div className="hotel-detail-reviews-summary">
                    <div className="hotel-detail-overall-rating">
                        <div className="hotel-detail-rating-score">{ratingStats.avgRating}</div>
                        <div className="hotel-detail-rating-info">
                            <div className="hotel-detail-rating-stars">
                                {'★'.repeat(Math.round(parseFloat(ratingStats.avgRating)))}
                                {'☆'.repeat(5 - Math.round(parseFloat(ratingStats.avgRating)))}
                            </div>
                            <div className="hotel-detail-rating-text">
                                {parseFloat(ratingStats.avgRating) >= 4.5 ? 'Xuất sắc' :
                                    parseFloat(ratingStats.avgRating) >= 4 ? 'Rất tốt' :
                                        parseFloat(ratingStats.avgRating) >= 3.5 ? 'Tốt' :
                                            parseFloat(ratingStats.avgRating) >= 3 ? 'Khá tốt' :
                                                parseFloat(ratingStats.avgRating) >= 2 ? 'Trung bình' : 'Cần cải thiện'}
                            </div>
                            <div className="hotel-detail-rating-count">Dựa trên {ratingStats.totalReviews} đánh giá</div>
                        </div>
                    </div>

                    <div className="hotel-detail-rating-breakdown">
                        {ratingStats.stats.map((stat) => (
                            <div key={stat.stars} className="hotel-detail-rating-bar-item">
                                <span className="hotel-detail-rating-label">{stat.stars} sao</span>
                                <div className="hotel-detail-rating-bar">
                                    <div className="hotel-detail-rating-bar-fill" style={{ width: `${stat.percentage}%` }}></div>
                                </div>
                                <span className="hotel-detail-rating-count">{stat.count}</span>
                            </div>
                        ))}
                    </div>


                </div>

                <div className="hotel-detail-reviews-list">
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
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
                                {review.helpful > 0 && (
                                    <div className="hotel-detail-review-footer">
                                        <button className="hotel-detail-helpful-btn">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                                            </svg>
                                            Hữu ích ({review.helpful})
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            <p>Chưa có đánh giá nào cho khách sạn này.</p>
                            <p style={{ fontSize: '14px', marginTop: '8px' }}>Hãy là người đầu tiên đánh giá!</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
