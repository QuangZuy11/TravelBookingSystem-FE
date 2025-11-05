import { getProxiedGoogleDriveUrl } from '../../../../../utils/googleDriveImageHelper';
import { formatOpeningHours } from '../../../../../utils/scheduleHelper';
import './HotelDetail.css';

// Helper function for category icons
const getCategoryIcon = (category) => {
    const icons = {
        'attraction': '🎡',
        'restaurant': '🍽️',
        'beach': '🏖️',
        'museum': '🏛️',
        'park': '🌳',
        'shopping': '🛍️',
        'temple': '⛩️',
        'market': '🏪',
        'cafe': '☕',
        'bar': '🍺',
        'nightlife': '🎭',
        'spa': '💆',
        'gym': '💪',
        'cinema': '🎬'
    };
    return icons[category] || '📍';
};

// Helper function to format price
const formatPrice = (price) => {
    if (!price) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
};

// POI Card Component
const POICard = ({ poi }) => {
    return (
        <div className="poi-card">
            {/* POI Image */}
            <div className="poi-image">
                <img
                    src={poi.images && poi.images.length > 0
                        ? getProxiedGoogleDriveUrl(poi.images[0])
                        : '/placeholder.svg'}
                    alt={poi.name}
                />

                {/* Category Badge */}
                <span className="category-badge">
                    {getCategoryIcon(poi.category)} {poi.category}
                </span>

                {/* Rating Badge */}
                {poi.rating && (
                    <div className="poi-rating-badge">
                        ⭐ {poi.rating}
                    </div>
                )}
            </div>

            {/* POI Info */}
            <div className="poi-info">
                <h3>{poi.name}</h3>
                <p className="poi-description">{poi.description}</p>

                {/* Details */}
                <div className="poi-details">
                    {/* Opening Hours */}
                    {poi.opening_hours && (
                        <div className="poi-detail-item">
                            <span className="detail-icon">🕐</span>
                            <span>Giờ mở cửa: {formatOpeningHours(poi.opening_hours)}</span>
                        </div>
                    )}

                    {/* Entry Fee */}
                    {poi.entry_fee && (
                        <div className="poi-detail-item">
                            <span className="detail-icon">💵</span>
                            <span>
                                Vé: {formatPrice(poi.entry_fee.adult)}
                                {poi.entry_fee.child && poi.entry_fee.child !== poi.entry_fee.adult && (
                                    <span className="child-price"> (Trẻ em: {formatPrice(poi.entry_fee.child)})</span>
                                )}
                            </span>
                        </div>
                    )}

                    {/* Location */}
                    {poi.location && poi.location.address && (
                        <div className="poi-detail-item">
                            <span className="detail-icon">📍</span>
                            <span className="poi-address">{poi.location.address}</span>
                        </div>
                    )}
                </div>

                {/* View Details Button */}
                <button
                    onClick={() => {
                        // Navigate to POI detail page (if exists)
                        // Or open in new tab
                        if (poi._id) {
                            window.location.href = `/poi/${poi._id}`;
                        }
                    }}
                    className="view-details-btn"
                >
                    Xem chi tiết
                </button>
            </div>
        </div>
    );
};

// Main Nearby POIs Section Component
const NearbyPOIsSection = ({ pois, destination }) => {
    if (!pois || pois.length === 0) {
        return null; // Don't render if no POIs
    }

    return (
        <section id="nearby-pois" className="hotel-detail-content-section nearby-pois-section">
            <div className="hotel-detail-section-header">
                <h2 className="hotel-detail-section-title">
                    🗺️ Địa điểm gần khách sạn
                </h2>
                {destination && (
                    <p className="hotel-detail-section-description destination-subtitle">
                        Khám phá {destination.name}, {destination.country}
                    </p>
                )}
            </div>

            <div className="poi-grid">
                {pois.map((poi) => (
                    <POICard key={poi._id} poi={poi} />
                ))}
            </div>
        </section>
    );
};

export default NearbyPOIsSection;
