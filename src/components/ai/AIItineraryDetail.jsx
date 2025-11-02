import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { getItineraryById, deleteItinerary } from '../../services/aiItineraryService';
import NewItineraryView from './NewItineraryView';
import TopBar from '../layout/Topbar/Topbar';
import Header from '../layout/Header/Header';
import Footer from '../layout/Footer/Footer';

/**
 * Enhanced AI Itinerary Detail Page
 * Shows both original and customized versions with proper comparison
 */
const AIItineraryDetail = () => {
    const { aiGeneratedId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [itineraryData, setItineraryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState('original'); // 'original' | 'customized'
    const [showComparison, setShowComparison] = useState(false);

    useEffect(() => {
        if (!aiGeneratedId) {
            setError('Invalid itinerary ID');
            setLoading(false);
            return;
        }

        const loadItineraryDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getItineraryById(aiGeneratedId);

                if (response.success && response.data) {
                    setItineraryData(response.data);

                    // Set default view based on what's available
                    if (response.data.hasCustomized) {
                        setActiveView('customized');
                        setShowComparison(true);
                    } else {
                        setActiveView('original');
                    }
                } else {
                    throw new Error(response.message || 'Failed to load itinerary details');
                }
            } catch (err) {
                console.error('❌ Load Detail Error:', err);
                setError(err.message || 'Failed to load itinerary details');
                toast.error(err.message || 'Failed to load itinerary details');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadItineraryDetails();
        }
    }, [aiGeneratedId, user]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this entire itinerary? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteItinerary(aiGeneratedId);
            toast.success('Itinerary deleted successfully');
            navigate('/my-itineraries');
        } catch (err) {
            console.error('❌ Delete Error:', err);
            toast.error(err.message || 'Failed to delete itinerary');
        }
    };

    const handleCustomize = () => {
        navigate(`/ai-itinerary/${aiGeneratedId}/customize`);
    };

    const styles = {
        pageWrapper: {
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            paddingTop: '140px',
            paddingBottom: '2rem'
        },
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 1rem'
        },
        navigationCard: {
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
        },
        backButton: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6b7280',
            color: 'white',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.2s'
        },
        pageTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937',
            margin: 0
        },
        actionButtons: {
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap'
        },
        actionButton: (variant = 'primary') => {
            const variants = {
                primary: {
                    backgroundColor: '#10b981',
                    color: 'white'
                },
                customize: {
                    backgroundColor: '#f59e0b',
                    color: 'white'
                },
                danger: {
                    backgroundColor: '#ef4444',
                    color: 'white'
                },
                secondary: {
                    backgroundColor: '#e5e7eb',
                    color: '#374151'
                }
            };

            return {
                ...variants[variant],
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            };
        },
        viewToggleCard: {
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        toggleButtons: {
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem'
        },
        toggleButton: (isActive) => ({
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backgroundColor: isActive ? '#3b82f6' : '#f3f4f6',
            color: isActive ? 'white' : '#374151'
        }),
        comparisonToggle: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: '#6b7280'
        },
        comparisonLayout: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            alignItems: 'start'
        },
        versionCard: {
            backgroundColor: 'white',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        versionHeader: (type) => ({
            padding: '1rem',
            background: type === 'original'
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            textAlign: 'center',
            fontWeight: '600'
        }),
        loadingContainer: {
            textAlign: 'center',
            padding: '4rem',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        errorContainer: {
            textAlign: 'center',
            padding: '4rem',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            color: '#ef4444'
        },
        infoAlert: {
            backgroundColor: '#e0f2fe',
            borderLeft: '4px solid #0ea5e9',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            color: '#0369a1'
        }
    };

    if (loading) {
        return (
            <>
                <TopBar />
                <Header />
                <div style={styles.pageWrapper}>
                    <div style={styles.container}>
                        <div style={styles.loadingContainer}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                            <p>Loading itinerary details...</p>
                        </div>
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
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
                            <h2 style={{ color: '#1f2937', marginBottom: '1rem' }}>Failed to Load Itinerary</h2>
                            <p style={{ marginBottom: '1.5rem' }}>{error}</p>
                            <button
                                onClick={() => navigate('/my-itineraries')}
                                style={styles.actionButton()}
                            >
                                Back to My Itineraries
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!itineraryData) {
        return (
            <>
                <TopBar />
                <Header />
                <div style={styles.pageWrapper}>
                    <div style={styles.container}>
                        <div style={styles.errorContainer}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤔</div>
                            <h2 style={{ color: '#1f2937', marginBottom: '1rem' }}>Itinerary Not Found</h2>
                            <p style={{ marginBottom: '1.5rem' }}>The itinerary you're looking for doesn't exist or has been deleted.</p>
                            <button
                                onClick={() => navigate('/my-itineraries')}
                                style={styles.actionButton()}
                            >
                                Back to My Itineraries
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const {
        destination,
        duration_days,
        preferences,
        summary,
        status,
        created_at,
        original,
        hasCustomized,
        customized
    } = itineraryData;

    return (
        <>
            <TopBar />
            <Header />

            <main style={styles.pageWrapper}>
                <div style={styles.container}>
                    {/* Navigation */}
                    <div style={styles.navigationCard}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/my-itineraries');
                            }}
                            style={styles.backButton}
                        >
                            <span>←</span>
                            <span>My Itineraries</span>
                        </a>

                        <h1 style={styles.pageTitle}>
                            📍 {destination} • {duration_days} Days
                        </h1>

                        <div style={styles.actionButtons}>
                            <button
                                onClick={handleCustomize}
                                style={styles.actionButton('customize')}
                            >
                                <span>✏️</span>
                                <span>{hasCustomized ? 'Edit Customization' : 'Customize Trip'}</span>
                            </button>

                            <button
                                onClick={() => {
                                    navigator.share?.({
                                        title: `My ${destination} Itinerary`,
                                        text: `Check out my ${duration_days}-day trip to ${destination}!`,
                                        url: window.location.href
                                    }).catch(() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast.success('Link copied to clipboard!');
                                    });
                                }}
                                style={styles.actionButton('secondary')}
                            >
                                <span>📤</span>
                                <span>Share</span>
                            </button>

                            <button
                                onClick={handleDelete}
                                style={styles.actionButton('danger')}
                            >
                                <span>🗑️</span>
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>

                    {/* View Toggle (only if customized version exists) */}
                    {hasCustomized && (
                        <div style={styles.viewToggleCard}>
                            <div style={styles.toggleButtons}>
                                <button
                                    onClick={() => setActiveView('original')}
                                    style={styles.toggleButton(activeView === 'original')}
                                >
                                    ✅ Original Version
                                </button>
                                <button
                                    onClick={() => setActiveView('customized')}
                                    style={styles.toggleButton(activeView === 'customized')}
                                >
                                    ✨ Customized Version
                                </button>
                            </div>

                            <label style={styles.comparisonToggle}>
                                <input
                                    type="checkbox"
                                    checked={showComparison}
                                    onChange={(e) => setShowComparison(e.target.checked)}
                                />
                                <span>Show side-by-side comparison</span>
                            </label>
                        </div>
                    )}

                    {/* Trip Info */}
                    <div style={styles.infoAlert}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                            <div>
                                <strong>Created:</strong> {new Date(created_at).toLocaleDateString()}
                            </div>
                            <div>
                                <strong>Status:</strong> {status === 'done' ? '✅ Complete' : '⏳ Processing'}
                            </div>
                            <div>
                                <strong>Preferences:</strong> {preferences?.join(', ') || 'None specified'}
                            </div>
                            {hasCustomized && (
                                <div>
                                    <strong>Customization:</strong> ✨ Available
                                </div>
                            )}
                        </div>
                        {summary && (
                            <div style={{ marginTop: '0.75rem' }}>
                                <strong>Summary:</strong> {summary}
                            </div>
                        )}
                    </div>

                    {/* Content Display */}
                    {showComparison && hasCustomized ? (
                        /* Side-by-side comparison */
                        <div style={styles.comparisonLayout}>
                            <div style={styles.versionCard}>
                                <div style={styles.versionHeader('original')}>
                                    ✅ Original AI Version
                                </div>
                                <NewItineraryView
                                    data={{
                                        ...original,
                                        aiGeneratedId,
                                        destination,
                                        duration: duration_days,
                                        isOriginal: true,
                                        isCustomizable: true,
                                        hasCustomized
                                    }}
                                    showActions={false}
                                />
                            </div>

                            <div style={styles.versionCard}>
                                <div style={styles.versionHeader('customized')}>
                                    ✨ Your Customized Version
                                </div>
                                <NewItineraryView
                                    data={{
                                        ...customized,
                                        aiGeneratedId,
                                        destination,
                                        duration: duration_days,
                                        isOriginal: false,
                                        isCustomizable: true,
                                        hasCustomized
                                    }}
                                    showActions={false}
                                />
                            </div>
                        </div>
                    ) : (
                        /* Single view */
                        <NewItineraryView
                            data={{
                                ...(activeView === 'customized' && hasCustomized ? customized : original),
                                aiGeneratedId,
                                destination,
                                duration: duration_days,
                                isOriginal: activeView === 'original',
                                isCustomizable: true,
                                hasCustomized,
                                customizedId: hasCustomized ? aiGeneratedId : null
                            }}
                            showActions={false}
                        />
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
};

export default AIItineraryDetail;