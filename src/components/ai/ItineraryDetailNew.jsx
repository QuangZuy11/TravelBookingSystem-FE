import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { getItineraryById } from '../../services/aiItineraryService';
import TopBar from '../layout/Topbar/Topbar';
import Header from '../layout/Header/Header';
import Footer from '../layout/Footer/Footer';

// Modern Travel Itinerary styles matching the design
const styles = {
    pageWrapper: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        paddingTop: '100px'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
    },
    backButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: '#e2e8f0',
        color: '#475569',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        marginBottom: '20px',
        transition: 'all 0.2s ease'
    },
    headerCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)'
    },
    headerIcon: {
        fontSize: '32px',
        marginBottom: '16px'
    },
    headerTitle: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '8px',
        lineHeight: '1.2'
    },
    headerSubtitle: {
        fontSize: '20px',
        color: '#64748b',
        marginBottom: '24px'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '20px',
        marginTop: '24px'
    },
    statCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        border: '1px solid #e2e8f0'
    },
    statValue: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '4px'
    },
    statLabel: {
        fontSize: '14px',
        color: '#64748b',
        fontWeight: '500'
    },
    actionButtons: {
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
        flexWrap: 'wrap'
    },
    actionButton: {
        padding: '10px 20px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: 'white'
    },
    saveButton: {
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none'
    },
    dayCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        marginBottom: '24px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
    },
    dayHeader: {
        padding: '20px 24px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    dayHeaderContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    dayInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    dayNumber: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#3b82f6',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: '600'
    },
    dayTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: '4px'
    },
    dayMeta: {
        display: 'flex',
        gap: '16px',
        fontSize: '14px',
        color: '#64748b'
    },
    expandIcon: {
        fontSize: '20px',
        color: '#64748b',
        transition: 'transform 0.2s ease'
    },
    activitiesList: {
        padding: '0'
    },
    activityCard: {
        padding: '20px 24px',
        borderBottom: '1px solid #f1f5f9',
        position: 'relative'
    },
    activityHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '12px'
    },
    activityLeft: {
        flex: 1
    },
    activityStep: {
        position: 'absolute',
        left: '12px',
        top: '20px',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: '#3b82f6',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: '600'
    },
    activityContent: {
        marginLeft: '40px'
    },
    activityTags: {
        display: 'flex',
        gap: '8px',
        marginBottom: '8px',
        flexWrap: 'wrap'
    },
    activityTag: {
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: '#f1f5f9',
        color: '#475569'
    },
    activityName: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: '4px',
        lineHeight: '1.4'
    },
    activityLocation: {
        fontSize: '14px',
        color: '#64748b',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    activityActions: {
        display: 'flex',
        gap: '8px',
        marginTop: '12px'
    },
    activityButton: {
        padding: '6px 12px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        backgroundColor: 'white',
        color: '#475569',
        transition: 'all 0.2s ease'
    },
    costInfo: {
        textAlign: 'right',
        minWidth: '100px'
    },
    costAmount: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: '2px'
    },
    costUsd: {
        fontSize: '12px',
        color: '#64748b'
    },
    freeBadge: {
        padding: '4px 8px',
        backgroundColor: '#dcfce7',
        color: '#166534',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600'
    },
    tipsSection: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    tipsTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    tipsList: {
        listStyle: 'none',
        padding: 0,
        margin: 0
    },
    tipItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        marginBottom: '8px',
        fontSize: '14px',
        color: '#475569'
    },
    tipIcon: {
        color: '#10b981',
        marginTop: '2px'
    },
    summarySection: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    summaryTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: '16px'
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
    },
    summaryItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px'
    },
    summaryIcon: {
        width: '16px',
        height: '16px'
    },
    ctaSection: {
        backgroundColor: '#3b82f6',
        borderRadius: '12px',
        padding: '32px 24px',
        textAlign: 'center',
        marginBottom: '40px'
    },
    ctaTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: 'white',
        marginBottom: '8px'
    },
    ctaText: {
        fontSize: '16px',
        color: '#bfdbfe',
        marginBottom: '24px'
    },
    ctaButtons: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap'
    },
    ctaButton: {
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: 'none'
    },
    ctaPrimary: {
        backgroundColor: '#f97316',
        color: 'white'
    },
    ctaSecondary: {
        backgroundColor: 'white',
        color: '#3b82f6'
    }
};

