import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { getItineraryById } from '../../services/aiItineraryService';
import TopBar from '../layout/Topbar/Topbar';
import Header from '../layout/Header/Header';
import Footer from '../layout/Footer/Footer';
import ItineraryView from './ItineraryView';
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
        padding: '3rem 1rem'
    },
    contentWrapper: {
        maxWidth: '80rem',
        margin: '0 auto'
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
    errorContainer: {
        maxWidth: '42rem',
        margin: '0 auto'
    },
    messageCard: {
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        textAlign: 'center'
    },
    messageIcon: {
        fontSize: '4rem',
        marginBottom: '1rem'
    },
    messageTitle: {
        fontSize: '1.875rem',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '0.5rem'
    },
    messageText: {
        color: '#6b7280',
        marginBottom: '1.5rem',
        fontSize: '1rem'
    },
    buttonGroup: {
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'center'
    },
    backButton: {
        padding: '0.5rem 1.5rem',
        backgroundColor: '#6b7280',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontWeight: '600',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease'
    },
    retryButton: {
        padding: '0.5rem 1.5rem',
        backgroundColor: '#14b8a6',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontWeight: '600',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease'
    },
    primaryButton: {
        padding: '0.5rem 1.5rem',
        backgroundColor: '#14b8a6',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontWeight: '600',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease'
    },
    backNavButton: {
        marginBottom: '1.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: 'white',
        color: '#374151',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        fontWeight: '600',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem'
    }
};

const ItineraryDetail = () => {
    const { itineraryId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            toast.error('Please login to view itinerary');
            setTimeout(() => navigate('/auth'), 2000);
            return;
        }

        loadItinerary();
    }, [itineraryId, user, authLoading, navigate]);

    const loadItinerary = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getItineraryById(itineraryId);
            setItinerary(response.data);
        } catch (err) {
            console.error('Failed to load itinerary:', err);
            setError(err.message || 'Failed to load itinerary');
            toast.error(err.message || 'Failed to load itinerary');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <>
                <TopBar />
                <Header />
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingContent}>
                        <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                        <p style={styles.loadingText}>Loading itinerary...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <TopBar />
                <Header />
                <div style={styles.pageWrapper}>
                    <div style={styles.container}>
                        <div style={styles.errorContainer}>
                            <div style={styles.messageCard}>
                                <div style={styles.messageIcon}>❌</div>
                                <h2 style={styles.messageTitle}>Error Loading Itinerary</h2>
                                <p style={styles.messageText}>{error}</p>
                                <div style={styles.buttonGroup}>
                                    <button
                                        onClick={() => navigate('/my-itineraries')}
                                        style={styles.backButton}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
                                    >
                                        Back to My Itineraries
                                    </button>
                                    <button
                                        onClick={loadItinerary}
                                        style={styles.retryButton}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#0d9488'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#14b8a6'}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!itinerary) {
        return (
            <>
                <TopBar />
                <Header />
                <div style={styles.pageWrapper}>
                    <div style={styles.container}>
                        <div style={styles.errorContainer}>
                            <div style={styles.messageCard}>
                                <div style={styles.messageIcon}>🔍</div>
                                <h2 style={styles.messageTitle}>Itinerary Not Found</h2>
                                <p style={styles.messageText}>
                                    The itinerary you're looking for doesn't exist or has been deleted.
                                </p>
                                <button
                                    onClick={() => navigate('/my-itineraries')}
                                    style={styles.primaryButton}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#0d9488'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#14b8a6'}
                                >
                                    Back to My Itineraries
                                </button>
                            </div>
                        </div>
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
                        {/* Back Button */}
                        <button
                            onClick={() => navigate('/my-itineraries')}
                            style={styles.backNavButton}
                            onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#f9fafb';
                                e.target.style.borderColor = '#d1d5db';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.borderColor = '#e5e7eb';
                            }}
                        >
                            <span>←</span>
                            <span>Back to My Itineraries</span>
                        </button>

                        {/* Itinerary View */}
                        <ItineraryView
                            data={itinerary}
                            destination={itinerary.request_id?.destination || 'Destination'}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
};

export default ItineraryDetail;