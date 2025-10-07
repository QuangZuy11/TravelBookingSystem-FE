import apiClient from '../config/apiClient';

class FlightService {
    /**
     * Get all flights for a provider
     * @param {string|number} providerId - Provider ID
     * @param {Object} params - Query parameters (status, flightType, dateRange, search)
     * @returns {Promise<Array>} List of flights
     */
    async getFlights(providerId, params = {}) {
        try {
            const response = await apiClient.get(`/flight/provider/${providerId}/flights`, { params });
            const data = response.data;
            
            // Handle different response structures
            if (data && data.data && Array.isArray(data.data)) {
                return data.data;
            }
            if (Array.isArray(data)) {
                return data;
            }
            if (data && Array.isArray(data.results)) {
                return data.results;
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching flights:', error);
            throw error;
        }
    }

    /**
     * Get a single flight by ID
     * @param {string|number} providerId - Provider ID
     * @param {string|number} flightId - Flight ID
     * @returns {Promise<Object>} Flight details
     */
    async getFlightById(providerId, flightId) {
        try {
            const response = await apiClient.get(`/flight/provider/${providerId}/flights/${flightId}`);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error fetching flight:', error);
            throw error;
        }
    }

    /**
     * Create a new flight
     * @param {string|number} providerId - Provider ID
     * @param {Object} flightData - Flight data
     * @returns {Promise<Object>} Created flight
     */
    async createFlight(providerId, flightData) {
        try {
            const response = await apiClient.post(`/flight/provider/${providerId}/flights`, flightData);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error creating flight:', error);
            throw error;
        }
    }

    /**
     * Update a flight
     * @param {string|number} providerId - Provider ID
     * @param {string|number} flightId - Flight ID
     * @param {Object} flightData - Updated flight data
     * @returns {Promise<Object>} Updated flight
     */
    async updateFlight(providerId, flightId, flightData) {
        try {
            const response = await apiClient.put(`/flight/provider/${providerId}/flights/${flightId}`, flightData);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error updating flight:', error);
            throw error;
        }
    }

    /**
     * Delete a flight
     * @param {string|number} providerId - Provider ID
     * @param {string|number} flightId - Flight ID
     * @returns {Promise<Object>} Deletion result
     */
    async deleteFlight(providerId, flightId) {
        try {
            const response = await apiClient.delete(`/flight/provider/${providerId}/flights/${flightId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting flight:', error);
            throw error;
        }
    }

    /**
     * Update flight status (NEW)
     * @param {string|number} providerId - Provider ID
     * @param {string|number} flightId - Flight ID
     * @param {string} status - New status (scheduled/delayed/cancelled/completed)
     * @returns {Promise<Object>} Updated flight
     */
    async updateFlightStatus(providerId, flightId, status) {
        try {
            const response = await apiClient.patch(`/flight/provider/${providerId}/flights/${flightId}/status`, { status });
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error updating flight status:', error);
            throw error;
        }
    }

    /**
     * Get flight statistics
     * @param {string|number} providerId - Provider ID
     * @returns {Promise<Object>} Flight statistics
     */
    async getFlightStatistics(providerId) {
        try {
            const response = await apiClient.get(`/flight/provider/${providerId}/statistics`);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error fetching flight statistics:', error);
            throw error;
        }
    }

    /**
     * Search flights (DEPRECATED - use getFlights with params instead)
     * @param {string|number} providerId - Provider ID
     * @param {Object} searchParams - Search parameters
     * @returns {Promise<Array>} List of flights
     */
    async searchFlights(providerId, searchParams) {
        try {
            const response = await apiClient.get(`/flight/provider/${providerId}/flights/search`, {
                params: searchParams
            });
            const data = response.data;
            
            if (data && data.data && Array.isArray(data.data)) {
                return data.data;
            }
            if (Array.isArray(data)) {
                return data;
            }
            
            return [];
        } catch (error) {
            console.error('Error searching flights:', error);
            throw error;
        }
    }

    /**
     * Calculate flight duration
     * @param {Date|string} departureTime - Departure time
     * @param {Date|string} arrivalTime - Arrival time
     * @returns {string} Duration in format "Xh Ym"
     */
    calculateDuration(departureTime, arrivalTime) {
        const departure = new Date(departureTime);
        const arrival = new Date(arrivalTime);
        const diffMs = arrival - departure;
        
        if (diffMs < 0) return '0h 0m';
        
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    }

    /**
     * Format flight route
     * @param {string} departure - Departure airport
     * @param {string} arrival - Arrival airport
     * @returns {string} Route in format "DEP → ARR"
     */
    formatRoute(departure, arrival) {
        return `${departure} → ${arrival}`;
    }

    /**
     * Validate flight data
     * @param {Object} flightData - Flight data to validate
     * @returns {Object} Validation result { valid: boolean, errors: string[] }
     */
    validateFlightData(flightData) {
        const errors = [];

        // Required fields
        if (!flightData.flight_number) errors.push('Flight number is required');
        if (!flightData.airline_code) errors.push('Airline code is required');
        if (!flightData.airline_name) errors.push('Airline name is required');
        if (!flightData.aircraft_type) errors.push('Aircraft type is required');
        if (!flightData.departure_airport) errors.push('Departure airport is required');
        if (!flightData.arrival_airport) errors.push('Arrival airport is required');
        if (!flightData.departure_time) errors.push('Departure time is required');
        if (!flightData.arrival_time) errors.push('Arrival time is required');
        if (!flightData.flight_type) errors.push('Flight type is required');

        // Validate times
        if (flightData.departure_time && flightData.arrival_time) {
            const departure = new Date(flightData.departure_time);
            const arrival = new Date(flightData.arrival_time);
            
            if (arrival <= departure) {
                errors.push('Arrival time must be after departure time');
            }
        }

        // Validate flight number format
        if (flightData.flight_number && !/^[A-Z0-9]+$/.test(flightData.flight_number)) {
            errors.push('Flight number must contain only uppercase letters and numbers');
        }

        // Validate airline code format
        if (flightData.airline_code && !/^[A-Z]{2,3}$/.test(flightData.airline_code)) {
            errors.push('Airline code must be 2-3 uppercase letters');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

export default new FlightService();