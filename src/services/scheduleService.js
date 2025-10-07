import apiClient from '../config/apiClient';

/**
 * Flight Schedule Service - Manage flight schedules
 */
const scheduleService = {
    /**
     * Get all schedules for a flight
     * @param {string|number} flightId - Flight ID
     * @returns {Promise<Array>} List of schedules
     */
    getFlightSchedules: async (flightId) => {
        try {
            const response = await apiClient.get(`/flight/flights/${flightId}/schedules`);
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
            console.error('Error fetching schedules:', error);
            throw error;
        }
    },

    /**
     * Get schedule by ID
     * @param {string|number} flightId - Flight ID
     * @param {string|number} scheduleId - Schedule ID
     * @returns {Promise<Object>} Schedule details
     */
    getScheduleById: async (flightId, scheduleId) => {
        try {
            const response = await apiClient.get(`/flight/flights/${flightId}/schedules/${scheduleId}`);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error fetching schedule:', error);
            throw error;
        }
    },

    /**
     * Create new schedule
     * @param {string|number} flightId - Flight ID
     * @param {Object} scheduleData - Schedule data
     * @returns {Promise<Object>} Created schedule
     */
    createSchedule: async (flightId, scheduleData) => {
        try {
            const response = await apiClient.post(`/flight/flights/${flightId}/schedules`, scheduleData);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error creating schedule:', error);
            throw error;
        }
    },

    /**
     * Update schedule
     * @param {string|number} flightId - Flight ID
     * @param {string|number} scheduleId - Schedule ID
     * @param {Object} scheduleData - Updated schedule data
     * @returns {Promise<Object>} Updated schedule
     */
    updateSchedule: async (flightId, scheduleId, scheduleData) => {
        try {
            const response = await apiClient.put(`/flight/flights/${flightId}/schedules/${scheduleId}`, scheduleData);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error updating schedule:', error);
            throw error;
        }
    },

    /**
     * Delete schedule
     * @param {string|number} flightId - Flight ID
     * @param {string|number} scheduleId - Schedule ID
     * @returns {Promise<Object>} Deletion result
     */
    deleteSchedule: async (flightId, scheduleId) => {
        try {
            const response = await apiClient.delete(`/flight/flights/${flightId}/schedules/${scheduleId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting schedule:', error);
            throw error;
        }
    },

    /**
     * Update schedule status
     * @param {string|number} flightId - Flight ID
     * @param {string|number} scheduleId - Schedule ID
     * @param {string} status - New status
     * @param {Object} additionalData - Additional data (actual times, delay reason)
     * @returns {Promise<Object>} Updated schedule
     */
    updateScheduleStatus: async (flightId, scheduleId, status, additionalData = {}) => {
        try {
            const response = await apiClient.patch(
                `/flight/flights/${flightId}/schedules/${scheduleId}/status`,
                { status, ...additionalData }
            );
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error updating schedule status:', error);
            throw error;
        }
    },

    /**
     * Create recurring schedules
     * @param {string|number} flightId - Flight ID
     * @param {Object} recurringConfig - Recurring schedule configuration
     * @returns {Promise<Object>} Created schedules
     */
    createRecurringSchedules: async (flightId, recurringConfig) => {
        const {
            startDate,
            endDate,
            departureTime,
            arrivalTime,
            frequency, // 'daily', 'weekly', 'monthly'
            daysOfWeek, // [0,1,2,3,4,5,6] for weekly
            gateNumber,
            status = 'scheduled'
        } = recurringConfig;

        const schedules = scheduleService.generateRecurringSchedules(recurringConfig);
        
        try {
            // Create all schedules
            const promises = schedules.map(schedule =>
                scheduleService.createSchedule(flightId, schedule)
            );
            const results = await Promise.all(promises);
            return results;
        } catch (error) {
            console.error('Error creating recurring schedules:', error);
            throw error;
        }
    },

    /**
     * Generate recurring schedule dates
     * @param {Object} config - Recurring configuration
     * @returns {Array} Array of schedule objects
     */
    generateRecurringSchedules: (config) => {
        const {
            startDate,
            endDate,
            departureTime,
            arrivalTime,
            frequency,
            daysOfWeek = [],
            gateNumber,
            status = 'scheduled'
        } = config;

        const schedules = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        let currentDate = new Date(start);

        while (currentDate <= end) {
            let shouldAdd = false;

            if (frequency === 'daily') {
                shouldAdd = true;
            } else if (frequency === 'weekly') {
                shouldAdd = daysOfWeek.includes(currentDate.getDay());
            } else if (frequency === 'monthly') {
                shouldAdd = currentDate.getDate() === start.getDate();
            }

            if (shouldAdd) {
                // Calculate arrival date (might be next day)
                const [depHours, depMinutes] = departureTime.split(':').map(Number);
                const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
                
                const departureDate = new Date(currentDate);
                const arrivalDate = new Date(currentDate);
                
                // If arrival time is less than departure time, it's next day
                if (arrHours < depHours || (arrHours === depHours && arrMinutes < depMinutes)) {
                    arrivalDate.setDate(arrivalDate.getDate() + 1);
                }

                schedules.push({
                    departure_date: departureDate.toISOString().split('T')[0],
                    departure_time: departureTime,
                    arrival_date: arrivalDate.toISOString().split('T')[0],
                    arrival_time: arrivalTime,
                    status,
                    gate_number: gateNumber || null,
                    actual_departure: null,
                    actual_arrival: null,
                    delay_reason: null
                });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return schedules;
    },

    /**
     * Get status color
     * @param {string} status - Schedule status
     * @returns {Object} Color styles
     */
    getStatusColor: (status) => {
        const colors = {
            scheduled: { bg: '#22c55e', color: 'white', label: 'Scheduled' },
            delayed: { bg: '#f59e0b', color: 'white', label: 'Delayed' },
            cancelled: { bg: '#ef4444', color: 'white', label: 'Cancelled' },
            completed: { bg: '#94a3b8', color: 'white', label: 'Completed' }
        };
        return colors[status] || colors.scheduled;
    },

    /**
     * Format date and time
     * @param {string} date - Date string
     * @param {string} time - Time string
     * @returns {string} Formatted datetime
     */
    formatDateTime: (date, time) => {
        if (!date || !time) return 'N/A';
        const dateObj = new Date(date);
        const dateStr = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        return `${dateStr} ${time}`;
    },

    /**
     * Calculate delay duration
     * @param {Date} planned - Planned datetime
     * @param {Date} actual - Actual datetime
     * @returns {string} Delay duration in hours and minutes
     */
    calculateDelay: (planned, actual) => {
        if (!planned || !actual) return null;
        
        const plannedTime = new Date(planned).getTime();
        const actualTime = new Date(actual).getTime();
        const delayMs = actualTime - plannedTime;
        
        if (delayMs <= 0) return null;
        
        const hours = Math.floor(delayMs / (1000 * 60 * 60));
        const minutes = Math.floor((delayMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    },

    /**
     * Combine date and time into ISO string
     * @param {string} date - Date string
     * @param {string} time - Time string (HH:MM)
     * @returns {string} ISO datetime string
     */
    combineDateAndTime: (date, time) => {
        if (!date || !time) return null;
        const [hours, minutes] = time.split(':');
        const dateObj = new Date(date);
        dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return dateObj.toISOString();
    },

    /**
     * Parse ISO datetime into date and time
     * @param {string} isoString - ISO datetime string
     * @returns {Object} { date: string, time: string }
     */
    parseISODateTime: (isoString) => {
        if (!isoString) return { date: '', time: '' };
        
        const dateObj = new Date(isoString);
        const date = dateObj.toISOString().split('T')[0];
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        const time = `${hours}:${minutes}`;
        
        return { date, time };
    },

    /**
     * Validate schedule data
     * @param {Object} scheduleData - Schedule data to validate
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validateScheduleData: (scheduleData) => {
        const errors = [];
        
        if (!scheduleData.departure_date) {
            errors.push('Departure date is required');
        }
        if (!scheduleData.departure_time) {
            errors.push('Departure time is required');
        }
        if (!scheduleData.arrival_date) {
            errors.push('Arrival date is required');
        }
        if (!scheduleData.arrival_time) {
            errors.push('Arrival time is required');
        }
        
        // Check if arrival is after departure
        if (scheduleData.departure_date && scheduleData.departure_time &&
            scheduleData.arrival_date && scheduleData.arrival_time) {
            
            const departure = new Date(`${scheduleData.departure_date}T${scheduleData.departure_time}`);
            const arrival = new Date(`${scheduleData.arrival_date}T${scheduleData.arrival_time}`);
            
            if (arrival <= departure) {
                errors.push('Arrival time must be after departure time');
            }
        }
        
        // If status is delayed, actual times and reason are required
        if (scheduleData.status === 'delayed') {
            if (!scheduleData.actual_departure && !scheduleData.actual_arrival) {
                errors.push('Actual departure or arrival time is required for delayed status');
            }
            if (!scheduleData.delay_reason) {
                errors.push('Delay reason is required for delayed status');
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Group schedules by date
     * @param {Array} schedules - Array of schedules
     * @returns {Object} Schedules grouped by date
     */
    groupSchedulesByDate: (schedules) => {
        const grouped = {};
        
        schedules.forEach(schedule => {
            const date = schedule.departure_date;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(schedule);
        });
        
        // Sort schedules within each date by time
        Object.keys(grouped).forEach(date => {
            grouped[date].sort((a, b) => {
                return a.departure_time.localeCompare(b.departure_time);
            });
        });
        
        return grouped;
    },

    /**
     * Filter schedules by date range
     * @param {Array} schedules - Array of schedules
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     * @returns {Array} Filtered schedules
     */
    filterSchedulesByDateRange: (schedules, startDate, endDate) => {
        if (!startDate && !endDate) return schedules;
        
        return schedules.filter(schedule => {
            const scheduleDate = new Date(schedule.departure_date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            
            if (start && scheduleDate < start) return false;
            if (end && scheduleDate > end) return false;
            
            return true;
        });
    },

    /**
     * Get upcoming schedules
     * @param {Array} schedules - Array of schedules
     * @param {number} days - Number of days to look ahead
     * @returns {Array} Upcoming schedules
     */
    getUpcomingSchedules: (schedules, days = 7) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + days);
        
        return schedules.filter(schedule => {
            const scheduleDate = new Date(schedule.departure_date);
            return scheduleDate >= today && scheduleDate <= futureDate;
        }).sort((a, b) => {
            const dateA = new Date(`${a.departure_date}T${a.departure_time}`);
            const dateB = new Date(`${b.departure_date}T${b.departure_time}`);
            return dateA - dateB;
        });
    }
};

export default scheduleService;
