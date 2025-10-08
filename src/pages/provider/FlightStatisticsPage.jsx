import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Breadcrumb from '../../components/shared/Breadcrumb';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';

const FlightStatisticsPage = () => {
    const navigate = useNavigate();
    const providerId = localStorage.getItem('providerId');

    const [statistics, setStatistics] = useState({
        totalFlights: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        delayed: 0,
        departed: 0,
        arrived: 0,
        totalRevenue: 0,
        monthlyRevenue: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStatistics();
        fetchRecentBookings();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/flight/provider/${providerId}/flight-statistics`);
            if (response.data.success) {
                setStatistics(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching statistics:', err);
            setError('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentBookings = async () => {
        try {
            const response = await axios.get(`/api/flight/provider/${providerId}/recent-bookings?limit=5`);
            if (response.data.success) {
                setRecentBookings(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching recent bookings:', err);
        }
    };

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/provider' },
        { label: 'Flight Statistics' }
    ];

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

    const headerStyle = {
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
        fontSize: '1.125rem'
    };

    const statsGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
    };

    const statCardStyle = {
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    };

    const statCardHoverStyle = {
        transform: 'translateY(-5px)',
        boxShadow: '0 15px 40px rgba(0,0,0,0.15)'
    };

    const statIconStyle = (bgColor) => ({
        width: '60px',
        height: '60px',
        borderRadius: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        marginBottom: '1rem',
        background: bgColor
    });

    const statLabelStyle = {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    };

    const statValueStyle = {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#1f2937'
    };

    const chartCardStyle = {
        background: 'white',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        marginBottom: '2rem'
    };

    const chartTitleStyle = {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    };

    const chartStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1.5rem'
    };

    const chartBarStyle = (percentage, color) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    });

    const barContainerStyle = {
        width: '80px',
        height: '200px',
        background: '#f3f4f6',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        marginBottom: '1rem'
    };

    const barFillStyle = (percentage, color) => ({
        width: '100%',
        height: `${percentage}%`,
        background: color,
        borderRadius: '10px 10px 0 0',
        transition: 'height 1s ease'
    });

    const barLabelStyle = {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: '0.25rem'
    };

    const barValueStyle = {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937'
    };

    const tableContainerStyle = {
        background: 'white',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        overflowX: 'auto'
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
            cancelled: { bg: '#fee2e2', color: '#991b1b' }
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

    const buttonStyle = {
        padding: '0.75rem 1.5rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    };

    const emptyStateStyle = {
        textAlign: 'center',
        padding: '3rem',
        color: '#6b7280'
    };

    if (loading) return <Spinner />;
    if (error) return <ErrorAlert message={error} />;

    // Calculate percentages for chart
    const maxValue = Math.max(
        statistics.scheduled,
        statistics.completed,
        statistics.cancelled,
        statistics.delayed,
        statistics.departed,
        statistics.arrived
    );

    const getPercentage = (value) => {
        return maxValue > 0 ? (value / maxValue) * 100 : 0;
    };

    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <Breadcrumb items={breadcrumbItems} />
                    <h1 style={titleStyle}>✈️ Flight Statistics Dashboard</h1>
                    <p style={subtitleStyle}>Overview of your flight operations and performance</p>
                </div>

                {/* Statistics Cards */}
                <div style={statsGridStyle}>
                    <div
                        style={statCardStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                        }}
                    >
                        <div style={statIconStyle('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')}>
                            ✈️
                        </div>
                        <div style={statLabelStyle}>Total Flights</div>
                        <div style={statValueStyle}>{statistics.totalFlights}</div>
                    </div>

                    <div
                        style={statCardStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                        }}
                    >
                        <div style={statIconStyle('linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)')}>
                            📅
                        </div>
                        <div style={statLabelStyle}>Scheduled</div>
                        <div style={statValueStyle}>{statistics.scheduled}</div>
                    </div>

                    <div
                        style={statCardStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                        }}
                    >
                        <div style={statIconStyle('linear-gradient(135deg, #10b981 0%, #059669 100%)')}>
                            ✅
                        </div>
                        <div style={statLabelStyle}>Completed</div>
                        <div style={statValueStyle}>{statistics.completed}</div>
                    </div>

                    <div
                        style={statCardStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                        }}
                    >
                        <div style={statIconStyle('linear-gradient(135deg, #ef4444 0%, #dc2626 100%)')}>
                            ❌
                        </div>
                        <div style={statLabelStyle}>Cancelled</div>
                        <div style={statValueStyle}>{statistics.cancelled}</div>
                    </div>
                </div>

                {/* Revenue Cards */}
                <div style={statsGridStyle}>
                    <div
                        style={statCardStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                        }}
                    >
                        <div style={statIconStyle('linear-gradient(135deg, #f59e0b 0%, #d97706 100%)')}>
                            💰
                        </div>
                        <div style={statLabelStyle}>Total Revenue</div>
                        <div style={statValueStyle}>
                            {statistics.totalRevenue.toLocaleString()}
                            <span style={{ fontSize: '1rem', color: '#6b7280', marginLeft: '0.5rem' }}>VND</span>
                        </div>
                    </div>

                    <div
                        style={statCardStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                        }}
                    >
                        <div style={statIconStyle('linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)')}>
                            📊
                        </div>
                        <div style={statLabelStyle}>Monthly Revenue</div>
                        <div style={statValueStyle}>
                            {statistics.monthlyRevenue.toLocaleString()}
                            <span style={{ fontSize: '1rem', color: '#6b7280', marginLeft: '0.5rem' }}>VND</span>
                        </div>
                    </div>
                </div>

                {/* Flight Status Chart */}
                <div style={chartCardStyle}>
                    <h2 style={chartTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>📊</span>
                        Flights by Status
                    </h2>
                    <div style={chartStyle}>
                        <div style={chartBarStyle}>
                            <div style={barContainerStyle}>
                                <div style={barFillStyle(getPercentage(statistics.scheduled), '#3b82f6')}></div>
                            </div>
                            <div style={barLabelStyle}>Scheduled</div>
                            <div style={barValueStyle}>{statistics.scheduled}</div>
                        </div>

                        <div style={chartBarStyle}>
                            <div style={barContainerStyle}>
                                <div style={barFillStyle(getPercentage(statistics.delayed), '#f59e0b')}></div>
                            </div>
                            <div style={barLabelStyle}>Delayed</div>
                            <div style={barValueStyle}>{statistics.delayed}</div>
                        </div>

                        <div style={chartBarStyle}>
                            <div style={barContainerStyle}>
                                <div style={barFillStyle(getPercentage(statistics.departed), '#8b5cf6')}></div>
                            </div>
                            <div style={barLabelStyle}>Departed</div>
                            <div style={barValueStyle}>{statistics.departed}</div>
                        </div>

                        <div style={chartBarStyle}>
                            <div style={barContainerStyle}>
                                <div style={barFillStyle(getPercentage(statistics.arrived), '#10b981')}></div>
                            </div>
                            <div style={barLabelStyle}>Arrived</div>
                            <div style={barValueStyle}>{statistics.arrived}</div>
                        </div>

                        <div style={chartBarStyle}>
                            <div style={barContainerStyle}>
                                <div style={barFillStyle(getPercentage(statistics.cancelled), '#ef4444')}></div>
                            </div>
                            <div style={barLabelStyle}>Cancelled</div>
                            <div style={barValueStyle}>{statistics.cancelled}</div>
                        </div>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div style={tableContainerStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={chartTitleStyle}>
                            <span style={{ fontSize: '1.75rem' }}>📝</span>
                            Recent Bookings
                        </h2>
                        <button
                            style={buttonStyle}
                            onClick={() => navigate('/provider/flight-bookings')}
                        >
                            View All Bookings
                        </button>
                    </div>

                    {recentBookings.length > 0 ? (
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Booking ID</th>
                                    <th style={thStyle}>Flight</th>
                                    <th style={thStyle}>Passenger</th>
                                    <th style={thStyle}>Class</th>
                                    <th style={thStyle}>Amount</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map((booking, index) => (
                                    <tr key={index}>
                                        <td style={tdStyle}>#{booking.id}</td>
                                        <td style={tdStyle}>{booking.flightNumber}</td>
                                        <td style={tdStyle}>{booking.passengerName}</td>
                                        <td style={tdStyle}>{booking.class}</td>
                                        <td style={tdStyle}>{booking.amount.toLocaleString()} VND</td>
                                        <td style={tdStyle}>
                                            <span style={statusBadgeStyle(booking.status)}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{booking.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={emptyStateStyle}>
                            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                                No recent bookings
                            </p>
                            <p style={{ fontSize: '0.875rem' }}>
                                Bookings will appear here once passengers book your flights
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FlightStatisticsPage;