import React, { createContext, useContext, useState, useEffect } from 'react';

const FlightContext = createContext();

export const useFlightContext = () => {
    const context = useContext(FlightContext);
    if (!context) {
        throw new Error('useFlightContext must be used within FlightProvider');
    }
    return context;
};

export const FlightProvider = ({ children }) => {
    // Provider state
    const [providerId, setProviderId] = useState(null);
    
    // Current selections
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);

    // Filter states
    const [flightFilters, setFlightFilters] = useState({
        status: 'all',
        searchTerm: ''
    });

    const [scheduleFilters, setScheduleFilters] = useState({
        status: 'all',
        dateRange: { start: '', end: '' }
    });

    const [bookingFilters, setBookingFilters] = useState({
        status: 'all',
        searchTerm: '',
        dateRange: { start: '', end: '' }
    });

    // Loading and error states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Notification state
    const [notification, setNotification] = useState(null);

    // Initialize provider ID from localStorage
    useEffect(() => {
        const storedProviderId = localStorage.getItem('providerId');
        if (storedProviderId) {
            setProviderId(storedProviderId);
        }
    }, []);

    // Save provider ID to localStorage when changed
    useEffect(() => {
        if (providerId) {
            localStorage.setItem('providerId', providerId);
        }
    }, [providerId]);

    // Show notification with auto-dismiss
    const showNotification = (message, type = 'info', duration = 3000) => {
        setNotification({ message, type, id: Date.now() });
        
        if (duration > 0) {
            setTimeout(() => {
                setNotification(null);
            }, duration);
        }
    };

    // Clear notification
    const clearNotification = () => {
        setNotification(null);
    };

    // Clear error
    const clearError = () => {
        setError(null);
    };

    // Reset all filters
    const resetAllFilters = () => {
        setFlightFilters({ status: 'all', searchTerm: '' });
        setScheduleFilters({ status: 'all', dateRange: { start: '', end: '' } });
        setBookingFilters({ status: 'all', searchTerm: '', dateRange: { start: '', end: '' } });
    };

    // Clear all selections
    const clearAllSelections = () => {
        setSelectedFlight(null);
        setSelectedSchedule(null);
        setSelectedBooking(null);
        setSelectedClass(null);
    };

    const value = {
        // Provider
        providerId,
        setProviderId,

        // Selections
        selectedFlight,
        setSelectedFlight,
        selectedSchedule,
        setSelectedSchedule,
        selectedBooking,
        setSelectedBooking,
        selectedClass,
        setSelectedClass,
        clearAllSelections,

        // Filters
        flightFilters,
        setFlightFilters,
        scheduleFilters,
        setScheduleFilters,
        bookingFilters,
        setBookingFilters,
        resetAllFilters,

        // Loading and Error
        isLoading,
        setIsLoading,
        error,
        setError,
        clearError,

        // Notifications
        notification,
        showNotification,
        clearNotification
    };

    return (
        <FlightContext.Provider value={value}>
            {children}
        </FlightContext.Provider>
    );
};

export default FlightContext;