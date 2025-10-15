import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import flightBookingService from '../../../services/flightBookingService';
import Breadcrumb from '../../../components/shared/Breadcrumb';
import { Spinner } from '../../../components/ui/Spinner';
import { ErrorAlert } from '../../../components/shared/ErrorAlert';

const FlightBookingListPage = () => {
    const navigate = useNavigate();
    const providerId = localStorage.getItem('providerId');

    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filters
    const [filters, setFilters] = useState({
        status: 'all',
        startDate: '',
        endDate: '',
        search: ''
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [bookings, filters]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await flightBookingService.getProviderBookings(providerId);
            if (response.success) {
                setBookings(response.data);
            }
        } catch (err) {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...bookings];

        // Filter by status
        if (filters.status !== 'all') {
            filtered = filtered.filter(booking => booking.status === filters.status);
        }

        // Filter by date range
        if (filters.startDate) {
            filtered = filtered.filter(booking => 
                new Date(booking.bookingDate) >= new Date(filters.startDate)
            );
        }

        if (filters.endDate) {
            filtered = filtered.filter(booking => 
                new Date(booking.bookingDate) <= new Date(filters.endDate)
            );
        }

        // Search by customer name or booking ID
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(booking => 
                booking.customerName.toLowerCase().includes(searchLower) ||
                booking.id.toString().includes(searchLower) ||
                booking.bookingCode.toLowerCase().includes(searchLower)
            );
        }

        setFilteredBookings(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleCancelBooking = async (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            const reason = prompt('Please provide a cancellation reason:');
            if (reason) {
                try {
                    await flightBookingService.cancelBooking(bookingId, reason);
                    alert('Booking cancelled successfully!');
                    fetchBookings();
                } catch (err) {
                    alert('Failed to cancel booking');
                }
            }
        }
    };

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/provider' },
        { label: 'Flight Bookings' }
    ];

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

    // Styles
    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
    };

    const contentStyle = {
        maxWidth: '1400px',
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
        fontSize: '2.5rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '0.5rem'
    };

    const subtitleStyle = {
        color: '#6b7280',
        fontSize: '1.125rem',
        marginBottom: '2rem'
    };

    const filtersContainerStyle = {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        marginBottom: '1.5rem'
    };

    const selectStyle = {
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        outline: 'none',
        minWidth: '150px'
    };

    const inputStyle = {
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        outline: 'none',
        minWidth: '200px'
    };

    const buttonStyle = {
        padding: '0.75rem 1.5rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        borderRadius: '12px',
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

    const dangerButtonStyle = {
        ...buttonStyle,
        background: '#ef4444',
        color: 'white',
        padding: '0.5rem 1rem'
    };

    const viewButtonStyle = {
        ...buttonStyle,
        background: '#667eea',
        color: 'white',
        padding: '0.5rem 1rem'
    };

    const contentCardStyle = {
        background: 'white',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    };

    const statsContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
    };

    const statCardStyle = {
        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
        padding: '1.5rem',
        borderRadius: '16px',
        border: '2px solid #e5e7eb'
    };

    const statLabelStyle = {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    };

    const statValueStyle = {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1f2937'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0'
    };

    const thStyle = {
        textAlign: 'left',
        padding: '1rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '2px solid #e5e7eb'
    };

    const tdStyle = {
        padding: '1rem',
        fontSize: '0.875rem',
        color: '#1f2937',
        borderBottom: '1px solid #f3f4f6'
    };

    const statusBadgeStyle = (status) => {
        const colors = {
            confirmed: { bg: '#d1fae5', color: '#065f46' },
            pending: { bg: '#fef3c7', color: '#92400e' },
            cancelled: { bg: '#fee2e2', color: '#991b1b' },
            completed: { bg: '#dbeafe', color: '#1e40af' }
        };

        const style = colors[status] || colors.pending;

        return {
            display: 'inline-block',
            padding: '0.375rem 0.875rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '600',
            backgroundColor: style.bg,
            color: style.color
        };
    };

    const paginationStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '2rem'
    };

    const pageButtonStyle = (isActive) => ({
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        borderRadius: '8px',
        border: isActive ? 'none' : '2px solid #e5e7eb',
        background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
        color: isActive ? 'white' : '#6b7280',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    });

    const emptyStateStyle = {
        textAlign: 'center',
        padding: '3rem',
        color: '#6b7280'
    };

    if (loading) return <Spinner />;
    if (error) return <ErrorAlert message={error} />;

    // Calculate statistics
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const totalRevenue = bookings
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                {/* Header */}
                <div style={headerCardStyle}>
                    <Breadcrumb items={breadcrumbItems} />
                    <h1 style={titleStyle}>📝 Flight Bookings Management</h1>
                    <p style={subtitleStyle}>
                        Manage all flight bookings and reservations
                    </p>

                    {/* Statistics */}
                    <div style={statsContainerStyle}>
                        <div style={statCardStyle}>
                            <div style={statLabelStyle}>Total Bookings</div>
                            <div style={statValueStyle}>{totalBookings}</div>
                        </div>
                        <div style={statCardStyle}>
                            <div style={statLabelStyle}>Confirmed</div>
                            <div style={{ ...statValueStyle, color: '#065f46' }}>{confirmedBookings}</div>
                        </div>
                        <div style={statCardStyle}>
                            <div style={statLabelStyle}>Pending</div>
                            <div style={{ ...statValueStyle, color: '#92400e' }}>{pendingBookings}</div>
                        </div>
                        <div style={statCardStyle}>
                            <div style={statLabelStyle}>Cancelled</div>
                            <div style={{ ...statValueStyle, color: '#991b1b' }}>{cancelledBookings}</div>
                        </div>
                        <div style={statCardStyle}>
                            <div style={statLabelStyle}>Total Revenue</div>
                            <div style={{ ...statValueStyle, fontSize: '1.5rem' }}>
                                {totalRevenue.toLocaleString()}
                                <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>VND</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div style={filtersContainerStyle}>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search by name, booking ID..."
                            style={{ ...inputStyle, flex: 1 }}
                        />

                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            style={selectStyle}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>

                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            style={inputStyle}
                            placeholder="Start Date"
                        />

                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            style={inputStyle}
                            placeholder="End Date"
                        />

                        <button
                            onClick={() => navigate('/provider/flight-bookings/new')}
                            style={primaryButtonStyle}
                        >
                            ➕ Create Booking
                        </button>
                    </div>
                </div>

                {/* Bookings Table */}
                <div style={contentCardStyle}>
                    {currentBookings.length > 0 ? (
                        <>
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Booking ID</th>
                                        <th style={thStyle}>Customer Name</th>
                                        <th style={thStyle}>Flight Number</th>
                                        <th style={thStyle}>Seat(s)</th>
                                        <th style={thStyle}>Booking Date</th>
                                        <th style={thStyle}>Flight Date</th>
                                        <th style={thStyle}>Total Price</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentBookings.map((booking) => (
                                        <tr key={booking.id}>
                                            <td style={tdStyle}>
                                                <span style={{ fontWeight: '600', color: '#667eea' }}>
                                                    {booking.bookingCode || `#${booking.id}`}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>{booking.customerName}</td>
                                            <td style={tdStyle}>{booking.flightNumber}</td>
                                            <td style={tdStyle}>
                                                {Array.isArray(booking.seats) 
                                                    ? booking.seats.join(', ') 
                                                    : booking.seatNumber || 'N/A'}
                                            </td>
                                            <td style={tdStyle}>
                                                {new Date(booking.bookingDate).toLocaleDateString()}
                                            </td>
                                            <td style={tdStyle}>
                                                {new Date(booking.flightDate).toLocaleDateString()}
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{ fontWeight: '600' }}>
                                                    {booking.totalPrice.toLocaleString()} VND
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={statusBadgeStyle(booking.status)}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => navigate(`/provider/flight-bookings/${booking.id}`)}
                                                        style={viewButtonStyle}
                                                        title="View Details"
                                                    >
                                                        👁️
                                                    </button>
                                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                        <button
                                                            onClick={() => handleCancelBooking(booking.id)}
                                                            style={dangerButtonStyle}
                                                            title="Cancel Booking"
                                                        >
                                                            ❌
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={paginationStyle}>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        style={pageButtonStyle(false)}
                                    >
                                        ← Previous
                                    </button>
                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index + 1}
                                            onClick={() => setCurrentPage(index + 1)}
                                            style={pageButtonStyle(currentPage === index + 1)}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        style={pageButtonStyle(false)}
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={emptyStateStyle}>
                            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                                No bookings found
                            </p>
                            <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                {filters.search || filters.status !== 'all' 
                                    ? 'Try adjusting your filters' 
                                    : 'Create your first booking to get started'}
                            </p>
                            <button
                                onClick={() => navigate('/provider/flight-bookings/new')}
                                style={primaryButtonStyle}
                            >
                                ➕ Create Booking
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FlightBookingListPage;