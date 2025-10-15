import apiClient from '../config/apiClient';

/**
 * Flight Class Service - Manage classes for specific flights
 * NEW: Classes are now linked to flights via flight_id FK
 */
const flightClassService = {
    /**
     * Get all classes for a specific flight
     * @param {string|number} flightId - Flight ID
     * @returns {Promise<Array>} List of flight classes
     */
    getFlightClasses: async (flightId) => {
        try {
            const response = await apiClient.get(`/flight/flights/${flightId}/classes`);
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
            console.error('Error fetching flight classes:', error);
            throw error;
        }
    },

    /**
     * Get single class by ID
     * @param {string|number} flightId - Flight ID
     * @param {string|number} classId - Class ID
     * @returns {Promise<Object>} Flight class details
     */
    getClassById: async (flightId, classId) => {
        try {
            const response = await apiClient.get(`/flight/flights/${flightId}/classes/${classId}`);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error fetching flight class:', error);
            throw error;
        }
    },

    /**
     * Create new class for a flight
     * @param {string|number} flightId - Flight ID
     * @param {Object} classData - Class data
     * @returns {Promise<Object>} Created flight class
     */
    createClass: async (flightId, classData) => {
        try {
            const response = await apiClient.post(`/flight/flights/${flightId}/classes`, classData);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error creating flight class:', error);
            throw error;
        }
    },

    /**
     * Update existing class
     * @param {string|number} flightId - Flight ID
     * @param {string|number} classId - Class ID
     * @param {Object} classData - Updated class data
     * @returns {Promise<Object>} Updated flight class
     */
    updateClass: async (flightId, classId, classData) => {
        try {
            const response = await apiClient.put(`/flight/flights/${flightId}/classes/${classId}`, classData);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error updating flight class:', error);
            throw error;
        }
    },

    /**
     * Delete class
     * @param {string|number} flightId - Flight ID
     * @param {string|number} classId - Class ID
     * @returns {Promise<Object>} Deletion result
     */
    deleteClass: async (flightId, classId) => {
        try {
            const response = await apiClient.delete(`/flight/flights/${flightId}/classes/${classId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting flight class:', error);
            throw error;
        }
    },

    /**
     * Create standard classes (Economy, Business, First) with default configs
     * @param {string|number} flightId - Flight ID
     * @param {Object} options - Options for pricing
     * @returns {Promise<Array>} Created classes
     */
    createStandardClasses: async (flightId, options = {}) => {
        const { economyPrice = 100, businessPrice = 300, firstPrice = 600 } = options;
        
        const standardClasses = [
            {
                class_type: 'Economy',
                class_name: 'Economy Standard',
                total_seats: 150,
                available_seats: 150,
                price: economyPrice,
                baggage_allowance: {
                    cabin: { weight: 7, unit: 'kg' },
                    checked: { weight: 23, unit: 'kg', pieces: 1 }
                },
                seat_pitch: '32 inches',
                seat_width: '18 inches',
                amenities: ['Standard seat', 'In-flight entertainment', 'Meal service'],
                refund_policy: 'Non-refundable. Name change fee applies.',
                change_policy: 'Change fee: $50. Fare difference may apply.'
            },
            {
                class_type: 'Business',
                class_name: 'Business Premium',
                total_seats: 30,
                available_seats: 30,
                price: businessPrice,
                baggage_allowance: {
                    cabin: { weight: 10, unit: 'kg' },
                    checked: { weight: 32, unit: 'kg', pieces: 2 }
                },
                seat_pitch: '60 inches',
                seat_width: '21 inches',
                amenities: ['Flat bed', 'Premium meal', 'Lounge access', 'Priority boarding'],
                refund_policy: 'Refundable with 10% cancellation fee.',
                change_policy: 'Free change. Fare difference may apply.'
            },
            {
                class_type: 'First',
                class_name: 'First Class Suite',
                total_seats: 12,
                available_seats: 12,
                price: firstPrice,
                baggage_allowance: {
                    cabin: { weight: 15, unit: 'kg' },
                    checked: { weight: 40, unit: 'kg', pieces: 3 }
                },
                seat_pitch: '78 inches',
                seat_width: '24 inches',
                amenities: ['Suite', 'Gourmet meal', 'Chauffeur service', 'Spa access', 'Priority boarding', 'Lounge access'],
                refund_policy: 'Fully refundable up to 24 hours before departure.',
                change_policy: 'Free unlimited changes.'
            }
        ];

        try {
            const createdClasses = [];
            for (const classData of standardClasses) {
                const created = await this.createClass(flightId, classData);
                createdClasses.push(created);
            }
            return createdClasses;
        } catch (error) {
            console.error('Error creating standard classes:', error);
            throw error;
        }
    },

    /**
     * Create economy class only
     * @param {string|number} flightId - Flight ID
     * @param {number} price - Economy price
     * @returns {Promise<Object>} Created economy class
     */
    createEconomyOnly: async (flightId, price = 100) => {
        const economyClass = {
            class_type: 'Economy',
            class_name: 'Economy Standard',
            total_seats: 180,
            available_seats: 180,
            price: price,
            baggage_allowance: {
                cabin: { weight: 7, unit: 'kg' },
                checked: { weight: 23, unit: 'kg', pieces: 1 }
            },
            seat_pitch: '32 inches',
            seat_width: '18 inches',
            amenities: ['Standard seat', 'In-flight entertainment', 'Meal service'],
            refund_policy: 'Non-refundable. Name change fee applies.',
            change_policy: 'Change fee: $50. Fare difference may apply.'
        };

        try {
            return await this.createClass(flightId, economyClass);
        } catch (error) {
            console.error('Error creating economy class:', error);
            throw error;
        }
    },

    /**
     * Create business and first classes
     * @param {string|number} flightId - Flight ID
     * @param {Object} options - Options for pricing
     * @returns {Promise<Array>} Created classes
     */
    createPremiumClasses: async (flightId, options = {}) => {
        const { businessPrice = 300, firstPrice = 600 } = options;
        
        const premiumClasses = [
            {
                class_type: 'Business',
                class_name: 'Business Premium',
                total_seats: 30,
                available_seats: 30,
                price: businessPrice,
                baggage_allowance: {
                    cabin: { weight: 10, unit: 'kg' },
                    checked: { weight: 32, unit: 'kg', pieces: 2 }
                },
                seat_pitch: '60 inches',
                seat_width: '21 inches',
                amenities: ['Flat bed', 'Premium meal', 'Lounge access', 'Priority boarding'],
                refund_policy: 'Refundable with 10% cancellation fee.',
                change_policy: 'Free change. Fare difference may apply.'
            },
            {
                class_type: 'First',
                class_name: 'First Class Suite',
                total_seats: 12,
                available_seats: 12,
                price: firstPrice,
                baggage_allowance: {
                    cabin: { weight: 15, unit: 'kg' },
                    checked: { weight: 40, unit: 'kg', pieces: 3 }
                },
                seat_pitch: '78 inches',
                seat_width: '24 inches',
                amenities: ['Suite', 'Gourmet meal', 'Chauffeur service', 'Spa access', 'Priority boarding', 'Lounge access'],
                refund_policy: 'Fully refundable up to 24 hours before departure.',
                change_policy: 'Free unlimited changes.'
            }
        ];

        try {
            const createdClasses = [];
            for (const classData of premiumClasses) {
                const created = await this.createClass(flightId, classData);
                createdClasses.push(created);
            }
            return createdClasses;
        } catch (error) {
            console.error('Error creating premium classes:', error);
            throw error;
        }
    },

    /**
     * Get class type color
     * @param {string} classType - Class type
     * @returns {Object} Color styles
     */
    getClassTypeColor: (classType) => {
        const colors = {
            Economy: { bg: '#dbeafe', color: '#1d4ed8', icon: '💺' },
            Business: { bg: '#e0e7ff', color: '#4f46e5', icon: '🛋️' },
            First: { bg: '#fef3c7', color: '#d97706', icon: '👑' }
        };
        return colors[classType] || colors.Economy;
    },

    /**
     * Get amenity icon
     * @param {string} amenity - Amenity name
     * @returns {string} Emoji icon
     */
    getAmenityIcon: (amenity) => {
        const icons = {
            'Standard seat': '💺',
            'In-flight entertainment': '📺',
            'Meal service': '🍽️',
            'Flat bed': '🛏️',
            'Premium meal': '🍷',
            'Lounge access': '🛋️',
            'Priority boarding': '🎫',
            'Suite': '👑',
            'Gourmet meal': '🥂',
            'Chauffeur service': '🚗',
            'Spa access': '💆',
            'Extra legroom': '📏',
            'WiFi': '📶',
            'Power outlet': '🔌'
        };
        return icons[amenity] || '✨';
    },

    /**
     * Get all available amenities by class type
     * @param {string} classType - Class type
     * @returns {Array} List of available amenities
     */
    getAvailableAmenities: (classType) => {
        const amenitiesByType = {
            Economy: [
                'Standard seat',
                'In-flight entertainment',
                'Meal service',
                'WiFi',
                'Power outlet'
            ],
            Business: [
                'Flat bed',
                'Premium meal',
                'Lounge access',
                'Priority boarding',
                'In-flight entertainment',
                'WiFi',
                'Power outlet',
                'Extra legroom'
            ],
            First: [
                'Suite',
                'Gourmet meal',
                'Chauffeur service',
                'Spa access',
                'Priority boarding',
                'Lounge access',
                'In-flight entertainment',
                'WiFi',
                'Power outlet'
            ]
        };
        return amenitiesByType[classType] || amenitiesByType.Economy;
    },

    /**
     * Validate class data
     * @param {Object} classData - Class data to validate
     * @returns {Object} Validation result { valid: boolean, errors: string[] }
     */
    validateClassData: (classData) => {
        const errors = [];

        // Required fields
        if (!classData.class_type) errors.push('Class type is required');
        if (!classData.class_name) errors.push('Class name is required');
        if (classData.total_seats === undefined || classData.total_seats === null) {
            errors.push('Total seats is required');
        }
        if (classData.price === undefined || classData.price === null) {
            errors.push('Price is required');
        }

        // Validate numbers
        if (classData.total_seats && classData.total_seats <= 0) {
            errors.push('Total seats must be greater than 0');
        }
        if (classData.price && classData.price < 0) {
            errors.push('Price must be 0 or greater');
        }
        if (classData.available_seats && classData.available_seats > classData.total_seats) {
            errors.push('Available seats cannot exceed total seats');
        }

        // Validate class type
        const validTypes = ['Economy', 'Business', 'First'];
        if (classData.class_type && !validTypes.includes(classData.class_type)) {
            errors.push('Invalid class type. Must be Economy, Business, or First');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Check if flight already has a class of this type
     * @param {string|number} flightId - Flight ID
     * @param {string} classType - Class type to check
     * @param {string} excludeClassId - Class ID to exclude from check (for editing)
     * @returns {Promise<boolean>} True if duplicate exists
     */
    checkDuplicateClassType: async (flightId, classType, excludeClassId = null) => {
        try {
            const classes = await this.getFlightClasses(flightId);
            return classes.some(c => 
                c.class_type === classType && 
                (!excludeClassId || c._id !== excludeClassId)
            );
        } catch (error) {
            console.error('Error checking duplicate class type:', error);
            return false;
        }
    }
};

export default flightClassService;
