import apiClient from '../config/apiClient';

/**
 * Seat Service - Manage seats for flights
 * NEW: Seats linked to FlightClass via class_id (not scheduleId)
 */
const seatService = {
    /**
     * Get all seats     /**
     * Group seats by class
     * @param {Array} seats - Array of seats
     * @param {Array} classes - Array of flight classes
     * @returns {Object} Grouped seats by class ID
     */
    groupSeatsByClass: (seats, classes) => {
        const grouped = {};

        classes.forEach(cls => {
            grouped[cls._id] = {
                class: cls,
                seats: seats.filter(seat => {
                    // Support both class_id and classId field names
                    const seatClassId = seat.class_id || seat.classId || seat.flight_class_id;
                    return seatClassId === cls._id || seatClassId === cls.id;
                })
            };
        });

        // Debug log
        console.log('SeatService.groupSeatsByClass result:', Object.keys(grouped).map(key => ({
            classId: key,
            className: grouped[key].class?.class_name,
            seatsCount: grouped[key].seats.length
        })));

        return grouped;
    },

    /**
     * Get all seats for a flight
     * @param {string|number} flightId - Flight ID
     * @returns {Promise<Array>} List of seats
     */
    getAllSeats: async (flightId) => {
        try {
            const response = await apiClient.get(`/flight/flights/${flightId}/seats`);
            const data = response.data;
            
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
            console.error('Error fetching seats:', error);
            throw error;
        }
    },

    /**
     * Get available seats only
     * @param {string|number} flightId - Flight ID
     * @returns {Promise<Array>} List of available seats
     */
    getAvailableSeats: async (flightId) => {
        try {
            const response = await apiClient.get(`/flight/flights/${flightId}/seats/available`);
            const data = response.data;
            
            if (data && data.data && Array.isArray(data.data)) {
                return data.data;
            }
            if (Array.isArray(data)) {
                return data;
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching available seats:', error);
            throw error;
        }
    },

    /**
     * Create single seat
     * @param {string|number} flightId - Flight ID
     * @param {Object} seatData - Seat data
     * @returns {Promise<Object>} Created seat
     */
    createSeat: async (flightId, seatData) => {
        try {
            const response = await apiClient.post(`/flight/flights/${flightId}/seats`, seatData);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error creating seat:', error);
            throw error;
        }
    },

    /**
     * Bulk create seats (IMPORTANT)
     * @param {string|number} flightId - Flight ID
     * @param {Array} seats - Array of seat objects
     * @returns {Promise<Object>} Bulk creation result
     */
    bulkCreateSeats: async (flightId, seats) => {
        try {
            const response = await apiClient.post(`/flight/flights/${flightId}/seats/bulk`, { seats });
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error bulk creating seats:', error);
            throw error;
        }
    },

    /**
     * Update seat
     * @param {string|number} flightId - Flight ID
     * @param {string|number} seatId - Seat ID
     * @param {Object} seatData - Updated seat data
     * @returns {Promise<Object>} Updated seat
     */
    updateSeat: async (flightId, seatId, seatData) => {
        try {
            const response = await apiClient.put(`/flight/flights/${flightId}/seats/${seatId}`, seatData);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error updating seat:', error);
            throw error;
        }
    },

    /**
     * Delete seat
     * @param {string|number} flightId - Flight ID
     * @param {string|number} seatId - Seat ID
     * @returns {Promise<Object>} Deletion result
     */
    deleteSeat: async (flightId, seatId) => {
        try {
            const response = await apiClient.delete(`/flight/flights/${flightId}/seats/${seatId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting seat:', error);
            throw error;
        }
    },

    /**
     * Update seat status
     * @param {string|number} flightId - Flight ID
     * @param {string|number} seatId - Seat ID
     * @param {string} status - New status (available/booked/blocked)
     * @returns {Promise<Object>} Updated seat
     */
    updateSeatStatus: async (flightId, seatId, status) => {
        try {
            const response = await apiClient.patch(`/flight/flights/${flightId}/seats/${seatId}/status`, { status });
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error updating seat status:', error);
            throw error;
        }
    },

    /**
     * Generate seats array from configuration
     * @param {Object} config - Seat generation config
     * @returns {Array} Array of seat objects ready for bulk creation
     */
    generateSeatsFromConfig: (config) => {
        const { classId, rowStart, rowEnd, seatsPerRow, seatLetters, price } = config;
        const seats = [];

        for (let row = rowStart; row <= rowEnd; row++) {
            seatLetters.forEach(letter => {
                seats.push({
                    flight_id: config.flightId,
                    class_id: classId,
                    seat_number: `${row}${letter}`,
                    price: price,
                    status: 'available'
                });
            });
        }

        return seats;
    },

    /**
     * Generate seats for all classes
     * @param {string|number} flightId - Flight ID
     * @param {Array} classConfigs - Array of class configurations
     * @returns {Array} Array of all seats to create
     */
    generateAllSeats: (flightId, classConfigs) => {
        const allSeats = [];

        classConfigs.forEach(config => {
            const classSeats = seatService.generateSeatsFromConfig({
                ...config,
                flightId
            });
            allSeats.push(...classSeats);
        });

        return allSeats;
    },

    /**
     * Get seat status color
     * @param {string} status - Seat status
     * @returns {Object} Color styles
     */
    getSeatStatusColor: (status) => {
        const colors = {
            available: { bg: '#22c55e', color: 'white', label: 'Available' },
            booked: { bg: '#94a3b8', color: 'white', label: 'Booked' },
            blocked: { bg: '#ef4444', color: 'white', label: 'Blocked' }
        };
        return colors[status] || colors.available;
    },

    /**
     * Parse seat number into row and letter
     * @param {string} seatNumber - Seat number (e.g., "12A")
     * @returns {Object} { row: number, letter: string }
     */
    parseSeatNumber: (seatNumber) => {
        const match = seatNumber.match(/^(\d+)([A-Z])$/);
        if (match) {
            return {
                row: parseInt(match[1]),
                letter: match[2]
            };
        }
        return null;
    },

    /**
     * Group seats by class
     * @param {Array} seats - Array of seats
     * @param {Array} classes - Array of flight classes
     * @returns {Object} Seats grouped by class
     */
    groupSeatsByClass: (seats, classes) => {
        const grouped = {};

        classes.forEach(cls => {
            grouped[cls._id] = {
                class: cls,
                seats: seats.filter(seat => {
                    // Handle both populated object and string ID formats
                    let seatClassId = seat.class_id || seat.classId || seat.flight_class_id;
                    
                    // If class_id is a populated object, extract the _id
                    if (seatClassId && typeof seatClassId === 'object') {
                        seatClassId = seatClassId._id || seatClassId.id;
                    }
                    
                    return seatClassId === cls._id || seatClassId === cls.id;
                })
            };
        });

        // Debug log
        console.log('SeatService.groupSeatsByClass result:', Object.keys(grouped).map(key => ({
            classId: key,
            className: grouped[key].class?.class_name,
            seatsCount: grouped[key].seats.length
        })));

        return grouped;
    },

    /**
     * Organize seats into seat map structure
     * @param {Array} seats - Array of seats
     * @returns {Object} Seat map organized by row
     */
    organizeSeatMap: (seats) => {
        const seatMap = {};

        seats.forEach(seat => {
            const parsed = seatService.parseSeatNumber(seat.seat_number);
            if (parsed) {
                const { row } = parsed;
                if (!seatMap[row]) {
                    seatMap[row] = [];
                }
                seatMap[row].push(seat);
            }
        });

        // Sort seats in each row by letter
        Object.keys(seatMap).forEach(row => {
            seatMap[row].sort((a, b) => {
                const letterA = seatService.parseSeatNumber(a.seat_number).letter;
                const letterB = seatService.parseSeatNumber(b.seat_number).letter;
                return letterA.localeCompare(letterB);
            });
        });

        return seatMap;
    },

    /**
     * Calculate total and available seats by class
     * @param {Array} seats - Array of seats
     * @param {Array} classes - Array of flight classes
     * @returns {Object} Statistics by class
     */
    calculateSeatStats: (seats, classes) => {
        const stats = {};

        classes.forEach(cls => {
            const classSeats = seats.filter(seat => seat.class_id === cls._id);
            stats[cls._id] = {
                class: cls,
                total: classSeats.length,
                available: classSeats.filter(s => s.status === 'available').length,
                booked: classSeats.filter(s => s.status === 'booked').length,
                blocked: classSeats.filter(s => s.status === 'blocked').length,
                revenue: classSeats.reduce((sum, seat) => sum + (seat.status === 'booked' ? seat.price : 0), 0),
                potentialRevenue: classSeats.reduce((sum, seat) => sum + seat.price, 0)
            };
        });

        return stats;
    },

    /**
     * Get default seat letters for class type
     * @param {string} classType - Class type (Economy/Business/First)
     * @returns {Array} Default seat letters
     */
    getDefaultSeatLetters: (classType) => {
        const defaults = {
            Economy: ['A', 'B', 'C', 'D', 'E', 'F'],
            Business: ['A', 'B', 'C', 'D'],
            First: ['A', 'B']
        };
        return defaults[classType] || ['A', 'B', 'C', 'D', 'E', 'F'];
    },

    /**
     * Get default seats per row for class type
     * @param {string} classType - Class type
     * @returns {number} Default seats per row
     */
    getDefaultSeatsPerRow: (classType) => {
        const defaults = {
            Economy: 6,
            Business: 4,
            First: 2
        };
        return defaults[classType] || 6;
    },

    /**
     * Validate seat configuration
     * @param {Object} config - Seat configuration
     * @returns {Object} Validation result { valid: boolean, errors: string[] }
     */
    validateSeatConfig: (config) => {
        const errors = [];

        if (!config.classId) errors.push('Class is required');
        if (!config.rowStart || config.rowStart < 1) errors.push('Start row must be at least 1');
        if (!config.rowEnd || config.rowEnd < config.rowStart) {
            errors.push('End row must be greater than or equal to start row');
        }
        if (!config.seatLetters || config.seatLetters.length === 0) {
            errors.push('At least one seat letter must be selected');
        }
        if (!config.price || config.price < 0) {
            errors.push('Price must be 0 or greater');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Calculate total seats from config
     * @param {Object} config - Seat configuration
     * @returns {number} Total seats
     */
    calculateTotalSeats: (config) => {
        const rows = config.rowEnd - config.rowStart + 1;
        const seatsPerRow = config.seatLetters ? config.seatLetters.length : 0;
        return rows * seatsPerRow;
    },

    /**
     * Calculate revenue potential from config
     * @param {Object} config - Seat configuration
     * @returns {number} Total revenue potential
     */
    calculateRevenuePotential: (config) => {
        const totalSeats = seatService.calculateTotalSeats(config);
        return totalSeats * (config.price || 0);
    },

    /**
     * Check if seat number already exists
     * @param {Array} existingSeats - Array of existing seats
     * @param {string} seatNumber - Seat number to check
     * @returns {boolean} True if exists
     */
    seatNumberExists: (existingSeats, seatNumber) => {
        return existingSeats.some(seat => seat.seat_number === seatNumber);
    },

    /**
     * Get seat layout recommendations
     * @param {string} classType - Class type
     * @returns {Object} Layout recommendations
     */
    getSeatLayoutRecommendations: (classType) => {
        const recommendations = {
            First: {
                rowStart: 1,
                rowEnd: 2,
                seatLetters: ['A', 'B'],
                seatsPerRow: 2,
                description: 'Premium suite layout with maximum space'
            },
            Business: {
                rowStart: 5,
                rowEnd: 10,
                seatLetters: ['A', 'B', 'C', 'D'],
                seatsPerRow: 4,
                description: 'Business class with 2-2 configuration'
            },
            Economy: {
                rowStart: 15,
                rowEnd: 35,
                seatLetters: ['A', 'B', 'C', 'D', 'E', 'F'],
                seatsPerRow: 6,
                description: 'Standard economy 3-3 configuration'
            }
        };
        return recommendations[classType] || recommendations.Economy;
    }
};

export default seatService;