const ItineraryDetailNew = () => {
    const params = useParams();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Log params để debug
    const aiGeneratedId = params.itineraryId;  // Sửa tên param để khớp với route

    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedDays, setExpandedDays] = useState(new Set([1]));

    useEffect(() => {
        if (authLoading) return;

        if (!aiGeneratedId) {
            console.error('No aiGeneratedId provided in URL');
            setError('Invalid itinerary ID');
            return;
        }

        // Get userId from localStorage or context
        const userIdFromStorage = localStorage.getItem('userId');
        const userStr = localStorage.getItem('user');
        let userFromStorage = null;
        try {
            userFromStorage = userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user from storage:', error);
        }

        // Try different sources for userId in this order:
        // 1. Context user 
        // 2. localStorage userId
        // 3. localStorage user object
        const effectiveUserId = user?.userId || userIdFromStorage || userFromStorage?.userId;
        
        if (!effectiveUserId) {
            toast.error('Please login to view itinerary');
            setTimeout(() => navigate('/auth'), 2000);
            return;
        }

        loadItinerary();
    }, [aiGeneratedId, user, authLoading, navigate]);

    const loadItinerary = async (forceReload = false) => {
        try {
            setLoading(true);
            setError(null);

            const response = await getItineraryById(aiGeneratedId, {
                headers: forceReload ? {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                } : {}
            });

            const payload = response?.data ?? response;
            setItinerary(payload);
        } catch (err) {
            console.error('Failed to load itinerary:', err);
            setError(err.message || 'Failed to load itinerary');
            toast.error(err.message || 'Failed to load itinerary');
        } finally {
            setLoading(false);
        }
    };

    const toggleDay = (dayNumber) => {
        setExpandedDays(prev => {
            const newSet = new Set(prev);
            if (newSet.has(dayNumber)) {
                newSet.delete(dayNumber);
            } else {
                newSet.add(dayNumber);
            }
            return newSet;
        });
    };

    const handleShare = async () => {
        try {
            const currentUrl = window.location.href;

            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(currentUrl);
                toast.success('Itinerary URL copied to clipboard!', {
                    duration: 3000,
                    icon: '📋',
                });
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = currentUrl;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                    toast.success('Itinerary URL copied to clipboard!', {
                        duration: 3000,
                        icon: '📋',
                    });
                } catch (err) {
                    console.error('Fallback copy failed:', err);
                    toast.error('Could not copy URL. Please copy manually: ' + currentUrl, {
                        duration: 5000,
                    });
                }

                textArea.remove();
            }
        } catch (err) {
            console.error('Failed to copy URL:', err);
            toast.error('Failed to copy URL. Please copy manually from address bar.', {
                duration: 4000,
            });
        }
    };

    // Handle Customize functionality 
    const handleCustomize = () => {
        navigate(`/ai-itinerary/${aiGeneratedId}/customize`);
    };

    if (authLoading || loading) {
        return (
            <>
                <TopBar />
                <Header />
                <div style={styles.pageWrapper}>
                    <div style={styles.container}>
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✈️</div>
                            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                                Loading Your Journey
                            </h2>
                            <p style={{ color: '#64748b' }}>Please wait while we prepare your travel itinerary...</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !itinerary) {
        return (
            <>
                <TopBar />
                <Header />
                <div style={styles.pageWrapper}>
                    <div style={styles.container}>
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
                            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                                Itinerary Not Found
                            </h2>
                            <p style={{ color: '#64748b', marginBottom: '24px' }}>
                                The itinerary you're looking for doesn't exist or has been removed.
                            </p>
                            <button
                                onClick={() => navigate('/my-itineraries')}
                                style={{
                                    ...styles.ctaButton,
                                    ...styles.ctaPrimary
                                }}
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

    // Handle both API response formats - Updated for new API structure
    const itinerary_data = itinerary.days || itinerary.original?.days || itinerary.itinerary_data || [];
    const { summary } = itinerary;
    const destination = itinerary.request?.destination || itinerary.destination || 'Unknown Destination';

    const totalDays = itinerary_data?.length || 0;
    const totalActivities = itinerary_data?.reduce((sum, day) => sum + (day.activities?.length || 0), 0) || 0;
    const totalCost = itinerary.totalCost || itinerary.original?.totalCost ||
        itinerary_data?.reduce((sum, day) => {
            return sum + (day.activities?.reduce((daySum, act) => daySum + (act.cost || 0), 0) || 0);
        }, 0) || 0;

    return (
        <>
            <TopBar />
            <Header />
            <div style={styles.pageWrapper}>
                <div style={styles.container}>
                    {/* Back Button and Refresh */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                        <button
                            onClick={() => navigate('/my-itineraries')}
                            style={styles.backButton}
                            onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#cbd5e1';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.backgroundColor = '#e2e8f0';
                            }}
                        >
                            ← Back to My Itineraries
                        </button>
                        <button
                            onClick={() => loadItinerary(true)}
                            style={{
                                ...styles.backButton,
                                backgroundColor: '#3b82f6',
                                color: 'white'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#2563eb';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.backgroundColor = '#3b82f6';
                            }}
                            disabled={loading}
                        >
                            🔄 {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>

                    {/* Header Card */}
                    <div style={styles.headerCard}>
                        <div style={styles.headerIcon}>🏖️</div>
                        <h1 style={styles.headerTitle}>Your Perfect Journey to</h1>
                        <h2 style={styles.headerSubtitle}>{destination}</h2>

                        {/* Stats Grid */}
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <div style={styles.statValue}>{totalDays}</div>
                                <div style={styles.statLabel}>Days</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statValue}>{totalActivities}</div>
                                <div style={styles.statLabel}>Activities</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statValue}>{totalCost.toLocaleString()}</div>
                                <div style={styles.statLabel}>VND</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={styles.actionButtons}>
                            <button style={{ ...styles.actionButton, ...styles.saveButton }}>
                                Save to My Trips
                            </button>
                            <button
                                style={styles.actionButton}
                                onClick={handleCustomize}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#f1f5f9';
                                    e.target.style.color = '#3b82f6';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.color = '#475569';
                                }}
                            >
                                {itinerary.status === 'custom' ? 'Edit' : 'Customize'}
                            </button>
                            <button
                                style={styles.actionButton}
                                onClick={handleShare}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#f1f5f9';
                                    e.target.style.color = '#3b82f6';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.color = '#475569';
                                }}
                            >
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Days and Activities */}
                    {itinerary_data && itinerary_data.map((dayData, index) => {
                        const dayNumber = dayData.dayNumber || dayData.day || (index + 1);
                        const dayTheme = dayData.theme || `Day ${dayNumber}`;
                        const activities = dayData.activities || [];
                        const isExpanded = expandedDays.has(dayNumber);
                        const dayCost = dayData.dayTotal || activities.reduce((sum, act) => sum + (act.cost || 0), 0);

                        return (
                            <div key={dayNumber} style={styles.dayCard}>
                                {/* Day Header */}
                                <div
                                    style={styles.dayHeader}
                                    onClick={() => toggleDay(dayNumber)}
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = '#f1f5f9';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = '#f8fafc';
                                    }}
                                >
                                    <div style={styles.dayHeaderContent}>
                                        <div style={styles.dayInfo}>
                                            <div style={styles.dayNumber}>{dayNumber}</div>
                                            <div>
                                                <div style={styles.dayTitle}>
                                                    {dayTheme}
                                                </div>
                                                <div style={styles.dayMeta}>
                                                    <span>📍 {activities.length} activities</span>
                                                    <span>💰 {dayCost.toLocaleString()} VND</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                ...styles.expandIcon,
                                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                                            }}
                                        >
                                            ▼
                                        </div>
                                    </div>
                                </div>

                                {/* Activities List */}
                                {isExpanded && (
                                    <div style={styles.activitiesList}>
                                        {activities.map((activity, actIndex) => (
                                            <div key={actIndex} style={styles.activityCard}>
                                                <div style={styles.activityStep}>
                                                    {actIndex + 1}
                                                </div>

                                                <div style={styles.activityContent}>
                                                    <div style={styles.activityHeader}>
                                                        <div style={styles.activityLeft}>
                                                            {/* Activity Tags */}
                                                            <div style={styles.activityTags}>
                                                                {(activity.timeSlot || activity.time) && (
                                                                    <span style={styles.activityTag}>
                                                                        🕐 {activity.timeSlot || activity.time}
                                                                    </span>
                                                                )}
                                                                {activity.duration && (
                                                                    <span style={styles.activityTag}>
                                                                        ⏱️ {activity.duration} mins
                                                                    </span>
                                                                )}
                                                                {activity.type && (
                                                                    <span style={styles.activityTag}>
                                                                        {activity.type}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Activity Name */}
                                                            <h4 style={styles.activityName}>
                                                                {activity.activity || activity.name || activity.title || 'Activity'}
                                                            </h4>                                                            {/* Location */}
                                                            {activity.location && (
                                                                <div style={styles.activityLocation}>
                                                                    📍 {activity.location}
                                                                </div>
                                                            )}

                                                            {/* Action Buttons */}
                                                            <div style={styles.activityActions}>
                                                                <button
                                                                    style={styles.activityButton}
                                                                    onMouseOver={(e) => {
                                                                        e.target.style.backgroundColor = '#f1f5f9';
                                                                        e.target.style.color = '#3b82f6';
                                                                    }}
                                                                    onMouseOut={(e) => {
                                                                        e.target.style.backgroundColor = 'white';
                                                                        e.target.style.color = '#475569';
                                                                    }}
                                                                >
                                                                    📍 View map
                                                                </button>
                                                                <button
                                                                    style={styles.activityButton}
                                                                    onMouseOver={(e) => {
                                                                        e.target.style.backgroundColor = '#f1f5f9';
                                                                        e.target.style.color = '#3b82f6';
                                                                    }}
                                                                    onMouseOut={(e) => {
                                                                        e.target.style.backgroundColor = 'white';
                                                                        e.target.style.color = '#475569';
                                                                    }}
                                                                >
                                                                    ❤️ Save
                                                                </button>
                                                                <button
                                                                    style={styles.activityButton}
                                                                    onMouseOver={(e) => {
                                                                        e.target.style.backgroundColor = '#f1f5f9';
                                                                        e.target.style.color = '#3b82f6';
                                                                    }}
                                                                    onMouseOut={(e) => {
                                                                        e.target.style.backgroundColor = 'white';
                                                                        e.target.style.color = '#475569';
                                                                    }}
                                                                >
                                                                    ℹ️ Details
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Cost Info */}
                                                        <div style={styles.costInfo}>
                                                            {activity.cost === 0 ? (
                                                                <div style={styles.freeBadge}>
                                                                    FREE
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div style={styles.costAmount}>
                                                                        {activity.cost?.toLocaleString()} VND
                                                                    </div>
                                                                    <div style={styles.costUsd}>
                                                                        ~${(activity.cost / 24000).toFixed(2)} USD
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Travel Tips */}
                    <div style={styles.tipsSection}>
                        <h3 style={styles.tipsTitle}>
                            💡 Travel Tips
                        </h3>
                        <ul style={styles.tipsList}>
                            <li style={styles.tipItem}>
                                <span style={styles.tipIcon}>✓</span>
                                <span>Best visited Oct-Apr: Cool, Dry and Ideal weather to prevent precipitation</span>
                            </li>
                            <li style={styles.tipItem}>
                                <span style={styles.tipIcon}>✓</span>
                                <span>Bring sun safety wear to embrace inclement conditions and harmful rays protective</span>
                            </li>
                            <li style={styles.tipItem}>
                                <span style={styles.tipIcon}>✓</span>
                                <span>Experience local cuisine sounds please respectfully be well-versed street vendor experience</span>
                            </li>
                        </ul>
                    </div>

                    {/* Trip Summary */}
                    <div style={styles.summarySection}>
                        <h3 style={styles.summaryTitle}>🗺️ Trip Summary</h3>
                        <div style={styles.summaryGrid}>
                            <div style={styles.summaryItem}>
                                <span style={{ ...styles.summaryIcon, backgroundColor: '#3b82f6', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                    {totalDays}
                                </span>
                                <span>Total Days</span>
                            </div>
                            <div style={styles.summaryItem}>
                                <span style={{ ...styles.summaryIcon, backgroundColor: '#10b981', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                    ✓
                                </span>
                                <span>Food Area - Beach Areas</span>
                            </div>
                            <div style={styles.summaryItem}>
                                <span style={{ ...styles.summaryIcon, backgroundColor: '#f59e0b', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                    💰
                                </span>
                                <span>Est. Cost: {totalCost.toLocaleString()} VND (~${(totalCost / 24000).toFixed(2)} USD)</span>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div style={styles.ctaSection}>
                        <h3 style={styles.ctaTitle}>Ready to Start Your Adventure?</h3>
                        <p style={styles.ctaText}>
                            Turn this itinerary into reality with our booking services
                        </p>
                        <div style={styles.ctaButtons}>
                            <button
                                style={{ ...styles.ctaButton, ...styles.ctaPrimary }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#ea580c';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#f97316';
                                }}
                            >
                                Book This Trip Now
                            </button>
                            <button
                                style={{ ...styles.ctaButton, ...styles.ctaSecondary }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#f8fafc';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                }}
                            >
                                Contact Gomyport
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ItineraryDetailNew;