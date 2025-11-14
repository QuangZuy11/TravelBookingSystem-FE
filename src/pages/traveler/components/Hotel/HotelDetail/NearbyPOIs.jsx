import './HotelDetail.css';

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

// Format distance for display
const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return 'Đang cập nhật';
    if (distance < 1) {
        return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
};

// POI Card Component - Simplified: chỉ hiển thị tên + khoảng cách
const POICard = ({ poi, hotelCoordinates }) => {
    // Calculate distance if coordinates available
    let distance = null;
    if (hotelCoordinates && poi.location?.coordinates) {
        const poiLat = poi.location.coordinates.latitude || poi.location.coordinates.lat;
        const poiLon = poi.location.coordinates.longitude || poi.location.coordinates.lng;
        const hotelLat = hotelCoordinates.latitude || hotelCoordinates.lat;
        const hotelLon = hotelCoordinates.longitude || hotelCoordinates.lng;

        if (poiLat && poiLon && hotelLat && hotelLon) {
            distance = calculateDistance(hotelLat, hotelLon, poiLat, poiLon);
        }
    }

    return (
        <div className="poi-card-simple">
            <div className="poi-card-content">
                <div className="poi-name-section">
                    <h3 className="poi-name">{poi.name}</h3>
                </div>
                <div className="poi-distance-section">
                    <span className="poi-distance-icon">📍</span>
                    <span className="poi-distance-text">{formatDistance(distance)}</span>
                </div>
            </div>
        </div>
    );
};

// Main Nearby POIs Section Component
const NearbyPOIsSection = ({ pois, destination, hotelCoordinates }) => {
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

            <div className="poi-grid-simple">
                {pois.map((poi) => (
                    <POICard
                        key={poi._id || poi.name}
                        poi={poi}
                        hotelCoordinates={hotelCoordinates}
                    />
                ))}
            </div>
        </section>
    );
};

export default NearbyPOIsSection;
