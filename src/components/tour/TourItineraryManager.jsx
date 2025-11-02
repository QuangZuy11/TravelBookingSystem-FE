import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
    createTourItinerary,
    getTourItineraries,
    updateTourItinerary,
    deleteTourItinerary
} from '../../services/aiItineraryService';
import TopBar from '../layout/Topbar/Topbar';
import Header from '../layout/Header/Header';
import Footer from '../layout/Footer/Footer';

/**
 * Enhanced Tour Itinerary Management
 * Simplified time+action format for service providers
 */
const TourItineraryManager = () => {
    const { tourId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [tourItineraries, setTourItineraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const [formData, setFormData] = useState({
        day_number: 1,
        title: '',
        description: '',
        activities: [{ time: '08:00', action: '' }]
    });

    useEffect(() => {
        if (tourId && user) {
            loadTourItineraries();
        }
    }, [tourId, user]);

    const loadTourItineraries = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getTourItineraries(tourId);

            if (response.success) {
                setTourItineraries(response.data || []);
            } else {
                throw new Error(response.message || 'Failed to load tour itineraries');
            }
        } catch (err) {
            console.error('❌ Load Tour Itineraries Error:', err);
            setError(err.message || 'Failed to load tour itineraries');
            toast.error(err.message || 'Failed to load tour itineraries');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.title.trim()) {
            toast.error('Please enter a title for this day');
            return;
        }

        if (!formData.day_number || formData.day_number < 1) {
            toast.error('Please enter a valid day number');
            return;
        }

        if (formData.activities.some(act => !act.time || !act.action.trim())) {
            toast.error('Please fill in all activity times and actions');
            return;
        }

        try {
            setSaving(true);

            const submitData = {
                day_number: parseInt(formData.day_number) || 1,
                title: (formData.title || '').trim(),
                description: (formData.description || '').trim(),
                activities: formData.activities.map(act => ({
                    time: act.time || '08:00',
                    action: (act.action || '').trim()
                })).filter(act => act.action) // Remove empty actions
            };

            // Validate tourId
            if (!tourId) {
                toast.error('Tour ID is missing');
                return;
            }

            console.log('🚀 Submitting tour itinerary data:', {
                tourId,
                submitData,
                formData,
                'submitData.origin_id': submitData.origin_id,
                'typeof tourId': typeof tourId
            });

            let response;
            if (editingId) {
                response = await updateTourItinerary(editingId, submitData);
            } else {
                response = await createTourItinerary(tourId, submitData);
            }

            if (response.success) {
                toast.success(editingId ? 'Itinerary updated successfully!' : 'Itinerary created successfully!');
                resetForm();
                loadTourItineraries();
            } else {
                throw new Error(response.message || 'Failed to save itinerary');
            }
        } catch (err) {
            console.error('❌ Save Tour Itinerary Error:', err);
            toast.error(err.message || 'Failed to save tour itinerary');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (itinerary) => {
        setFormData({
            day_number: itinerary.day_number,
            title: itinerary.title,
            description: itinerary.description || '',
            activities: itinerary.activities.length > 0 ? itinerary.activities : [{ time: '08:00', action: '' }]
        });
        setEditingId(itinerary._id);
        setShowAddForm(true);
    };

    const handleDelete = async (itineraryId) => {
        if (!window.confirm('Are you sure you want to delete this day itinerary?')) {
            return;
        }

        try {
            const response = await deleteTourItinerary(itineraryId);

            if (response.success) {
                toast.success('Day itinerary deleted successfully');
                loadTourItineraries();
            } else {
                throw new Error(response.message || 'Failed to delete itinerary');
            }
        } catch (err) {
            console.error('❌ Delete Tour Itinerary Error:', err);
            toast.error(err.message || 'Failed to delete tour itinerary');
        }
    };

    const resetForm = () => {
        setFormData({
            day_number: Math.max(1, ...tourItineraries.map(it => it.day_number), 0) + 1,
            title: '',
            description: '',
            activities: [{ time: '08:00', action: '' }]
        });
        setEditingId(null);
        setShowAddForm(false);
    };

    const addActivity = () => {
        setFormData(prev => ({
            ...prev,
            activities: [...prev.activities, { time: '10:00', action: '' }]
        }));
    };

    const updateActivity = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            activities: prev.activities.map((act, i) =>
                i === index ? { ...act, [field]: value } : act
            )
        }));
    };

    const removeActivity = (index) => {
        if (formData.activities.length <= 1) {
            toast.error('At least one activity is required');
            return;
        }

        setFormData(prev => ({
            ...prev,
            activities: prev.activities.filter((_, i) => i !== index)
        }));
    };

    const styles = {
        pageWrapper: {
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            paddingTop: '140px',
            paddingBottom: '2rem'
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem'
        },
        header: {
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white'
        },
        title: {
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '0.5rem'
        },
        subtitle: {
            fontSize: '1rem',
            opacity: 0.9
        },
        actionBar: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        },
        addButton: {
            padding: '0.75rem 1.5rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        formCard: {
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '1rem',
            alignItems: 'start',
            marginBottom: '1.5rem'
        },
        label: {
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            paddingTop: '0.75rem'
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            transition: 'border-color 0.2s'
        },
        textarea: {
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            resize: 'vertical',
            minHeight: '80px',
            fontFamily: 'inherit'
        },
        activitiesSection: {
            marginBottom: '1.5rem'
        },
        activityCard: {
            backgroundColor: '#f8fafc',
            border: '2px solid #e5e7eb',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '0.75rem'
        },
        activityGrid: {
            display: 'grid',
            gridTemplateColumns: '120px 1fr auto',
            gap: '1rem',
            alignItems: 'center'
        },
        timeInput: {
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            textAlign: 'center',
            fontWeight: '600'
        },
        actionInput: {
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem'
        },
        removeButton: {
            padding: '0.5rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            cursor: 'pointer'
        },
        addActivityButton: {
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        formActions: {
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
        },
        button: (variant = 'primary') => {
            const variants = {
                primary: { backgroundColor: '#10b981', color: 'white' },
                secondary: { backgroundColor: '#6b7280', color: 'white' },
                danger: { backgroundColor: '#ef4444', color: 'white' }
            };

            return {
                ...variants[variant],
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
            };
        },
        itineraryList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        itineraryCard: {
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s'
        },
        dayHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem'
        },
        dayTitle: {
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '0.25rem'
        },
        dayDescription: {
            color: '#6b7280',
            fontSize: '0.875rem'
        },
        cardActions: {
            display: 'flex',
            gap: '0.5rem'
        },
        activityList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        },
        activityItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
        },
        activityTime: {
            fontSize: '0.875rem',
            fontWeight: '700',
            color: '#1f2937',
            backgroundColor: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            minWidth: '60px',
            textAlign: 'center'
        },
        activityAction: {
            flex: 1,
            fontSize: '0.875rem',
            color: '#374151'
        },
        emptyState: {
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
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
            fontWeight: '600'
        }
    };

    if (loading) {
        return (
            <>
                <TopBar />
                <Header />
                <div style={styles.pageWrapper}>
                    <div style={styles.container}>
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                            <p>Loading tour itineraries...</p>
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
                    {/* Header */}
                    <div style={styles.header}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/provider/tours');
                            }}
                            style={styles.backButton}
                        >
                            <span>←</span>
                            <span>Back to Tours</span>
                        </a>

                        <h1 style={styles.title}>
                            🗓️ Tour Itinerary Management
                        </h1>
                        <p style={styles.subtitle}>
                            Create detailed day-by-day schedules for your tour
                        </p>
                    </div>

                    {/* Action Bar */}
                    <div style={styles.actionBar}>
                        <h2 style={{ color: '#1f2937', margin: 0 }}>
                            Daily Itineraries ({tourItineraries.length})
                        </h2>

                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            style={styles.addButton}
                        >
                            <span>+</span>
                            <span>Add New Day</span>
                        </button>
                    </div>

                    {/* Add/Edit Form */}
                    {showAddForm && (
                        <div style={styles.formCard}>
                            <h3 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>
                                {editingId ? '✏️ Edit Day' : '➕ Add New Day'}
                            </h3>

                            <form onSubmit={handleSubmit}>
                                <div style={styles.formGrid}>
                                    <label style={styles.label}>Day Number:</label>
                                    <input
                                        type="number"
                                        value={formData.day_number}
                                        onChange={(e) => setFormData(prev => ({ ...prev, day_number: parseInt(e.target.value) || 1 }))}
                                        min="1"
                                        max="30"
                                        style={styles.input}
                                        required
                                    />

                                    <label style={styles.label}>Day Title:</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g., Day 1: Hanoi City Tour"
                                        style={styles.input}
                                        required
                                    />

                                    <label style={styles.label}>Description:</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe the day's activities and highlights..."
                                        style={styles.textarea}
                                    />
                                </div>

                                {/* Activities Section */}
                                <div style={styles.activitiesSection}>
                                    <h4 style={{ marginBottom: '1rem', color: '#374151' }}>
                                        📋 Daily Schedule
                                    </h4>

                                    {formData.activities.map((activity, index) => (
                                        <div key={index} style={styles.activityCard}>
                                            <div style={styles.activityGrid}>
                                                <input
                                                    type="time"
                                                    value={activity.time}
                                                    onChange={(e) => updateActivity(index, 'time', e.target.value)}
                                                    style={styles.timeInput}
                                                    required
                                                />

                                                <input
                                                    type="text"
                                                    value={activity.action}
                                                    onChange={(e) => updateActivity(index, 'action', e.target.value)}
                                                    placeholder="e.g., Pickup from hotel, Visit Temple of Literature..."
                                                    style={styles.actionInput}
                                                    required
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => removeActivity(index)}
                                                    style={styles.removeButton}
                                                    disabled={formData.activities.length <= 1}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addActivity}
                                        style={styles.addActivityButton}
                                    >
                                        <span>+</span>
                                        <span>Add Activity</span>
                                    </button>
                                </div>

                                {/* Form Actions */}
                                <div style={styles.formActions}>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        style={styles.button('secondary')}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        style={styles.button()}
                                    >
                                        {saving ? '💾 Saving...' : editingId ? '💾 Update Day' : '💾 Save Day'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Itineraries List */}
                    {tourItineraries.length > 0 ? (
                        <div style={styles.itineraryList}>
                            {tourItineraries
                                .sort((a, b) => a.day_number - b.day_number)
                                .map((itinerary) => (
                                    <div key={itinerary._id} style={styles.itineraryCard}>
                                        <div style={styles.dayHeader}>
                                            <div>
                                                <h3 style={styles.dayTitle}>{itinerary.title}</h3>
                                                {itinerary.description && (
                                                    <p style={styles.dayDescription}>{itinerary.description}</p>
                                                )}
                                            </div>

                                            <div style={styles.cardActions}>
                                                <button
                                                    onClick={() => handleEdit(itinerary)}
                                                    style={styles.button('secondary')}
                                                >
                                                    ✏️ Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(itinerary._id)}
                                                    style={styles.button('danger')}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>

                                        <div style={styles.activityList}>
                                            {itinerary.activities?.map((activity, index) => (
                                                <div key={activity._id || index} style={styles.activityItem}>
                                                    <span style={styles.activityTime}>{activity.time}</span>
                                                    <span style={styles.activityAction}>{activity.action}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div style={styles.emptyState}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                            <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>No Itineraries Yet</h3>
                            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                                Start creating day-by-day schedules for your tour
                            </p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                style={styles.addButton}
                            >
                                <span>+</span>
                                <span>Create First Day</span>
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
};

export default TourItineraryManager;