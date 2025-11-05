// import { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG } from '../../../../../config/mapConfig';
import { formatOpeningHours } from '../../../../../utils/scheduleHelper';

// Helper function for category icons and names
const getCategoryInfo = (category) => {
    const categoryMap = {
        'attraction': { icon: '🎡', name: 'Địa danh' },
        'restaurant': { icon: '🍽️', name: 'Nhà hàng' },
        'beach': { icon: '🏖️', name: 'Bãi biển' },
        'museum': { icon: '🏛️', name: 'Bảo tàng' },
        'park': { icon: '🌳', name: 'Công viên' },
        'shopping': { icon: '🛍️', name: 'Mua sắm' },
        'temple': { icon: '⛩️', name: 'Đền chùa' },
        'market': { icon: '🏪', name: 'Chợ' },
        'cafe': { icon: '☕', name: 'Quán cà phê' },
        'bar': { icon: '🍺', name: 'Quầy bar' },
        'nightlife': { icon: '🎭', name: 'Giải trí' },
        'spa': { icon: '💆', name: 'Spa' },
        'gym': { icon: '💪', name: 'Phòng gym' },
        'cinema': { icon: '🎬', name: 'Rạp phim' }
    };
    return categoryMap[category] || { icon: '📍', name: 'Địa điểm' };
};

// Create custom Leaflet icons
const createHotelIcon = () => {
    return L.divIcon({
        className: 'custom-hotel-marker',
        html: `
            <div style="
                background: ${MAP_CONFIG.COLORS.HOTEL};
                width: 32px;
                height: 32px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <span style="
                    transform: rotate(45deg);
                    font-size: 18px;
                    display: block;
                    margin-top: -4px;
                    margin-left: -2px;
                ">🏨</span>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

const createPOIIcon = (emoji = '📍') => {
    return L.divIcon({
        className: 'custom-poi-marker',
        html: `
            <div style="
                background: ${MAP_CONFIG.COLORS.POI};
                width: 26px;
                height: 26px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 2px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <span style="
                    transform: rotate(45deg);
                    font-size: 14px;
                    display: block;
                    margin-top: -3px;
                    margin-left: -1px;
                ">${emoji}</span>
            </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
        popupAnchor: [0, -26]
    });
};

