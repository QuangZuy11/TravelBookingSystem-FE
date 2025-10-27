/**
 * OpenStreetMap Configuration (Leaflet)
 * 
 * OpenStreetMap là giải pháp bản đồ mã nguồn mở, MIỄN PHÍ 100%
 * - Không cần API key
 * - Không giới hạn số lượng request
 * - Sử dụng thư viện Leaflet
 */

export const MAP_CONFIG = {
    // OpenStreetMap tile layer URL
    TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    
    // Attribution (bắt buộc theo license OSM)
    ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    
    // Alternative tile layers (có thể thay đổi)
    ALTERNATIVE_LAYERS: {
        // Màu sắc đẹp hơn, phù hợp với UI hiện đại
        CARTODB_POSITRON: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        // Tối ưu cho di động
        CARTODB_VOYAGER: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        // Màu tối (dark mode)
        CARTODB_DARK: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    },
    
    // Default center (TP.HCM)
    DEFAULT_CENTER: {
        latitude: 10.8231,
        longitude: 106.6297
    },
    
    // Default zoom level
    DEFAULT_ZOOM: 15,
    
    // Max zoom
    MAX_ZOOM: 19,
    
    // Marker colors
    COLORS: {
        HOTEL: '#0a5757',
        POI: '#10b981'
    },
    
    // Marker icons (SVG)
    ICONS: {
        HOTEL: {
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAzMCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIxMiIgZmlsbD0iIzBhNTc1NyIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNMTUgMjhMMTAgMzVIMjBMMTUgMjhaIiBmaWxsPSIjMGE1NzU3Ii8+PHRleHQgeD0iMTUiIHk9IjIwIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn48oPC90ZXh0Pjwvc3ZnPg==',
            iconSize: [30, 40],
            iconAnchor: [15, 40],
            popupAnchor: [0, -40]
        },
        POI: {
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAyNCAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI5IiBmaWxsPSIjMTBiOTgxIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0xMiAyMkw4IDI4SDE2TDEyIDIyWiIgZmlsbD0iIzEwYjk4MSIvPjx0ZXh0IHg9IjEyIiB5PSIxNyIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+TjTwvdGV4dD48L3N2Zz4=',
            iconSize: [24, 32],
            iconAnchor: [12, 32],
            popupAnchor: [0, -32]
        }
    }
};

// No need for API key validation with OSM
export const isValidMapConfig = () => {
    return true; // Always valid for OpenStreetMap
};

