import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { getUserItineraries, deleteItinerary } from '../../services/aiItineraryService';
import TopBar from '../layout/Topbar/Topbar';
import Header from '../layout/Header/Header';
import Footer from '../layout/Footer/Footer';
import './AIItinerary.css';

const styles = {
    pageWrapper: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #e0f2fe 100%)',
        paddingTop: 'calc(40px + 2rem)',
        paddingBottom: '2rem'
    },
    container: {
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1rem'
    },
    contentWrapper: {
        maxWidth: '80rem',
        margin: '0 auto'
    },
    header: {
        marginBottom: '2rem'
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '0.5rem'
    },
    subtitle: {
        color: '#6b7280',
        fontSize: '1.125rem'
    },
    errorBox: {
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: '#fef2f2',
        borderLeft: '4px solid #ef4444',
        borderRadius: '0.5rem',
        color: '#991b1b'
    },
    emptyStateCard: {
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '3rem',
        textAlign: 'center'
    },
    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '1rem'
    },
    emptyTitle: {
        fontSize: '1.875rem',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '0.5rem'
    },
    emptyText: {
        color: '#6b7280',
        marginBottom: '1.5rem',
        fontSize: '1rem'
    },
    createButton: {
        padding: '0.75rem 2rem',
        backgroundColor: '#22c55e',
        color: 'white',
        border: 'none',
        borderRadius: '0.75rem',
        fontWeight: '600',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: '1px solid #e5e7eb'
    },
    cardHeader: {
        background: 'linear-gradient(135deg, #14b8a6 0%, #22c55e 100%)',
        padding: '1rem',
        color: 'white'
    },
    cardTitle: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: '0.25rem'
    },
    cardSubtitle: {
        fontSize: '0.875rem',
        opacity: 0.9
    },
    cardBody: {
        padding: '1.25rem'
    },
    infoText: {
        fontSize: '0.875rem',
        color: '#6b7280',
        marginBottom: '0.5rem'
    },
    statusBadge: {
        padding: '0.25rem 0.5rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'inline-block'
    },
    statusDone: {
        backgroundColor: '#dcfce7',
        color: '#15803d'
    },
    statusPending: {
        backgroundColor: '#fef3c7',
        color: '#a16207'
    },
    summary: {
        fontSize: '0.875rem',
        color: '#6b7280',
        marginBottom: '1rem',
        lineHeight: '1.5'
    },
    buttonGroup: {
        display: 'flex',
        gap: '0.5rem'
    },
    viewButton: {
        flex: 1,
        padding: '0.5rem 1rem',
        backgroundColor: '#14b8a6',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        fontSize: '0.875rem'
    },
    deleteButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        fontSize: '0.875rem'
    },
    createNewSection: {
        marginTop: '2rem',
        textAlign: 'center'
    },
    createNewButton: {
        padding: '0.75rem 2rem',
        backgroundColor: '#22c55e',
        color: 'white',
        border: 'none',
        borderRadius: '0.75rem',
        fontWeight: '600',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
    },
    loadingContent: {
        textAlign: 'center'
    },
    loadingText: {
        color: '#6b7280',
        marginTop: '1rem'
    },
    loginButton: {
        padding: '0.5rem 1.5rem',
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '1rem',
        transition: 'background-color 0.2s ease'
    }
};

