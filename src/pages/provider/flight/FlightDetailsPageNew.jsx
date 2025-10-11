import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FlightManagementProvider, useFlightManagement } from '../../../contexts/FlightManagementContext';
import FlightClassesManagementPage from './FlightClassesManagementPage';
import SeatsManagementPage from './seats/SeatsManagementPage';
import ScheduleManagementPage from './schedules/ScheduleManagementPage';

const FlightDetailsContent = () => {
    const { flightId } = useParams();
    const navigate = useNavigate();
    const providerId = localStorage.getItem('providerId');
    
    const {
        currentFlight,
        loading,
        error,
        loadFlightData,
        getStatistics,
        updateFlightStatus
    } = useFlightManagement();

    const [activeTab, setActiveTab] = useState('overview');
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        if (flightId && providerId) {
            loadFlightData(flightId, providerId);
        }
    }, [flightId, providerId]);

    const handleStatusUpdate = async (newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this flight as ${newStatus}?`)) {
            return;
        }

        try {
            setUpdatingStatus(true);
            await updateFlightStatus(providerId, flightId, newStatus);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update flight status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading flight details...</p>
            </div>
        );
    }

    if (error || !currentFlight) {
        return (
            <div style={styles.errorContainer}>
                <h3 style={styles.errorTitle}>Error Loading Flight</h3>
                <p style={styles.errorText}>{error || 'Flight not found'}</p>
                <button
                    onClick={() => navigate('/provider/flights')}
                    style={styles.backButton}
                >
                    ← Back to Flights
                </button>
            </div>
        );
    }

    const stats = getStatistics();
    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'classes', label: 'Classes', icon: '🎫' },
        { id: 'seats', label: 'Seats', icon: '💺' },
        { id: 'schedules', label: 'Schedules', icon: '📅' }
    ];

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <button
                        onClick={() => navigate('/provider/flights')}
                        style={styles.backButtonSmall}
                    >
                        ← Back
                    </button>
                    <div>
                        <h2 style={styles.title}>
                            {currentFlight.flight_number}
                        </h2>
                        <p style={styles.subtitle}>
                            {currentFlight.airline_name} • {currentFlight.aircraft_type}
                        </p>
                    </div>
                </div>
                <div style={styles.headerRight}>
                    <span style={{
                        ...styles.statusBadge,
                        ...getStatusStyle(currentFlight.status)
                    }}>
                        {currentFlight.status}
                    </span>
                    <Link
                        to={`/provider/flights/${flightId}/edit`}
                        style={styles.editButton}
                    >
                        ✏️ Edit
                    </Link>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={styles.tabsContainer}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            ...styles.tab,
                            ...(activeTab === tab.id ? styles.tabActive : {})
                        }}
                    >
                        <span style={styles.tabIcon}>{tab.icon}</span>
                        <span style={styles.tabLabel}>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={styles.tabContent}>
                {activeTab === 'overview' && (
                    <div style={styles.overviewContent}>
                        {/* Flight Info Card */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Flight Information</h3>
                            <div style={styles.infoGrid}>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Flight Number:</span>
                                    <span style={styles.infoValue}>{currentFlight.flight_number}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Airline:</span>
                                    <span style={styles.infoValue}>{currentFlight.airline_name}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Aircraft:</span>
                                    <span style={styles.infoValue}>{currentFlight.aircraft_type}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Type:</span>
                                    <span style={{
                                        ...styles.typeBadge,
                                        backgroundColor: currentFlight.flight_type === 'domestic' ? '#3b82f6' : '#8b5cf6'
                                    }}>
                                        {currentFlight.flight_type}
                                    </span>
                                </div>
                            </div>

                            <div style={styles.routeSection}>
                                <div style={styles.routeBox}>
                                    <div style={styles.routeLabel}>From</div>
                                    <div style={styles.routeValue}>{currentFlight.departure_airport}</div>
                                    <div style={styles.routeTime}>{currentFlight.departure_time}</div>
                                </div>
                                <div style={styles.routeArrow}>
                                    <div style={styles.routeDuration}>{currentFlight.duration || 'N/A'}</div>
                                    <div>→</div>
                                </div>
                                <div style={styles.routeBox}>
                                    <div style={styles.routeLabel}>To</div>
                                    <div style={styles.routeValue}>{currentFlight.arrival_airport}</div>
                                    <div style={styles.routeTime}>{currentFlight.arrival_time}</div>
                                </div>
                            </div>

                            {/* Amenities */}
                            <div style={styles.amenitiesSection}>
                                <h4 style={styles.sectionTitle}>Amenities</h4>
                                <div style={styles.amenitiesGrid}>
                                    {currentFlight.wifi_available && (
                                        <div style={styles.amenityChip}>📶 WiFi</div>
                                    )}
                                    {currentFlight.meal_service && (
                                        <div style={styles.amenityChip}>🍽️ Meals</div>
                                    )}
                                    {currentFlight.entertainment_system && (
                                        <div style={styles.amenityChip}>🎬 Entertainment</div>
                                    )}
                                </div>
                            </div>

                            {/* Status Actions */}
                            <div style={styles.statusActions}>
                                <h4 style={styles.sectionTitle}>Flight Status Actions</h4>
                                <div style={styles.actionButtons}>
                                    {currentFlight.status !== 'scheduled' && (
                                        <button
                                            onClick={() => handleStatusUpdate('scheduled')}
                                            disabled={updatingStatus}
                                            style={{...styles.statusButton, backgroundColor: '#22c55e'}}
                                        >
                                            Mark Scheduled
                                        </button>
                                    )}
                                    {currentFlight.status !== 'delayed' && (
                                        <button
                                            onClick={() => handleStatusUpdate('delayed')}
                                            disabled={updatingStatus}
                                            style={{...styles.statusButton, backgroundColor: '#f59e0b'}}
                                        >
                                            Mark Delayed
                                        </button>
                                    )}
                                    {currentFlight.status !== 'cancelled' && (
                                        <button
                                            onClick={() => handleStatusUpdate('cancelled')}
                                            disabled={updatingStatus}
                                            style={{...styles.statusButton, backgroundColor: '#ef4444'}}
                                        >
                                            Mark Cancelled
                                        </button>
                                    )}
                                    {currentFlight.status !== 'completed' && (
                                        <button
                                            onClick={() => handleStatusUpdate('completed')}
                                            disabled={updatingStatus}
                                            style={{...styles.statusButton, backgroundColor: '#94a3b8'}}
                                        >
                                            Mark Completed
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        {stats && (
                            <div style={styles.statsGrid}>
                                {/* Classes Stats */}
                                <div style={styles.statCard}>
                                    <div style={styles.statHeader}>
                                        <h4 style={styles.statTitle}>Classes</h4>
                                        <span style={styles.statIcon}>🎫</span>
                                    </div>
                                    <div style={styles.statValue}>{stats.classes.total}</div>
                                    <div style={styles.statDetails}>
                                        <div style={styles.statDetail}>
                                            <span>Total Seats:</span>
                                            <strong>{stats.classes.totalSeats}</strong>
                                        </div>
                                        <div style={styles.statDetail}>
                                            <span>Available:</span>
                                            <strong style={{color: '#22c55e'}}>{stats.classes.availableSeats}</strong>
                                        </div>
                                        <div style={styles.statDetail}>
                                            <span>Occupancy:</span>
                                            <strong style={{color: '#667eea'}}>{stats.classes.occupancyRate}%</strong>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('classes')}
                                        style={styles.statButton}
                                    >
                                        Manage Classes →
                                    </button>
                                </div>

                                {/* Seats Stats */}
                                <div style={styles.statCard}>
                                    <div style={styles.statHeader}>
                                        <h4 style={styles.statTitle}>Seats</h4>
                                        <span style={styles.statIcon}>💺</span>
                                    </div>
                                    <div style={styles.statValue}>{stats.seats.total}</div>
                                    <div style={styles.statDetails}>
                                        <div style={styles.statDetail}>
                                            <span>Available:</span>
                                            <strong style={{color: '#22c55e'}}>{stats.seats.available}</strong>
                                        </div>
                                        <div style={styles.statDetail}>
                                            <span>Booked:</span>
                                            <strong style={{color: '#94a3b8'}}>{stats.seats.booked}</strong>
                                        </div>
                                        <div style={styles.statDetail}>
                                            <span>Revenue:</span>
                                            <strong style={{color: '#10b981'}}>${stats.seats.revenue.toLocaleString()}</strong>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('seats')}
                                        style={styles.statButton}
                                    >
                                        Manage Seats →
                                    </button>
                                </div>

                                {/* Schedules Stats */}
                                <div style={styles.statCard}>
                                    <div style={styles.statHeader}>
                                        <h4 style={styles.statTitle}>Schedules</h4>
                                        <span style={styles.statIcon}>📅</span>
                                    </div>
                                    <div style={styles.statValue}>{stats.schedules.total}</div>
                                    <div style={styles.statDetails}>
                                        <div style={styles.statDetail}>
                                            <span>Upcoming:</span>
                                            <strong style={{color: '#3b82f6'}}>{stats.schedules.upcoming}</strong>
                                        </div>
                                        <div style={styles.statDetail}>
                                            <span>Delayed:</span>
                                            <strong style={{color: '#f59e0b'}}>{stats.schedules.delayed}</strong>
                                        </div>
                                        <div style={styles.statDetail}>
                                            <span>Completed:</span>
                                            <strong style={{color: '#94a3b8'}}>{stats.schedules.completed}</strong>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('schedules')}
                                        style={styles.statButton}
                                    >
                                        Manage Schedules →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'classes' && <FlightClassesManagementPage flightIdProp={flightId} />}
                {activeTab === 'seats' && <SeatsManagementPage flightIdProp={flightId} />}
                {activeTab === 'schedules' && <ScheduleManagementPage flightIdProp={flightId} />}
            </div>
        </div>
    );
};

const getStatusStyle = (status) => {
    const styles = {
        scheduled: { backgroundColor: '#22c55e', color: 'white' },
        delayed: { backgroundColor: '#f59e0b', color: 'white' },
        cancelled: { backgroundColor: '#ef4444', color: 'white' },
        completed: { backgroundColor: '#94a3b8', color: 'white' }
    };
    return styles[status] || styles.scheduled;
};

const FlightDetailsPageNew = () => {
    return (
        <FlightManagementProvider>
            <FlightDetailsContent />
        </FlightManagementProvider>
    );
};

const styles = {
    container: {
        padding: '24px',
        maxWidth: '1600px',
        margin: '0 auto'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    backButtonSmall: {
        padding: '8px 16px',
        backgroundColor: 'white',
        color: '#667eea',
        border: '2px solid #667eea',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    title: {
        fontSize: '32px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '4px'
    },
    subtitle: {
        color: '#64748b',
        fontSize: '16px'
    },
    statusBadge: {
        padding: '8px 20px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    editButton: {
        padding: '10px 20px',
        backgroundColor: 'white',
        color: '#667eea',
        border: '2px solid #667eea',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        textDecoration: 'none',
        display: 'inline-block'
    },
    tabsContainer: {
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        borderBottom: '2px solid #e2e8f0',
        overflowX: 'auto'
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 24px',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '3px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap'
    },
    tabActive: {
        borderBottomColor: '#667eea',
        color: '#667eea',
        fontWeight: '700'
    },
    tabIcon: {
        fontSize: '20px'
    },
    tabLabel: {
        fontSize: '16px',
        fontWeight: '600'
    },
    tabContent: {
        minHeight: '400px'
    },
    overviewContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '24px'
    },
    cardTitle: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '20px'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    infoLabel: {
        fontSize: '13px',
        color: '#64748b',
        fontWeight: '600'
    },
    infoValue: {
        fontSize: '16px',
        color: '#1e293b',
        fontWeight: '700'
    },
    typeBadge: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '700',
        color: 'white',
        textTransform: 'uppercase',
        alignSelf: 'flex-start'
    },
    routeSection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        marginBottom: '24px',
        gap: '16px',
        flexWrap: 'wrap'
    },
    routeBox: {
        flex: 1,
        minWidth: '150px',
        textAlign: 'center'
    },
    routeLabel: {
        fontSize: '13px',
        color: '#64748b',
        marginBottom: '4px',
        fontWeight: '600'
    },
    routeValue: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '4px'
    },
    routeTime: {
        fontSize: '16px',
        color: '#667eea',
        fontWeight: '600'
    },
    routeArrow: {
        textAlign: 'center'
    },
    routeDuration: {
        fontSize: '13px',
        color: '#64748b',
        marginBottom: '8px',
        fontWeight: '600'
    },
    amenitiesSection: {
        marginBottom: '24px'
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '12px'
    },
    amenitiesGrid: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
    },
    amenityChip: {
        padding: '8px 16px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#475569'
    },
    statusActions: {
        marginTop: '24px',
        paddingTop: '24px',
        borderTop: '1px solid #e2e8f0'
    },
    actionButtons: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
    },
    statusButton: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'opacity 0.2s'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '24px'
    },
    statHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
    },
    statTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1e293b'
    },
    statIcon: {
        fontSize: '32px'
    },
    statValue: {
        fontSize: '48px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '16px'
    },
    statDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '20px'
    },
    statDetail: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px',
        color: '#64748b'
    },
    statButton: {
        width: '100%',
        padding: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px'
    },
    spinner: {
        width: '48px',
        height: '48px',
        border: '4px solid #e2e8f0',
        borderTopColor: '#667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    loadingText: {
        marginTop: '16px',
        color: '#64748b',
        fontSize: '16px'
    },
    errorContainer: {
        textAlign: 'center',
        padding: '60px 20px'
    },
    errorTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#ef4444',
        marginBottom: '12px'
    },
    errorText: {
        fontSize: '16px',
        color: '#64748b',
        marginBottom: '24px'
    },
    backButton: {
        padding: '12px 24px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer'
    }
};

export default FlightDetailsPageNew;
