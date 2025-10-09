import { createContext, useContext, useState, useEffect } from 'react';
import flightService from '../services/flightService';
import flightClassService from '../services/flightClassService';
import seatService from '../services/seatService';
import scheduleService from '../services/scheduleService';

const FlightManagementContext = createContext();

export const useFlightManagement = () => {
    const context = useContext(FlightManagementContext);
    if (!context) {
        throw new Error('useFlightManagement must be used within FlightManagementProvider');
    }
    return context;
};

export const FlightManagementProvider = ({ children }) => {
    const [currentFlight, setCurrentFlight] = useState(null);
    const [classes, setClasses] = useState([]);
    const [seats, setSeats] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filters state
    const [filters, setFilters] = useState({
        status: [],
        flightType: '',
        dateRange: [null, null],
        searchQuery: ''
    });

    /**
     * Load complete flight data (flight + classes + seats + schedules)
     */
    const loadFlightData = async (flightId, providerId) => {
        try {
            setLoading(true);
            setError(null);

            // Load flight details
            const flightData = await flightService.getFlightById(providerId, flightId);
            setCurrentFlight(flightData);

            // Load related data in parallel
            const [classesData, seatsData, schedulesData] = await Promise.all([
                flightClassService.getFlightClasses(flightId),
                seatService.getAllSeats(flightId).catch(() => []),
                scheduleService.getFlightSchedules(flightId).catch(() => [])
            ]);

            setClasses(classesData);
            setSeats(seatsData);
            setSchedules(schedulesData);
        } catch (err) {
            console.error('Error loading flight data:', err);
            setError(err.message || 'Failed to load flight data');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Refresh classes only
     */
    const refreshClasses = async (flightId) => {
        try {
            const classesData = await flightClassService.getFlightClasses(flightId);
            setClasses(classesData);
        } catch (err) {
            console.error('Error refreshing classes:', err);
        }
    };

    /**
     * Refresh seats only
     */
    const refreshSeats = async (flightId) => {
        try {
            const seatsData = await seatService.getAllSeats(flightId);
            setSeats(seatsData);
        } catch (err) {
            console.error('Error refreshing seats:', err);
        }
    };

    /**
     * Refresh schedules only
     */
    const refreshSchedules = async (flightId) => {
        try {
            const schedulesData = await scheduleService.getFlightSchedules(flightId);
            setSchedules(schedulesData);
        } catch (err) {
            console.error('Error refreshing schedules:', err);
        }
    };

    /**
     * Update flight status
     */
    const updateFlightStatus = async (providerId, flightId, status) => {
        try {
            await flightService.updateFlightStatus(providerId, flightId, status);
            if (currentFlight && currentFlight._id === flightId) {
                setCurrentFlight({ ...currentFlight, status });
            }
        } catch (err) {
            console.error('Error updating flight status:', err);
            throw err;
        }
    };

    /**
     * Get statistics
     */
    const getStatistics = () => {
        if (!currentFlight) return null;

        // Class statistics
        const totalSeatsAcrossClasses = classes.reduce((sum, cls) => sum + (cls.total_seats || 0), 0);
        const availableSeatsAcrossClasses = classes.reduce((sum, cls) => sum + (cls.available_seats || 0), 0);

        // Seat statistics
        const seatStats = seatService.calculateSeatStats(seats, classes);
        const totalRevenue = Object.values(seatStats).reduce((sum, stat) => sum + stat.revenue, 0);
        const potentialRevenue = Object.values(seatStats).reduce((sum, stat) => sum + stat.potentialRevenue, 0);

        // Schedule statistics
        const upcomingSchedules = scheduleService.getUpcomingSchedules(schedules, 7);
        const scheduledCount = schedules.filter(s => s.status === 'scheduled').length;
        const delayedCount = schedules.filter(s => s.status === 'delayed').length;
        const completedCount = schedules.filter(s => s.status === 'completed').length;

        return {
            flight: {
                status: currentFlight.status,
                type: currentFlight.flight_type,
                airline: currentFlight.airline_name
            },
            classes: {
                total: classes.length,
                totalSeats: totalSeatsAcrossClasses,
                availableSeats: availableSeatsAcrossClasses,
                occupancyRate: totalSeatsAcrossClasses > 0 
                    ? ((totalSeatsAcrossClasses - availableSeatsAcrossClasses) / totalSeatsAcrossClasses * 100).toFixed(1)
                    : 0
            },
            seats: {
                total: seats.length,
                available: seats.filter(s => s.status === 'available').length,
                booked: seats.filter(s => s.status === 'booked').length,
                blocked: seats.filter(s => s.status === 'blocked').length,
                revenue: totalRevenue,
                potentialRevenue: potentialRevenue,
                revenueRate: potentialRevenue > 0 
                    ? ((totalRevenue / potentialRevenue) * 100).toFixed(1)
                    : 0
            },
            schedules: {
                total: schedules.length,
                upcoming: upcomingSchedules.length,
                scheduled: scheduledCount,
                delayed: delayedCount,
                completed: completedCount
            }
        };
    };

    /**
     * Clear all data
     */
    const clearFlightData = () => {
        setCurrentFlight(null);
        setClasses([]);
        setSeats([]);
        setSchedules([]);
        setError(null);
    };

    /**
     * Update filters
     */
    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    /**
     * Reset filters
     */
    const resetFilters = () => {
        setFilters({
            status: [],
            flightType: '',
            dateRange: [null, null],
            searchQuery: ''
        });
    };

    const value = {
        // State
        currentFlight,
        classes,
        seats,
        schedules,
        loading,
        error,
        filters,

        // Actions
        loadFlightData,
        refreshClasses,
        refreshSeats,
        refreshSchedules,
        updateFlightStatus,
        clearFlightData,
        updateFilters,
        resetFilters,
        getStatistics,

        // Setters (for direct updates)
        setCurrentFlight,
        setClasses,
        setSeats,
        setSchedules
    };

    return (
        <FlightManagementContext.Provider value={value}>
            {children}
        </FlightManagementContext.Provider>
    );
};

export default FlightManagementContext;
