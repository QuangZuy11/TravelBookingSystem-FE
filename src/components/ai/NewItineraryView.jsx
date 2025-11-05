import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * Enhanced Itinerary View Component
 * Displays AI-generated itinerary with new API structure
 * Supports both original and customized views
 */
const NewItineraryView = ({ data, showActions = true }) => {
    const navigate = useNavigate();
    const [selectedDay, setSelectedDay] = useState(1);

    if (!data) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6b7280'
            }}>
                <span style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}>🤔</span>
                <p>No itinerary data available</p>
            </div>
        );
    }

    const {
        aiGeneratedId,
        destination,
        duration,
        totalCost,
        days = [],
        isOriginal = true,
        isCustomizable = true,
        hasCustomized = false,
        customizedId
    } = data;

    const styles = {
        container: {
            backgroundColor: 'white',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        header: {
            background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
            color: 'white',
            padding: '2rem',
            textAlign: 'center'
        },
        title: {
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '0.5rem'
        },
        subtitle: {
            fontSize: '1rem',
            opacity: 0.9,
            marginBottom: '1rem'
        },
        statsContainer: {
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '1rem'
        },
        statItem: {
            textAlign: 'center'
        },
        statValue: {
            fontSize: '1.5rem',
            fontWeight: '700'
        },
        statLabel: {
            fontSize: '0.875rem',
            opacity: 0.8
        },
        content: {
            padding: '2rem'
        },
        dayNavigation: {
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
        },
        dayButton: (isActive) => ({
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            border: 'none',
            background: isActive
                ? 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)'
                : '#f3f4f6',
            color: isActive ? 'white' : '#374151',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem',
            transition: 'all 0.2s'
        }),
        dayCard: {
            backgroundColor: '#f8fafc',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '1rem'
        },
        dayHeader: {
            marginBottom: '1rem'
        },
        dayTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '0.5rem'
        },
        dayDescription: {
            color: '#6b7280',
            fontSize: '0.875rem'
        },
        activitiesContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        activityCard: {
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
        },
        activityHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.75rem'
        },
        activityName: {
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '0.25rem'
        },
        activityLocation: {
            color: '#6b7280',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
        },
        activityMeta: {
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            marginTop: '0.75rem'
        },
        metaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.875rem',
            color: '#6b7280'
        },
        costBadge: {
            backgroundColor: '#ecfdf5',
            color: '#059669',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '600'
        },
        timeSlotBadge: (timeSlot) => {
            const colors = {
                morning: { bg: '#fef3c7', color: '#d97706' },
                afternoon: { bg: '#dbeafe', color: '#2563eb' },
                evening: { bg: '#ede9fe', color: '#7c3aed' },
                night: { bg: '#f3e8ff', color: '#a855f7' }
            };
            const colorScheme = colors[timeSlot] || colors.morning;

            return {
                backgroundColor: colorScheme.bg,
                color: colorScheme.color,
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '600'
            };
        },
        modifiedBadge: {
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
        },
        daySummary: {
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '0.75rem',
            borderLeft: '4px solid #0ea5e9'
        },
        actionsContainer: {
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            padding: '2rem',
            borderTop: '1px solid #e5e7eb'
        },
        actionButton: (variant = 'primary') => {
            const variants = {
                primary: {
                    background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                    color: 'white',
                    boxShadow: '0 4px 6px rgba(20, 184, 166, 0.3)'
                },
                secondary: {
                    background: 'white',
                    color: '#374151',
                    border: '2px solid #e5e7eb'
                },
                success: {
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)'
                }
            };

            return {
                ...variants[variant],
                padding: '0.875rem 1.5rem',
                borderRadius: '0.75rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            };
        }
    };

    const selectedDayData = days.find(day => day.dayNumber === selectedDay) || days[0];

    const handleCustomize = () => {
        if (hasCustomized && customizedId) {
            navigate(`/ai-itinerary/${customizedId}/customize`);
        } else {
            navigate(`/ai-itinerary/${aiGeneratedId}/customize`);
        }
    };

    const handleViewDetails = () => {
        navigate(`/ai-itinerary/${aiGeneratedId}`);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>
                        🎯 Your Perfect Trip to {destination}
                    </h2>
                    <p style={styles.subtitle}>
                        {isOriginal ? '✨ AI-Generated Itinerary' : '🎨 Customized Version'}
                    </p>
                </div>

                <div style={styles.statsContainer}>
                    <div style={styles.statItem}>
                        <div style={styles.statValue}>{duration || days.length}</div>
                        <div style={styles.statLabel}>Days</div>
                    </div>
                    <div style={styles.statItem}>
                        <div style={styles.statValue}>{days.reduce((sum, day) => sum + (day.activities?.length || 0), 0)}</div>
                        <div style={styles.statLabel}>Activities</div>
                    </div>
                    <div style={styles.statItem}>
                        <div style={styles.statValue}>
                            {totalCost ? formatCurrency(totalCost).replace('₫', '') : 'N/A'}
                        </div>
                        <div style={styles.statLabel}>Total Cost</div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={styles.content}>
                {/* Day Navigation */}
                {days.length > 1 && (
                    <div style={styles.dayNavigation}>
                        {days.map((day, index) => (
                            <button
                                key={day.dayNumber || index + 1}
                                onClick={() => setSelectedDay(day.dayNumber || index + 1)}
                                style={styles.dayButton(selectedDay === (day.dayNumber || index + 1))}
                                onMouseEnter={(e) => {
                                    if (selectedDay !== (day.dayNumber || index + 1)) {
                                        e.target.style.backgroundColor = '#e5e7eb';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedDay !== (day.dayNumber || index + 1)) {
                                        e.target.style.backgroundColor = '#f3f4f6';
                                    }
                                }}
                            >
                                Day {day.dayNumber || index + 1}
                            </button>
                        ))}
                    </div>
                )}

                {/* Selected Day Content */}
                {selectedDayData && (
                    <div style={styles.dayCard}>
                        <div style={styles.dayHeader}>
                            <h3 style={styles.dayTitle}>
                                Day {selectedDayData.dayNumber}: {selectedDayData.theme || 'Adventures Await'}
                            </h3>
                            {selectedDayData.description && (
                                <p style={styles.dayDescription}>{selectedDayData.description}</p>
                            )}
                        </div>

                        {/* Activities */}
                        <div style={styles.activitiesContainer}>
                            {selectedDayData.activities?.map((activity, index) => (
                                <div key={activity.activityId || activity._id || index} style={styles.activityCard}>
                                    <div style={styles.activityHeader}>
                                        <div>
                                            <h4 style={styles.activityName}>{activity.activity}</h4>
                                            {activity.location && (
                                                <div style={styles.activityLocation}>
                                                    <span>📍</span>
                                                    <span>{activity.location}</span>
                                                </div>
                                            )}
                                        </div>
                                        {activity.userModified && (
                                            <div style={styles.modifiedBadge}>
                                                <span>✏️</span>
                                                <span>Modified</span>
                                            </div>
                                        )}
                                    </div>

                                    <div style={styles.activityMeta}>
                                        {activity.timeSlot && (
                                            <div style={styles.timeSlotBadge(activity.timeSlot)}>
                                                {activity.timeSlot.charAt(0).toUpperCase() + activity.timeSlot.slice(1)}
                                            </div>
                                        )}
                                        {activity.duration && (
                                            <div style={styles.metaItem}>
                                                <span>⏰</span>
                                                <span>{activity.duration} minutes</span>
                                            </div>
                                        )}
                                        {activity.activityType && (
                                            <div style={styles.metaItem}>
                                                <span>🎯</span>
                                                <span>{activity.activityType}</span>
                                            </div>
                                        )}
                                        {activity.cost > 0 && (
                                            <div style={styles.costBadge}>
                                                💰 {formatCurrency(activity.cost)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Day Summary */}
                        {selectedDayData.dayTotal > 0 && (
                            <div style={styles.daySummary}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600', color: '#0369a1' }}>
                                        📊 Day {selectedDayData.dayNumber} Total:
                                    </span>
                                    <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0369a1' }}>
                                        {formatCurrency(selectedDayData.dayTotal)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            {showActions && (
                <div style={styles.actionsContainer}>
                    <button
                        onClick={handleViewDetails}
                        style={styles.actionButton('secondary')}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        <span>👁️</span>
                        <span>View Details</span>
                    </button>

                    {isCustomizable && (
                        <button
                            onClick={handleCustomize}
                            style={styles.actionButton(hasCustomized ? 'success' : 'primary')}
                            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            <span>{hasCustomized ? '🎨' : '✏️'}</span>
                            <span>{hasCustomized ? 'View Customized' : 'Customize Itinerary'}</span>
                        </button>
                    )}

                    <button
                        onClick={() => {
                            navigator.share?.({
                                title: `My ${destination} Itinerary`,
                                text: `Check out my perfect ${duration}-day trip to ${destination}!`,
                                url: window.location.href
                            }).catch(() => {
                                // Fallback - copy to clipboard
                                navigator.clipboard.writeText(window.location.href);
                                toast.success('Link copied to clipboard!');
                            });
                        }}
                        style={styles.actionButton('secondary')}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        <span>📤</span>
                        <span>Share</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default NewItineraryView;