const MyItineraries = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [itineraries, setItineraries] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            toast.error('Please login to view your itineraries');
            setTimeout(() => navigate('/auth'), 2000);
            return;
        }

        loadUserItineraries();
    }, [user, authLoading, navigate]);

    const loadUserItineraries = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get user_id
            let userId = null;
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                userId = userData.providerId || userData.id || userData._id;
            }
            if (!userId) {
                userId = user?.providerId || localStorage.getItem('providerId');
            }

            if (!userId) {
                throw new Error('User ID not found');
            }

            const response = await getUserItineraries(userId);
            setRequests(response.data.requests || []);
            setItineraries(response.data.itineraries || []);
        } catch (err) {
            console.error('Failed to load itineraries:', err);
            setError(err.message || 'Failed to load itineraries');
            toast.error(err.message || 'Failed to load itineraries');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (itineraryId) => {
        if (!window.confirm('Are you sure you want to delete this itinerary?')) {
            return;
        }

        try {
            await deleteItinerary(itineraryId);
            toast.success('Itinerary deleted successfully');
            loadUserItineraries();
        } catch (err) {
            console.error('Failed to delete itinerary:', err);
            toast.error(err.message || 'Failed to delete itinerary');
        }
    };

    const handleView = (itineraryId) => {
        navigate(`/ai-itinerary/${itineraryId}`);
    };

    if (authLoading || loading) {
        return (
            <>
                <TopBar />
                <Header />
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingContent}>
                        <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                        <p style={styles.loadingText}>Loading your itineraries...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!user) {
        return (
            <>
                <TopBar />
                <Header />
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingContent}>
                        <p style={{ ...styles.loadingText, marginBottom: '1rem' }}>
                            Please login to view your itineraries
                        </p>
                        <button
                            onClick={() => navigate('/auth')}
                            style={styles.loginButton}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <TopBar />
            <Header />

            <main style={styles.pageWrapper}>
                <div style={styles.container}>
                    <div style={styles.contentWrapper}>
                        {/* Header */}
                        <div style={styles.header}>
                            <h1 style={styles.title}>My Itineraries</h1>
                            <p style={styles.subtitle}>View and manage your AI-generated travel plans</p>
                        </div>

                        {/* Error State */}
                        {error && (
                            <div style={styles.errorBox}>
                                <span style={{ fontWeight: '600' }}>Error:</span> {error}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && itineraries.length === 0 && (
                            <div style={styles.emptyStateCard}>
                                <div style={styles.emptyIcon}>🗺️</div>
                                <h2 style={styles.emptyTitle}>No Itineraries Yet</h2>
                                <p style={styles.emptyText}>
                                    Start planning your perfect trip with AI assistance!
                                </p>
                                <button
                                    onClick={() => navigate('/ai-itinerary')}
                                    style={styles.createButton}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#16a34a'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#22c55e'}
                                >
                                    Create New Itinerary
                                </button>
                            </div>
                        )}

                        {/* Itineraries Grid */}
                        {itineraries.length > 0 && (
                            <div style={styles.grid}>
                                {itineraries.map((itinerary) => {
                                    const request = requests.find(r => r._id === itinerary.request_id);
                                    return (
                                        <div
                                            key={itinerary._id}
                                            style={styles.card}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            {/* Card Header */}
                                            <div style={styles.cardHeader}>
                                                <h3 style={styles.cardTitle}>
                                                    {request?.destination || 'Unknown Destination'}
                                                </h3>
                                                <p style={styles.cardSubtitle}>
                                                    {request?.duration_days || 0} days • {request?.budget_level || 'medium'} budget
                                                </p>
                                            </div>

                                            {/* Card Body */}
                                            <div style={styles.cardBody}>
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <p style={styles.infoText}>
                                                        <span style={{ fontWeight: '600' }}>Created:</span>{' '}
                                                        {new Date(itinerary.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                    <p style={styles.infoText}>
                                                        <span style={{ fontWeight: '600' }}>Status:</span>{' '}
                                                        <span style={{
                                                            ...styles.statusBadge,
                                                            ...(itinerary.status === 'done' ? styles.statusDone : styles.statusPending)
                                                        }}>
                                                            {itinerary.status}
                                                        </span>
                                                    </p>
                                                    {request?.preferences && request.preferences.length > 0 && (
                                                        <p style={styles.infoText}>
                                                            <span style={{ fontWeight: '600' }}>Preferences:</span>{' '}
                                                            {request.preferences.join(', ')}
                                                        </p>
                                                    )}
                                                </div>

                                                <div style={styles.summary}>
                                                    {itinerary.summary || 'No summary available'}
                                                </div>

                                                {/* Actions */}
                                                <div style={styles.buttonGroup}>
                                                    <button
                                                        onClick={() => handleView(itinerary._id)}
                                                        style={styles.viewButton}
                                                        onMouseOver={(e) => e.target.style.backgroundColor = '#0d9488'}
                                                        onMouseOut={(e) => e.target.style.backgroundColor = '#14b8a6'}
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(itinerary._id)}
                                                        style={styles.deleteButton}
                                                        onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                                                        onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Create New Button */}
                        {itineraries.length > 0 && (
                            <div style={styles.createNewSection}>
                                <button
                                    onClick={() => navigate('/ai-itinerary')}
                                    style={styles.createNewButton}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#16a34a'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#22c55e'}
                                >
                                    <span style={{ fontSize: '1.25rem' }}>+</span>
                                    <span>Create New Itinerary</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
};

export default MyItineraries;