/**
 * POI (Point of Interest) Service
 * API: GET /api/poi/destination/:destination_id
 */

import apiClient from '../config/apiClient';

const POI_BASE = '/poi';

/**
 * Get POIs by Destination
 * @param {string} destinationId - Destination ObjectId (NOT destination name)
 * @returns {Promise} Response with array of POIs
 * 
 * Example:
 * const response = await getPOIsByDestination('507f1f77bcf86cd799439011');
 * // Returns: { data: [{ _id, name, category, description, address, ... }] }
 */
export const getPOIsByDestination = async (destinationId) => {
    try {
        const response = await apiClient.get(`${POI_BASE}/destination/${destinationId}`);
        return response.data;
    } catch (error) {
        console.error('❌ Get POIs Error:', error);
        throw {
            message: error.response?.data?.message || 'Failed to fetch POIs',
            error: error.response?.data?.error || error.message,
            status: error.response?.status
        };
    }
};

/**
 * Get Single POI by ID
 * @param {string} poiId - POI ObjectId
 * @returns {Promise} Response with POI details
 */
export const getPOIById = async (poiId) => {
    try {
        const response = await apiClient.get(`${POI_BASE}/${poiId}`);
        return response.data;
    } catch (error) {
        console.error('❌ Get POI Error:', error);
        throw {
            message: error.response?.data?.message || 'Failed to fetch POI',
            error: error.response?.data?.error || error.message,
            status: error.response?.status
        };
    }
};

export default {
    getPOIsByDestination,
    getPOIById
};
