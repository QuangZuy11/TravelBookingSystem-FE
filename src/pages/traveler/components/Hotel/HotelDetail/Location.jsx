// import { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG } from '../../../../../config/mapConfig';
import { MapPin, Hotel } from 'lucide-react';

// Bỏ helper function getCategoryInfo vì không còn dùng (đã bỏ POI markers trên map)

// Create custom Leaflet icons using lucide-react SVG paths
const createHotelIcon = () => {
    // Hotel icon SVG path (from lucide-react Hotel icon)
    const hotelSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
            <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/>
            <path d="m9 9 3-3 3 3"/>
            <path d="M9 21V9h6v12"/>
        </svg>
    `;

    const iconHTML = `
        <div style="
            background: ${MAP_CONFIG.COLORS.HOTEL || '#10b981'};
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
            <div style="
                transform: rotate(45deg);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                ${hotelSVG}
            </div>
        </div>
    `;

    return L.divIcon({
        className: 'custom-hotel-marker',
        html: iconHTML,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

// Bỏ createPOIIcon vì không còn hiển thị POI markers trên map

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

    // Bỏ getPoiCoordinates vì không còn tạo fake coordinates (chỉ dùng coordinates thật từ backend)

    // Bỏ getPOIPosition vì không còn hiển thị POI markers trên map

    // Use POIs from backend if available, otherwise use default
    const displayPlaces = nearbyPOIs && nearbyPOIs.length > 0
        ? nearbyPOIs.map((poi) => {
            // Lấy coordinates từ POI (ưu tiên coordinates thật)
            const poiCoords = poi.location?.coordinates || {};
            const poiLat = poiCoords.latitude || poiCoords.lat;
            const poiLon = poiCoords.longitude || poiCoords.lng;

            // Calculate distance from hotel to POI (chỉ khi có coordinates thật cho cả hotel và POI)
            let distance = null;
            if (coordinates && poiLat && poiLon) {
                const hotelLat = coordinates.latitude || coordinates.lat;
                const hotelLon = coordinates.longitude || coordinates.lng;

                // Đảm bảo cả hai đều là số hợp lệ
                if (
                    typeof hotelLat === 'number' &&
                    typeof hotelLon === 'number' &&
                    typeof poiLat === 'number' &&
                    typeof poiLon === 'number' &&
                    !isNaN(hotelLat) &&
                    !isNaN(hotelLon) &&
                    !isNaN(poiLat) &&
                    !isNaN(poiLon)
                ) {
                    distance = calculateDistance(hotelLat, hotelLon, poiLat, poiLon);
                }
            }

            return {
                id: poi._id,
                name: poi.name,
                distance: distance,
                formattedDistance: formatDistance(distance),
                location: poi.location,
                hasRealCoordinates: !!(poiLat && poiLon)
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

                        {/* Chỉ hiển thị Hotel marker, không hiển thị POI markers trên map */}
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
                                className="poi-list-item"
                            >
                                <MapPin
                                    size={18}
                                    className="poi-list-icon"
                                    color="#ef4444"
                                    fill="#ef4444"
                                    strokeWidth={2.5}
                                />
                                <span className="poi-list-name">{place.name}</span>
                                {place.formattedDistance && place.formattedDistance !== 'Đang cập nhật' && (
                                    <span className="poi-list-distance">{place.formattedDistance}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
