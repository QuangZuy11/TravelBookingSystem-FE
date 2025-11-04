// import { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG } from '../../../../../config/mapConfig';

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

    // Get hotel coordinates or use default
    const coordinates = hotelData?.address?.coordinates || MAP_CONFIG.DEFAULT_CENTER;
    const center = [coordinates.latitude, coordinates.longitude];

    // Fallback hardcoded data nếu không có POIs từ backend
    const defaultPlaces = [
        { name: "Hồ Hoàn Kiếm", distance: "500m", time: "5 phút đi bộ", type: "Địa danh" },
        { name: "Phố Cổ Hà Nội", distance: "800m", time: "10 phút đi bộ", type: "Khu phố" },
        { name: "Nhà Hát Lớn", distance: "1.2km", time: "15 phút đi bộ", type: "Văn hóa" },
        { name: "Chợ Đồng Xuân", distance: "1.5km", time: "5 phút lái xe", type: "Mua sắm" },
        { name: "Văn Miếu Quốc Tử Giám", distance: "3km", time: "10 phút lái xe", type: "Di tích" },
        { name: "Sân bay Nội Bài", distance: "25km", time: "35 phút lái xe", type: "Sân bay" },
    ];

    // Use POIs from backend if available, otherwise use default
    const displayPlaces = nearbyPOIs && nearbyPOIs.length > 0
        ? nearbyPOIs.map(poi => {
            const categoryInfo = getCategoryInfo(poi.category);
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
                opening_hours: poi.opening_hours
            };
        })
        : defaultPlaces.map(place => ({ ...place, icon: '📍' }));

    // Get hotel address for display
    const hotelAddress = hotelData?.address
        ? `${hotelData.address.street ? hotelData.address.street + ', ' : ''}${hotelData.address.city}, ${hotelData.address.country}`
        : '123 Đường ABC, Quận XYZ, Thành phố Hà Nội';

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
                            if (poi.location && poi.location.coordinates) {
                                const categoryInfo = getCategoryInfo(poi.category);
                                const poiPosition = [
                                    poi.location.coordinates.latitude,
                                    poi.location.coordinates.longitude
                                ];

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
                            }
                            return null;
                        })}
                    </MapContainer>

                    <div className="hotel-detail-address-card">
                        <h4>Địa chỉ khách sạn</h4>
                        <p>{hotelAddress}</p>
                        <button
                            className="hotel-detail-direction-btn"
                            onClick={() => {
                                const coords = hotelData?.address?.coordinates;
                                if (coords) {
                                    // Open in OpenStreetMap directions
                                    window.open(
                                        `https://www.openstreetmap.org/directions?from=&to=${coords.latitude},${coords.longitude}`,
                                        '_blank'
                                    );
                                }
                            }}
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
                                            🕐 {place.opening_hours}
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