export default function Location({ hotelData, nearbyPOIs, destination }) {
    // const mapRef = useRef(null);

    // Default coordinates for Ho Chi Minh City center
    const DEFAULT_LAT = 10.7756587;
    const DEFAULT_LNG = 106.7004238;

    // Get and validate coordinates
    const coordinates = hotelData?.address?.coordinates;
    const hasValidCoordinates = coordinates &&
        typeof coordinates.latitude === 'number' &&
        typeof coordinates.longitude === 'number' &&
        !isNaN(coordinates.latitude) &&
        !isNaN(coordinates.longitude);

    // Set center coordinates for the map
    const center = [
        hasValidCoordinates ? coordinates.latitude : DEFAULT_LAT,
        hasValidCoordinates ? coordinates.longitude : DEFAULT_LNG
    ];

    // Format complete address
    const formatAddress = (address) => {
        if (!address) return '';

        const parts = [];
        if (address.street) parts.push(address.street);
        if (address.state) parts.push(address.state);
        if (address.city) parts.push(address.city);
        if (address.country) parts.push(address.country);
        if (address.zipCode) parts.push(address.zipCode);

        return parts.join(', ');
    };

    // Calculate POI coordinates based on hotel location
    const getPoiCoordinates = (index, totalPois) => {
        // Get hotel coordinates or use default HCMC coordinates
        const baseLatitude = coordinates?.latitude || 10.7756587;
        const baseLongitude = coordinates?.longitude || 106.7004238;

        // Create a circular pattern around the hotel
        const radius = 0.01; // Roughly 1km
        const angle = (360 / totalPois) * index * (Math.PI / 180);

        return {
            latitude: baseLatitude + radius * Math.cos(angle),
            longitude: baseLongitude + radius * Math.sin(angle)
        };
    };

    // Use POIs from backend if available, otherwise use default
    const displayPlaces = nearbyPOIs && nearbyPOIs.length > 0
        ? nearbyPOIs.map((poi, index) => {
            const categoryInfo = getCategoryInfo(poi.category);
            // Add coordinates if not provided
            if (!poi.location?.coordinates?.latitude) {
                poi.location = {
                    ...poi.location,
                    coordinates: getPoiCoordinates(index, nearbyPOIs.length)
                };
            }
            return {
                id: poi._id,
                name: poi.name,
                distance: "N/A", // Backend chưa có distance calculation
                time: "Đang cập nhật",
                type: categoryInfo.name,
                icon: categoryInfo.icon,
                rating: poi.rating,
                description: poi.description,
                image: poi.images && poi.images.length > 0 ? poi.images[0] : null,
                entry_fee: poi.entry_fee,
                opening_hours: poi.opening_hours,
                location: poi.location
            };
        })
        : [];

    // Get hotel address for display
    const hotelAddress = hotelData?.address ? formatAddress(hotelData.address) : 'Chưa có địa chỉ';

    return (
        <section id="location" className="hotel-detail-content-section location-section">
            <div className="hotel-detail-section-header">
                <h2 className="hotel-detail-section-title">
                    Địa Điểm Gần Khách Sạn
                </h2>
                {destination ? (
                    <p className="hotel-detail-section-description">
                        Khám phá {destination.name}, {destination.country}
                    </p>
                ) : (
                    <p className="hotel-detail-section-description">
                        Khám phá những địa điểm gần khách sạn
                    </p>
                )}
            </div>

            <div className="hotel-detail-location-content">
                <div className="hotel-detail-map-container">
                    {/* OpenStreetMap with Leaflet */}
                    <MapContainer
                        center={center}
                        zoom={MAP_CONFIG.DEFAULT_ZOOM}
                        style={{
                            width: '100%',
                            height: '400px',
                            borderRadius: '12px',
                            zIndex: 1
                        }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution={MAP_CONFIG.ATTRIBUTION}
                            url={MAP_CONFIG.ALTERNATIVE_LAYERS.CARTODB_VOYAGER}
                            maxZoom={MAP_CONFIG.MAX_ZOOM}
                        />

                        {/* Hotel Marker */}
                        <Marker
                            position={center}
                            icon={createHotelIcon()}
                        >
                            <Popup>
                                <div style={{ minWidth: '200px' }}>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                                        🏨 {hotelData?.name || 'Khách sạn'}
                                    </h3>
                                    <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>
                                        {hotelAddress}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>

                        {/* POI Markers */}
                        {nearbyPOIs && nearbyPOIs.length > 0 && nearbyPOIs.map((poi, index) => {
                            // Calculate POI position
                            const radius = 0.005; // Roughly 500m
                            const angle = (360 / nearbyPOIs.length) * index * (Math.PI / 180);
                            const poiPosition = [
                                center[0] + radius * Math.cos(angle),
                                center[1] + radius * Math.sin(angle)
                            ];
                            const categoryInfo = getCategoryInfo(poi.category);

                            return (
                                <Marker
                                    key={poi._id || index}
                                    position={poiPosition}
                                    icon={createPOIIcon(categoryInfo.icon)}
                                >
                                    <Popup>
                                        <div style={{ minWidth: '200px' }}>
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '600' }}>
                                                {categoryInfo.icon} {poi.name}
                                            </h4>
                                            <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#10b981' }}>
                                                {categoryInfo.name}
                                            </p>
                                            {poi.rating && (
                                                <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#f59e0b' }}>
                                                    ⭐ {poi.rating}
                                                </p>
                                            )}
                                            {poi.description && (
                                                <p style={{ margin: '0', fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                                                    {poi.description.substring(0, 100)}...
                                                </p>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>

                    <div className="hotel-detail-address-card">
                        <h4>Địa chỉ khách sạn</h4>
                        <p>{hotelAddress}</p>
                        <button
                            className="hotel-detail-direction-btn"
                            onClick={() => {
                                if (hasValidCoordinates) {
                                    // Open in OpenStreetMap directions
                                    window.open(
                                        `https://www.openstreetmap.org/directions?from=&to=${coordinates.latitude},${coordinates.longitude}`,
                                        '_blank'
                                    );
                                }
                            }}
                            disabled={!hasValidCoordinates}
                            title={!hasValidCoordinates ? "Không có thông tin tọa độ" : "Mở chỉ đường"}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                            </svg>
                            Chỉ đường
                        </button>
                    </div>
                </div>

                <div className="hotel-detail-nearby-places">
                    <h3 className="hotel-detail-nearby-title">
                        Địa điểm lân cận
                        {nearbyPOIs && nearbyPOIs.length > 0 && (
                            <span style={{ fontSize: '14px', color: '#10b981', marginLeft: '8px', fontWeight: '500' }}>
                                ({nearbyPOIs.length} địa điểm)
                            </span>
                        )}
                    </h3>
                    {/* Scrollable container */}
                    <div
                        className="hotel-detail-places-list nearby-places-list"
                        style={{
                            maxHeight: '600px',
                            overflowY: 'auto',
                            paddingRight: '8px'
                        }}
                    >
                        {displayPlaces.map((place, index) => (
                            <div
                                key={place.id || index}
                                className="hotel-detail-place-item"
                                style={{
                                    cursor: place.id ? 'pointer' : 'default',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => {
                                    if (place.id) {
                                        window.location.href = `/poi/${place.id}`;
                                    }
                                }}
                                onMouseEnter={(e) => {
                                    if (place.id) {
                                        e.currentTarget.style.backgroundColor = '#f9fafb';
                                        e.currentTarget.style.transform = 'translateX(5px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                            >
                                <div className="hotel-detail-place-icon">
                                    {place.icon ? (
                                        <span style={{ fontSize: '24px' }}>{place.icon}</span>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                    )}
                                </div>
                                <div className="hotel-detail-place-info">
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {place.name}
                                        {place.rating && (
                                            <span style={{
                                                fontSize: '13px',
                                                color: '#f59e0b',
                                                fontWeight: '600',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '2px'
                                            }}>
                                                ⭐ {place.rating}
                                            </span>
                                        )}
                                    </h4>
                                    <div className="hotel-detail-place-meta">
                                        <span className="hotel-detail-place-type">{place.type}</span>
                                        <span className="hotel-detail-place-distance">{place.distance}</span>
                                        <span className="hotel-detail-place-time">{place.time}</span>
                                    </div>
                                    {place.description && (
                                        <p style={{
                                            fontSize: '13px',
                                            color: '#6b7280',
                                            marginTop: '4px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {place.description}
                                        </p>
                                    )}
                                    {place.opening_hours && (
                                        <p style={{
                                            fontSize: '12px',
                                            color: '#059669',
                                            marginTop: '4px'
                                        }}>
                                            🕐 Giờ mở cửa: {formatOpeningHours(place.opening_hours)}
                                        </p>
                                    )}
                                    {place.entry_fee && place.entry_fee.adult && (
                                        <p style={{
                                            fontSize: '12px',
                                            color: '#dc2626',
                                            marginTop: '4px',
                                            fontWeight: '500'
                                        }}>
                                            💵 Vé: {new Intl.NumberFormat('vi-VN').format(place.entry_fee.adult)} VNĐ
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
