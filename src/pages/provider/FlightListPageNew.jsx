import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import flightService from '../../services/flightService';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import Breadcrumb from '../../components/shared/Breadcrumb';

const FlightListPageNew = () => {
    const navigate = useNavigate();
    const providerId = localStorage.getItem('providerId');
    
    // State management
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    
    // Filter states
    const [filters, setFilters] = useState({
        status: 'all',
        flight_type: 'all',
        search: '',
        date_from: '',
        date_to: ''
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchFlights();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown && !event.target.closest('[data-dropdown]')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdown]);

    const fetchFlights = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Build query params
            const params = {};
            if (filters.status !== 'all') params.status = filters.status;
            if (filters.flight_type !== 'all') params.flightType = filters.flight_type;
            if (filters.search) params.search = filters.search;
            if (filters.date_from) params.dateFrom = filters.date_from;
            if (filters.date_to) params.dateTo = filters.date_to;
            
            const data = await flightService.getFlights(providerId, params);
            
            if (Array.isArray(data)) {
                setFlights(data);
            } else {
                setFlights([]);
                setError('Received invalid data format from server');
            }
        } catch (err) {
            console.error('Error fetching flights:', err);
            setError(err.response?.data?.message || 'Failed to load flights');
            setFlights([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const handleApplyFilters = () => {
        fetchFlights();
    };

    const handleResetFilters = () => {
        setFilters({
            status: 'all',
            flight_type: 'all',
            search: '',
            date_from: '',
            date_to: ''
        });
        setCurrentPage(1);
        fetchFlights();
    };

    const handleDeleteFlight = async (flightId) => {
        if (window.confirm('Are you sure you want to delete this flight? This action cannot be undone.')) {
            try {
                await flightService.deleteFlight(providerId, flightId);
                alert('Flight deleted successfully!');
                fetchFlights();
            } catch (err) {
                console.error('Error deleting flight:', err);
                alert(err.response?.data?.message || 'Failed to delete flight');
            }
        }
    };

    const handleStatusChange = async (flightId, newStatus) => {
        try {
            await flightService.updateFlightStatus(providerId, flightId, newStatus);
            alert('Flight status updated successfully!');
            fetchFlights();
        } catch (err) {
            console.error('Error updating status:', err);
            alert(err.response?.data?.message || 'Failed to update flight status');
        }
    };

    // Client-side filtering for pagination
    const filterFlights = () => {
        return flights.filter(flight => {
            let matches = true;
            
            if (filters.status !== 'all' && flight.status !== filters.status) {
                matches = false;
            }
            
            if (filters.flight_type !== 'all' && flight.flight_type !== filters.flight_type) {
                matches = false;
            }
            
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                matches = matches && (
                    flight.flight_number?.toLowerCase().includes(searchLower) ||
                    flight.airline_name?.toLowerCase().includes(searchLower) ||
                    flight.airline_code?.toLowerCase().includes(searchLower)
                );
            }
            
            return matches;
        });
    };

    const filteredFlights = filterFlights();
    const totalPages = Math.ceil(filteredFlights.length / itemsPerPage);
    const paginatedFlights = filteredFlights.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Status badge styles
    const getStatusStyle = (status) => {
        const baseStyle = {
            padding: '0.375rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'inline-block'
        };

        const styles = {
            scheduled: { ...baseStyle, background: '#dbeafe', color: '#1d4ed8' },
            delayed: { ...baseStyle, background: '#fef3c7', color: '#d97706' },
            cancelled: { ...baseStyle, background: '#fee2e2', color: '#dc2626' },
            completed: { ...baseStyle, background: '#d1fae5', color: '#059669' }
        };

        return styles[status] || baseStyle;
    };

    // Flight type badge styles
    const getFlightTypeStyle = (type) => {
        const baseStyle = {
            padding: '0.25rem 0.625rem',
            borderRadius: '10px',
            fontSize: '0.7rem',
            fontWeight: '600',
            display: 'inline-block'
        };

        return type === 'international'
            ? { ...baseStyle, background: '#e0e7ff', color: '#4f46e5' }
            : { ...baseStyle, background: '#f3f4f6', color: '#6b7280' };
    };

    // Format date/time
    const formatDateTime = (dateTime) => {
        if (!dateTime) return '-';
        const date = new Date(dateTime);
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);
    };

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/provider' },
        { label: 'Flight Management' }
    ];

    // Styles
    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
    };

    const contentStyle = {
        maxWidth: '1600px',
        margin: '0 auto'
    };

    const headerCardStyle = {
        background: 'white',
        borderRadius: '24px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    };

    const titleStyle = {
        fontSize: '2rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '1.5rem'
    };

    const filtersContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.625rem 0.875rem',
        fontSize: '0.875rem',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        transition: 'all 0.3s ease',
        outline: 'none'
    };

    const selectStyle = {
        ...inputStyle,
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.5rem center',
        backgroundSize: '1.5em 1.5em',
        paddingRight: '2.5rem'
    };

    const buttonStyle = {
        padding: '0.625rem 1.25rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const primaryButtonStyle = {
        ...buttonStyle,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    };

    const secondaryButtonStyle = {
        ...buttonStyle,
        background: 'white',
        color: '#667eea',
        border: '2px solid #667eea'
    };

    const filterActionsStyle = {
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'flex-end'
    };

    const tableContainerStyle = {
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        overflowX: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0',
        fontSize: '0.875rem'
    };

    const thStyle = {
        textAlign: 'left',
        padding: '1rem',
        fontSize: '0.75rem',
        fontWeight: '700',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '2px solid #e5e7eb',
        whiteSpace: 'nowrap'
    };

    const tdStyle = {
        padding: '1rem',
        color: '#1f2937',
        borderBottom: '1px solid #f3f4f6',
        verticalAlign: 'middle'
    };

    const actionButtonStyle = {
        padding: '0.5rem 1rem',
        fontSize: '0.75rem',
        fontWeight: '600',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    };

    const dropdownContainerStyle = {
        position: 'relative',
        display: 'inline-block'
    };

    const dropdownButtonStyle = {
        ...actionButtonStyle,
        background: '#f3f4f6',
        color: '#374151',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const dropdownMenuStyle = {
        position: 'absolute',
        right: 0,
        top: 'calc(100% + 0.5rem)',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        minWidth: '200px',
        zIndex: 1000,
        overflow: 'hidden'
    };

    const dropdownItemStyle = {
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        color: '#374151',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid #f3f4f6'
    };

    const paginationContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'white',
        borderRadius: '12px'
    };

    const pageButtonStyle = {
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        borderRadius: '8px',
        border: '2px solid #e5e7eb',
        background: 'white',
        color: '#374151',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    };

    const activePageButtonStyle = {
        ...pageButtonStyle,
        background: '#667eea',
        color: 'white',
        borderColor: '#667eea'
    };

    const emptyStateStyle = {
        background: 'white',
        borderRadius: '16px',
        padding: '4rem 2rem',
        textAlign: 'center'
    };

    if (loading) return <Spinner />;

    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                {/* Header */}
                <div style={headerCardStyle}>
                    <Breadcrumb items={breadcrumbItems} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h1 style={titleStyle}>✈️ Flight Management</h1>
                        <button
                            onClick={() => navigate('/provider/flights/new')}
                            style={primaryButtonStyle}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            ➕ Create New Flight
                        </button>
                    </div>

                    {error && <ErrorAlert message={error} />}

                    {/* Filters */}
                    <div style={filtersContainerStyle}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>
                                Search
                            </label>
                            <input
                                type="text"
                                placeholder="Flight number, airline..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                style={selectStyle}
                            >
                                <option value="all">All Status</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="delayed">Delayed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>
                                Flight Type
                            </label>
                            <select
                                value={filters.flight_type}
                                onChange={(e) => handleFilterChange('flight_type', e.target.value)}
                                style={selectStyle}
                            >
                                <option value="all">All Types</option>
                                <option value="domestic">Domestic</option>
                                <option value="international">International</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>
                                From Date
                            </label>
                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>
                                To Date
                            </label>
                            <input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={filterActionsStyle}>
                        <button
                            onClick={handleResetFilters}
                            style={secondaryButtonStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#667eea';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.color = '#667eea';
                            }}
                        >
                            🔄 Reset
                        </button>
                        <button
                            onClick={handleApplyFilters}
                            style={primaryButtonStyle}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            🔍 Apply Filters
                        </button>
                    </div>
                </div>

                {/* Table */}
                {paginatedFlights.length === 0 ? (
                    <div style={emptyStateStyle}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✈️</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                            No Flights Found
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                            {filters.search || filters.status !== 'all' || filters.flight_type !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Create your first flight to get started'
                            }
                        </p>
                        <button
                            onClick={() => navigate('/provider/flights/new')}
                            style={primaryButtonStyle}
                        >
                            ➕ Create New Flight
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={tableContainerStyle}>
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Flight No.</th>
                                        <th style={thStyle}>Airline</th>
                                        <th style={thStyle}>Route</th>
                                        <th style={thStyle}>Departure</th>
                                        <th style={thStyle}>Arrival</th>
                                        <th style={thStyle}>Duration</th>
                                        <th style={thStyle}>Aircraft</th>
                                        <th style={thStyle}>Type</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedFlights.map((flight) => (
                                        <tr
                                            key={flight._id}
                                            style={{
                                                transition: 'background-color 0.2s ease',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td style={{ ...tdStyle, fontWeight: '600', color: '#667eea' }}>
                                                {flight.flight_number}
                                            </td>
                                            <td style={tdStyle}>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{flight.airline_name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                        {flight.airline_code}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span>{flight.departure_airport}</span>
                                                    <span style={{ color: '#667eea' }}>→</span>
                                                    <span>{flight.arrival_airport}</span>
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                {formatDateTime(flight.departure_time)}
                                            </td>
                                            <td style={tdStyle}>
                                                {formatDateTime(flight.arrival_time)}
                                            </td>
                                            <td style={tdStyle}>
                                                {flight.duration || flightService.calculateDuration(
                                                    flight.departure_time,
                                                    flight.arrival_time
                                                )}
                                            </td>
                                            <td style={tdStyle}>{flight.aircraft_type}</td>
                                            <td style={tdStyle}>
                                                <span style={getFlightTypeStyle(flight.flight_type)}>
                                                    {flight.flight_type === 'international' ? '🌍 International' : '🏠 Domestic'}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={getStatusStyle(flight.status)}>
                                                    {flight.status?.charAt(0).toUpperCase() + flight.status?.slice(1)}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={dropdownContainerStyle} data-dropdown>
                                                    <button
                                                        onClick={() => setOpenDropdown(openDropdown === flight._id ? null : flight._id)}
                                                        style={dropdownButtonStyle}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                                    >
                                                        Actions ▼
                                                    </button>

                                                    {openDropdown === flight._id && (
                                                        <div style={dropdownMenuStyle}>
                                                            <div
                                                                onClick={() => navigate(`/provider/flights/${flight._id}`)}
                                                                style={dropdownItemStyle}
                                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                                            >
                                                                👁️ View Details
                                                            </div>
                                                            <div
                                                                onClick={() => navigate(`/provider/flights/${flight._id}/edit`)}
                                                                style={dropdownItemStyle}
                                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                                            >
                                                                ✏️ Edit
                                                            </div>
                                                            <div
                                                                onClick={() => navigate(`/provider/flights/${flight._id}/classes`)}
                                                                style={dropdownItemStyle}
                                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                                            >
                                                                🎫 Manage Classes
                                                            </div>
                                                            <div
                                                                onClick={() => navigate(`/provider/flights/${flight._id}/seats`)}
                                                                style={dropdownItemStyle}
                                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                                            >
                                                                💺 Manage Seats
                                                            </div>
                                                            <div
                                                                onClick={() => {
                                                                    setOpenDropdown(null);
                                                                    handleDeleteFlight(flight._id);
                                                                }}
                                                                style={{...dropdownItemStyle, color: '#dc2626', borderBottom: 'none' }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = '#fee2e2';
                                                                    e.currentTarget.style.color = '#dc2626';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = 'white';
                                                                    e.currentTarget.style.color = '#dc2626';
                                                                }}
                                                            >
                                                                🗑️ Delete
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={paginationContainerStyle}>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredFlights.length)} of {filteredFlights.length} flights
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        style={{
                                            ...pageButtonStyle,
                                            opacity: currentPage === 1 ? 0.5 : 1,
                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        ← Previous
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        const isCurrentPage = pageNumber === currentPage;
                                        
                                        // Show first page, last page, current page, and pages around current
                                        if (
                                            pageNumber === 1 ||
                                            pageNumber === totalPages ||
                                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => setCurrentPage(pageNumber)}
                                                    style={isCurrentPage ? activePageButtonStyle : pageButtonStyle}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                            return <span key={pageNumber} style={{ padding: '0.5rem' }}>...</span>;
                                        }
                                        return null;
                                    })}
                                    
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        style={{
                                            ...pageButtonStyle,
                                            opacity: currentPage === totalPages ? 0.5 : 1,
                                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FlightListPageNew;
