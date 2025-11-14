import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
    getItineraryById,
    getCustomizableItinerary,
    updateCustomizedItinerary,
    deleteActivity,
    reorderActivities
} from '../../services/aiItineraryService';

// Constants
const ACTIVITY_TYPES = ['sightseeing', 'adventure', 'food', 'transport', 'shopping', 'entertainment', 'culture', 'history', 'nature', 'relaxation'];

const ACTIVITY_ICONS = {
    sightseeing: '🏛️',
    adventure: '🧗',
    food: '🍜',
    transport: '🚌',
    shopping: '🛍️',
    entertainment: '🎭',
    culture: '🏛️',
    history: '📜',
    nature: '🌿',
    relaxation: '🧘'
};

const ACTIVITY_LABELS = {
    sightseeing: 'Tham Quan',
    adventure: 'Phiêu Lưu',
    food: 'Ăn Uống',
    transport: 'Di Chuyển',
    shopping: 'Mua Sắm',
    entertainment: 'Giải Trí',
    culture: 'Văn Hóa',
    history: 'Lịch Sử',
    nature: 'Thiên Nhiên',
    relaxation: 'Thư Giãn'
};

// Utility functions
const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0);
};

const calculateTotals = (itinerary_data) => {
    const totalDays = itinerary_data?.length || 0;
    const totalActivities = itinerary_data?.reduce((sum, day) => sum + (day.activities?.length || 0), 0) || 0;
    const totalCost = itinerary_data?.reduce((sum, day) => {
        return sum + (day.activities?.reduce((daySum, act) => daySum + (parseInt(act.cost) || 0), 0) || 0);
    }, 0) || 0;

    return { totalDays, totalActivities, totalCost };
};

const createDefaultActivity = () => ({
    activityId: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    activity: 'New Activity',
    location: '',
    duration: 60,
    cost: 0,
    type: 'sightseeing',
    timeSlot: 'morning',
    time: '09:00',
    userModified: true
});

const createDefaultDay = (dayNumber) => ({
    dayNumber: dayNumber,
    day: dayNumber,
    theme: `Day ${dayNumber}`,
    activities: [],
    dayTotal: 0,
    type: 'custom',
    userModified: true
});

const validateActivity = (activity) => {
    const errors = [];
    if (!activity.activity?.trim()) errors.push('Activity name is required');
    if (!activity.time) errors.push('Time is required');
    return errors;
};

// Debounce utility function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Helper functions to transform API data to Frontend format
const generateActivityName = (activity) => {
    // Generate meaningful activity name from location and type
    if (activity.location) {
        const locationName = activity.location.split(',')[0]; // Get first part of location
        const typeAction = {
            sightseeing: 'Visit',
            adventure: 'Explore',
            food: 'Dine at',
            transport: 'Travel to',
            accommodation: 'Stay at'
        };

        const action = typeAction[activity.type] || 'Visit';
        return `${action} ${locationName}`;
    }

    // Fallback names
    const fallbackNames = {
        sightseeing: 'Sightseeing Activity',
        adventure: 'Adventure Activity',
        food: 'Dining Experience',
        transport: 'Transportation',
        accommodation: 'Accommodation'
    };

    return fallbackNames[activity.type] || 'Activity';
};

const generateTimeFromSlot = (timeSlot, activityIndex = 0) => {
    // Convert timeSlot to specific time
    const timeSlots = {
        morning: ['08:00', '09:00', '10:00', '11:00'],
        afternoon: ['12:00', '13:00', '14:00', '15:00'],
        evening: ['16:00', '17:00', '18:00', '19:00'],
        night: ['20:00', '21:00', '22:00']
    };

    const slots = timeSlots[timeSlot] || timeSlots.morning;
    return slots[activityIndex % slots.length] || slots[0];
};

const convertDurationToString = (durationMinutes) => {
    if (!durationMinutes) return '1 hour';

    if (durationMinutes < 60) {
        return `${durationMinutes} minutes`;
    } else {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;

        if (minutes === 0) {
            return `${hours} hour${hours > 1 ? 's' : ''}`;
        } else {
            return `${hours}h ${minutes}m`;
        }
    }
};
import TopBar from '../layout/Topbar/Topbar';
import Header from '../layout/Header/Header';
import Footer from '../layout/Footer/Footer';

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
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
    },
    headerTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '8px'
    },
    headerSubtitle: {
        fontSize: '16px',
        color: '#64748b',
        marginBottom: '24px'
    },
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px'
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1f2937',
        backgroundColor: 'white',
        transition: 'border-color 0.2s ease',
        boxSizing: 'border-box'
    },
    textarea: {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1f2937',
        backgroundColor: 'white',
        transition: 'border-color 0.2s ease',
        boxSizing: 'border-box',
        minHeight: '80px',
        resize: 'vertical'
    },
    dayCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
    },
    dayHeader: {
        padding: '16px 20px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    dayNumber: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#3b82f6',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '600'
    },
    dayTitleInput: {
        flex: 1,
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: '600'
    },
    activityCard: {
        padding: '16px 20px',
        borderBottom: '1px solid #f1f5f9'
    },
    activityGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: '16px',
        marginBottom: '12px'
    },
    activityNameInput: {
        gridColumn: '1 / -1',
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500'
    },
    smallInput: {
        padding: '6px 10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '13px'
    },
    select: {
        padding: '6px 10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '13px',
        backgroundColor: 'white'
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px',
        marginTop: '16px'
    },
    button: {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    primaryButton: {
        backgroundColor: '#3b82f6',
        color: 'white'
    },
    secondaryButton: {
        backgroundColor: '#e5e7eb',
        color: '#374151'
    },
    dangerButton: {
        backgroundColor: '#ef4444',
        color: 'white'
    },
    successButton: {
        backgroundColor: '#10b981',
        color: 'white'
    },
    addButton: {
        backgroundColor: '#f3f4f6',
        color: '#374151',
        border: '2px dashed #d1d5db',
        padding: '12px',
        width: '100%',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    removeButton: {
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        border: '1px solid #fecaca',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer'
    },
    dragHandle: {
        cursor: 'grab',
        color: '#9ca3af',
        fontSize: '16px',
        padding: '4px'
    },
    errorText: {
        color: '#dc2626',
        fontSize: '12px',
        marginTop: '4px'
    },
    saveStatus: {
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500'
    },
    savedStatus: {
        backgroundColor: '#dcfce7',
        color: '#166534'
    },
    savingStatus: {
        backgroundColor: '#fef3c7',
        color: '#d97706'
    },
    errorStatus: {
        backgroundColor: '#fee2e2',
        color: '#dc2626'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '16px',
        marginTop: '16px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px'
    },
    statCard: {
        textAlign: 'center'
    },
    statValue: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#1e293b'
    },
    statLabel: {
        fontSize: '12px',
        color: '#64748b',
        marginTop: '4px'
    },
    travelTipsCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px',
        border: '1px solid #e2e8f0'
    },
    tipItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        padding: '8px 0',
        borderBottom: '1px solid #f1f5f9'
    },
    tipContent: {
        flex: 1,
        fontSize: '14px',
        color: '#374151'
    },
    tipActions: {
        display: 'flex',
        gap: '4px'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto'
    },
    modalTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: '16px'
    }
};

const ItineraryCustomize = () => {
    const { itineraryId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // State management
    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', 'error'
    const [addingDay, setAddingDay] = useState(false); // Prevent double add operations
    const [customizedAiId, setCustomizedAiId] = useState(null); // NEW: Store customized AI ID
    const [originalAiId, setOriginalAiId] = useState(null); // NEW: Store original AI ID

    // Form data
    const [formData, setFormData] = useState({
        destination: '',
        summary: '',
        itinerary_data: [],
        travel_tips: []
    });

    // Modal states
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [showTipModal, setShowTipModal] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [editingTip, setEditingTip] = useState(null);
    const [currentDayIndex, setCurrentDayIndex] = useState(null);

    // Validation errors
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            toast.error('Please login to customize itinerary');
            setTimeout(() => navigate('/auth'), 2000);
            return;
        }

        loadItinerary();
    }, [itineraryId, user, authLoading, navigate]);

    const loadItinerary = async () => {
        try {
            setLoading(true);
            setError(null);

            // Check if we're already on customize page (URL contains /customize)
            const isCustomizePage = window.location.pathname.includes('/customize');

            let customizeResponse;
            if (isCustomizePage) {
                // If already on customize page, just GET the data (don't initialize new)
                customizeResponse = await getItineraryById(itineraryId);
            } else {
                // If coming from detail page, initialize new customized version
                customizeResponse = await getCustomizableItinerary(itineraryId);

                // Navigate to the customize URL after initialization
                if (customizeResponse.success) {
                    navigate(`/ai-itinerary/${itineraryId}/customize`, { replace: true });
                }
            }

            // Handle different response formats
            const responseSuccess = customizeResponse.success || customizeResponse.data;
            const responseData = customizeResponse.data || customizeResponse;

            if (process.env.NODE_ENV === 'development') {
                console.log('🔍 Customize Response:', { isCustomizePage, responseSuccess, itineraryId });
                console.log('📊 Response data keys:', Object.keys(responseData || {}));
            }

            if (responseSuccess) {
                const data = responseData;
                setItinerary(data);

                // Handle new API structure with itinerary_data
                const rawDays = data.itinerary_data || [];

                // Transform API data to match Frontend expectations
                const transformedDays = rawDays.map((dayData, dayIndex) => {
                    const day = dayData.itinerary || {};
                    return {
                        dayNumber: day.day_number || dayIndex + 1,
                        day: day.day_number || dayIndex + 1,
                        theme: day.title || `Day ${dayIndex + 1}`,
                        description: day.description || '',
                        activities: (dayData.activities || []).map((activity, actIndex) => ({
                            // Map API fields to Frontend expectations
                            activity: activity.activity || generateActivityName(activity),
                            time: generateTimeFromSlot(activity.timeSlot, actIndex),
                            duration: activity.duration ? convertDurationToString(activity.duration) : '2 hours',
                            cost: activity.cost || 0,
                            type: activity.activityType || 'sightseeing',
                            location: activity.location || '',

                            // Keep original data for reference
                            activityId: activity.id || activity._id,
                            _id: activity._id,
                            timeSlot: activity.timeSlot,
                            userModified: activity.userModified || false
                        })),
                        dayTotal: day.day_total || dayData.activities?.reduce((sum, act) => sum + (act.cost || 0), 0) || 0,
                        type: day.type || 'customized',
                        dayId: day._id,
                        originId: day.origin_id,
                        userModified: day.user_modified || false
                    };
                });

                // Initialize form data with correct data structure
                setFormData({
                    destination: data.destination || '',
                    summary: data.summary || '',  // Use summary directly from response
                    itinerary_data: transformedDays,
                    travel_tips: data.travel_tips || [],
                    duration_days: data.duration_days || transformedDays.length,
                    totalCost: data.budget_total || 0
                });

                // Store the customized AI ID for future operations
                setCustomizedAiId(data.aiGeneratedId);
                setOriginalAiId(data.originalAiGeneratedId);
            }
        } catch (err) {
            console.error('❌ Failed to load itinerary:', err);
            setError(err.message || 'Failed to load itinerary');

            // Enhanced error handling for specific error codes
            if (err.message?.includes('ITINERARY_NOT_FOUND')) {
                toast.error('Itinerary not found. It may have been deleted or you may not have access to it.');
                setTimeout(() => navigate('/my-itineraries'), 3000);
            } else if (err.message?.includes('Authentication Error') || err.message?.includes('Access denied')) {
                toast.error(err.message);
            } else if (err.message?.includes('Authentication required')) {
                toast.error('Please login to edit this itinerary');
                setTimeout(() => navigate('/auth'), 2000);
            } else {
                toast.error(err.message || 'Failed to load itinerary');
            }
        } finally {
            setLoading(false);
        }
    };

    // Auto-save with debounce
    const autoSave = useCallback(
        debounce(async (data) => {
            if (!hasChanges) return;

            try {
                setSaving(true);
                setSaveStatus('saving');

                const result = await updateCustomizedItinerary(itineraryId, data);

                setSaveStatus('saved');
                setHasChanges(false);

                // Update local state with server response if needed
                if (result.success && result.data) {
                    setItinerary(result.data);
                }

                setTimeout(() => setSaveStatus(''), 2000);
            } catch (err) {
                console.error('❌ Auto-save failed:', err);
                setSaveStatus('error');

                // Enhanced error handling based on backend documentation
                if (err.message?.includes('Authentication required') || err.message?.includes('Access Denied')) {
                    console.warn('🛡️ Auth issue during auto-save - user session preserved');
                    // Don't show alarming error for auth issues
                } else if (err.message?.includes('ITINERARY_NOT_FOUND')) {
                    toast.error('Itinerary not found. It may have been deleted.');
                } else if (err.message?.includes('Maximum 30 days')) {
                    toast.error('Maximum 30 days allowed per itinerary');
                } else if (err.message?.includes('Maximum 20 activities')) {
                    toast.error('Maximum 20 activities per day allowed');
                } else {
                    toast.error(`Auto-save failed: ${err.message || 'Please try again'}`);
                }

                setTimeout(() => setSaveStatus(''), 5000); // Show error longer
            } finally {
                setSaving(false);
            }
        }, 1000),
        [itineraryId, hasChanges]
    );

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            autoSave(newData);
            return newData;
        });
        setHasChanges(true);
    };

    const handleDayThemeChange = (dayIndex, newTheme) => {
        setFormData(prev => {
            const newData = { ...prev };
            newData.itinerary_data[dayIndex].theme = newTheme;
            autoSave(newData);
            return newData;
        });
        setHasChanges(true);
    };

    const handleActivityChange = (dayIndex, activityIndex, field, value) => {
        setFormData(prev => {
            const newData = { ...prev };
            newData.itinerary_data[dayIndex].activities[activityIndex][field] = value;

            // Convert cost to number
            if (field === 'cost') {
                newData.itinerary_data[dayIndex].activities[activityIndex][field] = parseInt(value) || 0;
            }

            autoSave(newData);
            return newData;
        });
        setHasChanges(true);
    };

    // Add new activity
    const handleAddActivity = (dayIndex) => {
        setCurrentDayIndex(dayIndex);
        setEditingActivity(createDefaultActivity());
        setShowActivityModal(true);
    };

    // Edit existing activity
    const handleEditActivity = (dayIndex, activityIndex) => {
        setCurrentDayIndex(dayIndex);
        setEditingActivity({
            ...formData.itinerary_data[dayIndex].activities[activityIndex],
            index: activityIndex
        });
        setShowActivityModal(true);
    };

    // Save activity from modal
    const handleSaveActivity = async () => {
        const errors = validateActivity(editingActivity);
        if (errors.length > 0) {
            toast.error(errors.join(', '));
            return;
        }

        try {
            setSaving(true);

            if (editingActivity.index !== undefined) {
                // Edit existing activity
                const newData = { ...formData };
                const dayData = newData.itinerary_data[currentDayIndex];
                dayData.activities[editingActivity.index] = { ...editingActivity };
                delete dayData.activities[editingActivity.index].index;

                // Mark as user modified for backend compatibility
                dayData.activities[editingActivity.index].user_modified = true;
                dayData.user_modified = true;

                // Save to backend ONCE
                await updateCustomizedItinerary(itineraryId, newData);

                // Update local state AFTER successful backend save
                setFormData(newData);
                toast.success('Activity updated!');
            } else {
                // Add new activity
                const dayNumber = currentDayIndex + 1; // Convert to 1-based indexing
                const newData = { ...formData };
                const dayData = newData.itinerary_data[currentDayIndex];

                // Generate activity ID in backend format
                const activityId = `activity_${dayNumber}_${dayData.activities.length + 1}`;
                const newActivity = {
                    ...editingActivity,
                    id: activityId,
                    user_modified: true,
                    display_order: dayData.activities.length
                };

                dayData.activities.push(newActivity);
                dayData.user_modified = true;

                // Save to backend ONCE
                await updateCustomizedItinerary(itineraryId, newData);

                // Update local state AFTER successful backend save
                setFormData(newData);
                toast.success('Activity added!');
            }

            setHasChanges(false); // Changes are saved immediately
            setShowActivityModal(false);
            setEditingActivity(null);

        } catch (error) {
            console.error('❌ Failed to save activity:', error);
            toast.error(error.message || 'Failed to save activity');
        } finally {
            setSaving(false);
        }
    };

    // Delete activity
    const handleDeleteActivity = async (dayIndex, activityIndex) => {
        if (!confirm('Are you sure you want to delete this activity?')) return;

        try {
            setSaving(true);

            const activityToDelete = formData.itinerary_data[dayIndex].activities[activityIndex];

            // ✅ Method 1: Use API to delete specific activity (if activity has ID)
            if (activityToDelete.id) {
                try {
                    await deleteActivity(itineraryId, activityToDelete.id);
                } catch (apiError) {
                    console.warn('API delete failed, falling back to full itinerary update:', apiError);
                }
            }

            // ✅ Method 2: Update entire itinerary to reflect deletion
            const newData = { ...formData };
            newData.itinerary_data[dayIndex].activities.splice(activityIndex, 1);

            // Mark day as user modified
            newData.itinerary_data[dayIndex].user_modified = true;

            // Save to backend ONCE
            await updateCustomizedItinerary(itineraryId, newData);

            // Update local state AFTER successful backend save
            setFormData(newData);
            setHasChanges(false); // Changes are saved immediately
            toast.success('Activity deleted!');
        } catch (error) {
            console.error('❌ Failed to delete activity:', error);
            toast.error(error.message || 'Failed to delete activity');
        } finally {
            setSaving(false);
        }
    };

    // Add new day
    const handleAddDay = useCallback(async (e) => {
        // Prevent double execution
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Prevent multiple calls during operations
        if (saving || addingDay) {
            if (process.env.NODE_ENV === 'development') {
                console.log('⏳ Already processing, skipping add day');
            }
            return;
        }

        try {
            setAddingDay(true);
            setSaving(true);
            if (process.env.NODE_ENV === 'development') {
                console.log('➕ Adding new day...');
            }

            // Prepare new data
            const newData = { ...formData };
            const newDayNumber = newData.itinerary_data.length + 1;

            // Check if we already have max days
            if (newDayNumber > 30) {
                toast.error('Maximum 30 days allowed');
                return;
            }

            const newDay = createDefaultDay(newDayNumber);
            newData.itinerary_data.push(newDay);

            if (process.env.NODE_ENV === 'development') {
                console.log(`✅ Adding day ${newDayNumber}:`, newDay);
            }

            // Save to backend ONCE
            await updateCustomizedItinerary(itineraryId, newData);

            // Update local state AFTER successful backend save
            setFormData(newData);
            setHasChanges(false); // Changes are saved immediately
            toast.success('New day added!');

        } catch (error) {
            console.error('❌ Failed to add day:', error);
            toast.error(error.message || 'Failed to add day');
        } finally {
            setSaving(false);
            setAddingDay(false);
        }
    }, [saving, addingDay, formData, itineraryId]);

    // Delete day
    const handleDeleteDay = async (dayIndex) => {
        if (formData.itinerary_data.length <= 1) {
            toast.error('Cannot delete the only day in itinerary');
            return;
        }

        if (!confirm('Are you sure you want to delete this entire day?')) return;

        try {
            setSaving(true);

            // Prepare new data
            const newData = { ...formData };
            newData.itinerary_data.splice(dayIndex, 1);

            // Renumber remaining days
            newData.itinerary_data.forEach((day, index) => {
                day.day = index + 1;
            });

            // Save to backend ONCE
            await updateCustomizedItinerary(itineraryId, newData);

            // Update local state AFTER successful backend save
            setFormData(newData);
            setHasChanges(false); // Changes are saved immediately
            toast.success('Day deleted!');
        } catch (error) {
            console.error('❌ Failed to delete day:', error);
            toast.error(error.message || 'Failed to delete day');
        } finally {
            setSaving(false);
        }
    };

    // Move activity up/down
    const moveActivity = async (dayIndex, activityIndex, direction) => {
        const activities = formData.itinerary_data[dayIndex].activities;
        const newIndex = direction === 'up' ? activityIndex - 1 : activityIndex + 1;

        if (newIndex < 0 || newIndex >= activities.length) return;

        try {
            setSaving(true);

            // Prepare new data with swapped activities
            const newData = { ...formData };
            const activitiesArray = newData.itinerary_data[dayIndex].activities;
            [activitiesArray[activityIndex], activitiesArray[newIndex]] = [activitiesArray[newIndex], activitiesArray[activityIndex]];

            // Mark day as user modified
            newData.itinerary_data[dayIndex].user_modified = true;

            // Save to backend ONCE
            await updateCustomizedItinerary(itineraryId, newData);

            // Update local state AFTER successful backend save
            setFormData(newData);
            setHasChanges(false); // Changes are saved immediately
            toast.success('Activity moved!');
        } catch (error) {
            console.error('❌ Failed to move activity:', error);
            toast.error(error.message || 'Failed to move activity');
        } finally {
            setSaving(false);
        }
    };

    // Travel tips functions
    const handleAddTip = () => {
        setEditingTip({ content: '', category: 'general' });
        setShowTipModal(true);
    };

    const handleEditTip = (tipIndex) => {
        setEditingTip({
            ...formData.travel_tips[tipIndex],
            index: tipIndex
        });
        setShowTipModal(true);
    };

    const handleSaveTip = async () => {
        if (!editingTip.content.trim()) {
            toast.error('Tip content is required');
            return;
        }

        try {
            setSaving(true);

            // Prepare new data
            const newData = { ...formData };

            if (editingTip.index !== undefined) {
                // Edit existing tip
                newData.travel_tips[editingTip.index] = {
                    ...editingTip,
                    id: editingTip.id || `tip_${Date.now()}`
                };
                delete newData.travel_tips[editingTip.index].index;
            } else {
                // Add new tip
                newData.travel_tips.push({
                    ...editingTip,
                    id: `tip_${Date.now()}`
                });
            }

            // Save to backend ONCE
            await updateCustomizedItinerary(itineraryId, newData);

            // Update local state AFTER successful backend save
            setFormData(newData);
            setHasChanges(false); // Changes are saved immediately
            setShowTipModal(false);
            setEditingTip(null);
            toast.success(editingTip.index !== undefined ? 'Tip updated!' : 'Tip added!');
        } catch (error) {
            console.error('❌ Failed to save tip:', error);
            toast.error(error.message || 'Failed to save tip');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTip = async (tipIndex) => {
        if (!confirm('Are you sure you want to delete this tip?')) return;

        try {
            setSaving(true);

            // Prepare new data
            const newData = { ...formData };
            newData.travel_tips.splice(tipIndex, 1);

            // Save to backend ONCE
            await updateCustomizedItinerary(itineraryId, newData);

            // Update local state AFTER successful backend save
            setFormData(newData);
            setHasChanges(false); // Changes are saved immediately
            toast.success('Tip deleted!');
        } catch (error) {
            console.error('❌ Failed to delete tip:', error);
            toast.error(error.message || 'Failed to delete tip');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setSaveStatus('saving');

            // Use customizedAiId if available, otherwise fallback to itineraryId 
            const saveId = customizedAiId || itineraryId;

            if (process.env.NODE_ENV === 'development') {
                console.log('💾 Saving data:', { saveId, customizedAiId, itineraryId, hasChanges });
            }

            const response = await updateCustomizedItinerary(saveId, formData);

            if (response.success) {
                setSaveStatus('saved');
                setHasChanges(false);

                // Update local state with new data
                setItinerary(response.data);

                // Show success message
                toast.success('Itinerary saved successfully!');

                // Force reload the data to get latest changes
                await loadItinerary(true);

                // Get new aiGeneratedId from response and redirect
                const newAiGeneratedId = response.data?._id;
                if (newAiGeneratedId) {
                    setTimeout(() => {
                        navigate(`/ai-itinerary/${newAiGeneratedId}`);
                    }, 1500); // Wait 1.5s for toast to be visible
                }
            } else {
                throw new Error(response.message || 'Failed to save itinerary');
            }

            setTimeout(() => setSaveStatus(''), 2000);
        } catch (err) {
            console.error('Save failed:', err);
            setSaveStatus('error');
            toast.error(err.message || 'Failed to save itinerary');
            setTimeout(() => setSaveStatus(''), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (hasChanges) {
            const confirmLeave = confirm('You have unsaved changes. Are you sure you want to leave?');
            if (!confirmLeave) return;
        }
        // Go back to original itinerary if available, otherwise use current ID
        const backId = originalAiId || itineraryId;
        navigate(`/ai-itinerary/${backId}`);
    };

    if (authLoading || loading) {
        return (
            <>
                <TopBar />
                <Header />
                <div style={styles.pageWrapper}>
                    <div style={styles.container}>
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚙️</div>
                            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                                Đang Tải Giao Diện Tùy Chỉnh
                            </h2>
                            <p style={{ color: '#64748b' }}>Vui lòng chờ...</p>
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
                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
                            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                                Lỗi Tải Lộ Trình
                            </h2>
                            <p style={{ color: '#64748b', marginBottom: '24px' }}>
                                {error || 'Không thể tải lộ trình để chỉnh sửa'}
                            </p>
                            <button
                                onClick={() => navigate(`/ai-itinerary/${itineraryId}`)}
                                style={{
                                    ...styles.button,
                                    ...styles.primaryButton
                                }}
                            >
                                Quay Lại Lộ Trình
                            </button>
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
            <div style={styles.pageWrapper}>
                <div style={styles.container}>
                    {/* Back Button */}
                    <button
                        onClick={handleCancel}
                        style={styles.backButton}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#cbd5e1';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#e2e8f0';
                        }}
                    >
                        ← Quay Lại Lộ Trình
                    </button>

                    {/* Header */}
                    <div style={styles.headerCard}>
                        <h1 style={styles.headerTitle}>Tùy Chỉnh Lộ Trình</h1>
                        <p style={styles.headerSubtitle}>
                            Chỉnh sửa chi tiết kế hoạch, hoạt động và sở thích của bạn
                            {hasChanges && <span style={{ color: '#f59e0b', fontWeight: '600' }}> • Có thay đổi chưa lưu</span>}
                        </p>

                        {/* Basic Info */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Điểm Đến</label>
                            <input
                                type="text"
                                value={formData.destination}
                                onChange={(e) => handleInputChange('destination', e.target.value)}
                                style={styles.input}
                                placeholder="Nhập điểm đến"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Tóm Tắt Chuyến Đi</label>
                            <textarea
                                value={formData.summary}
                                onChange={(e) => handleInputChange('summary', e.target.value)}
                                style={styles.textarea}
                                placeholder="Mô tả chuyến đi hoàn hảo của bạn..."
                                rows="3"
                            />
                        </div>

                        {/* Statistics */}
                        <div style={styles.statsGrid}>
                            {(() => {
                                // ✅ Use new calculate function from service
                                const totals = calculateTotals(formData.itinerary_data);
                                return (
                                    <>
                                        <div style={styles.statCard}>
                                            <div style={styles.statValue}>{totals.totalDays}</div>
                                            <div style={styles.statLabel}>Ngày</div>
                                        </div>
                                        <div style={styles.statCard}>
                                            <div style={styles.statValue}>{totals.totalActivities}</div>
                                            <div style={styles.statLabel}>Hoạt Động</div>
                                        </div>
                                        <div style={styles.statCard}>
                                            <div style={styles.statValue}>{formatVND(totals.totalCost)}</div>
                                            <div style={styles.statLabel}>Tổng Chi Phí</div>
                                        </div>
                                        <div style={styles.statCard}>
                                            <div style={styles.statValue}>~${(totals.totalCost / 24000).toFixed(2)}</div>
                                            <div style={styles.statLabel}>USD</div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Action Buttons & Save Status */}
                        <div style={styles.buttonGroup}>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    ...styles.button,
                                    ...styles.successButton,
                                    opacity: saving ? 0.7 : 1
                                }}
                                onMouseOver={(e) => {
                                    if (!saving) e.target.style.backgroundColor = '#059669';
                                }}
                                onMouseOut={(e) => {
                                    if (!saving) e.target.style.backgroundColor = '#10b981';
                                }}
                            >
                                {saving ? '💾 Đang Lưu...' : '💾 Lưu Thay Đổi'}
                            </button>
                            <button
                                onClick={handleCancel}
                                style={{
                                    ...styles.button,
                                    ...styles.secondaryButton
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#d1d5db';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#e5e7eb';
                                }}
                            >
                                Hủy
                            </button>

                            {/* Save Status Indicator */}
                            {saveStatus && (
                                <div style={{
                                    ...styles.saveStatus,
                                    ...(saveStatus === 'saved' ? styles.savedStatus :
                                        saveStatus === 'saving' ? styles.savingStatus :
                                            styles.errorStatus)
                                }}>
                                    {saveStatus === 'saved' && '✅ Đã Lưu'}
                                    {saveStatus === 'saving' && '⏳ Đang tự động lưu...'}
                                    {saveStatus === 'error' && '❌ Lưu thất bại'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Days and Activities Editor */}
                    {formData.itinerary_data && formData.itinerary_data.map((dayData, dayIndex) => (
                        <div key={dayIndex} style={styles.dayCard}>
                            <div style={styles.dayHeader}>
                                <div style={styles.dayNumber}>{dayData.day}</div>
                                <input
                                    type="text"
                                    value={dayData.theme || ''}
                                    onChange={(e) => handleDayThemeChange(dayIndex, e.target.value)}
                                    style={styles.dayTitleInput}
                                    placeholder="Chủ đề ngày..."
                                />
                                <button
                                    onClick={() => handleDeleteDay(dayIndex)}
                                    style={styles.removeButton}
                                    title="Xóa Ngày"
                                >
                                    🗑️
                                </button>
                            </div>

                            {dayData.activities && dayData.activities.map((activity, actIndex) => (
                                <div key={actIndex} style={styles.activityCard}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <div style={styles.dragHandle}>⋮⋮</div>

                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '16px' }}>{ACTIVITY_ICONS[activity.type] || '📍'}</span>
                                                <input
                                                    type="text"
                                                    value={activity.activity || ''}
                                                    onChange={(e) => handleActivityChange(dayIndex, actIndex, 'activity', e.target.value)}
                                                    style={{ ...styles.activityNameInput, flex: 1 }}
                                                    placeholder="Tên hoạt động..."
                                                />
                                            </div>

                                            <div style={styles.activityGrid}>
                                                <div>
                                                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Thời Gian</label>
                                                    <input
                                                        type="time"
                                                        value={activity.time || ''}
                                                        onChange={(e) => handleActivityChange(dayIndex, actIndex, 'time', e.target.value)}
                                                        style={styles.smallInput}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Thời Lượng</label>
                                                    <input
                                                        type="text"
                                                        value={activity.duration || ''}
                                                        onChange={(e) => handleActivityChange(dayIndex, actIndex, 'duration', e.target.value)}
                                                        style={styles.smallInput}
                                                        placeholder="ví dụ: 2 giờ"
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Chi Phí (VND)</label>
                                                    <input
                                                        type="number"
                                                        value={activity.cost || 0}
                                                        onChange={(e) => handleActivityChange(dayIndex, actIndex, 'cost', parseInt(e.target.value) || 0)}
                                                        style={styles.smallInput}
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Loại</label>
                                                    <select
                                                        value={activity.type || 'other'}
                                                        onChange={(e) => handleActivityChange(dayIndex, actIndex, 'type', e.target.value)}
                                                        style={styles.select}
                                                    >
                                                        {ACTIVITY_TYPES.map(type => (
                                                            <option key={type} value={type}>
                                                                {ACTIVITY_ICONS[type]} {ACTIVITY_LABELS[type]}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '8px' }}>
                                                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Địa Điểm</label>
                                                <input
                                                    type="text"
                                                    value={activity.location || ''}
                                                    onChange={(e) => handleActivityChange(dayIndex, actIndex, 'location', e.target.value)}
                                                    style={styles.input}
                                                    placeholder="Địa điểm hoạt động..."
                                                />
                                            </div>

                                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                <button
                                                    onClick={() => handleEditActivity(dayIndex, actIndex)}
                                                    style={{
                                                        ...styles.button,
                                                        ...styles.secondaryButton,
                                                        fontSize: '12px',
                                                        padding: '4px 8px'
                                                    }}
                                                >
                                                    ✏️ Sửa
                                                </button>
                                                <button
                                                    onClick={() => moveActivity(dayIndex, actIndex, 'up')}
                                                    disabled={actIndex === 0}
                                                    style={{
                                                        ...styles.button,
                                                        ...styles.secondaryButton,
                                                        fontSize: '12px',
                                                        padding: '4px 8px',
                                                        opacity: actIndex === 0 ? 0.5 : 1
                                                    }}
                                                >
                                                    ⬆️
                                                </button>
                                                <button
                                                    onClick={() => moveActivity(dayIndex, actIndex, 'down')}
                                                    disabled={actIndex === dayData.activities.length - 1}
                                                    style={{
                                                        ...styles.button,
                                                        ...styles.secondaryButton,
                                                        fontSize: '12px',
                                                        padding: '4px 8px',
                                                        opacity: actIndex === dayData.activities.length - 1 ? 0.5 : 1
                                                    }}
                                                >
                                                    ⬇️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteActivity(dayIndex, actIndex)}
                                                    style={styles.removeButton}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div style={{ padding: '16px 20px' }}>
                                <button
                                    onClick={() => handleAddActivity(dayIndex)}
                                    style={styles.addButton}
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = '#e5e7eb';
                                        e.target.style.borderColor = '#9ca3af';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = '#f3f4f6';
                                        e.target.style.borderColor = '#d1d5db';
                                    }}
                                >
                                    + Thêm Hoạt Động
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add Day Button */}
                    <div style={{ textAlign: 'center', margin: '20px 0' }}>
                        <button
                            onClick={handleAddDay}
                            disabled={addingDay || saving}
                            style={{
                                ...styles.button,
                                ...styles.primaryButton,
                                padding: '12px 24px',
                                opacity: (addingDay || saving) ? 0.6 : 1,
                                cursor: (addingDay || saving) ? 'not-allowed' : 'pointer'
                            }}
                            onMouseOver={(e) => {
                                if (!addingDay && !saving) {
                                    e.target.style.backgroundColor = '#2563eb';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!addingDay && !saving) {
                                    e.target.style.backgroundColor = '#3b82f6';
                                }
                            }}
                        >
                            {addingDay ? '⏳ Đang thêm...' : '+ Thêm Ngày Mới'}
                        </button>
                    </div>

                    {/* Travel Tips Section */}
                    <div style={styles.travelTipsCard}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={styles.modalTitle}>💡 Mẹo Du Lịch</h3>
                            <button
                                onClick={handleAddTip}
                                style={{
                                    ...styles.button,
                                    ...styles.primaryButton,
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }}
                            >
                                + Thêm Mẹo
                            </button>
                        </div>

                        {formData.travel_tips && formData.travel_tips.map((tip, tipIndex) => (
                            <div key={tip.id || tipIndex} style={styles.tipItem}>
                                <span style={{ color: '#10b981', fontSize: '14px' }}>✓</span>
                                <div style={styles.tipContent}>{tip.content}</div>
                                <div style={styles.tipActions}>
                                    <button
                                        onClick={() => handleEditTip(tipIndex)}
                                        style={{
                                            ...styles.button,
                                            ...styles.secondaryButton,
                                            fontSize: '10px',
                                            padding: '2px 6px'
                                        }}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTip(tipIndex)}
                                        style={{
                                            ...styles.removeButton,
                                            fontSize: '10px',
                                            padding: '2px 6px'
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Activity Modal */}
            {showActivityModal && editingActivity && (
                <div style={styles.modalOverlay} onClick={() => setShowActivityModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 style={styles.modalTitle}>
                            {editingActivity.index !== undefined ? 'Sửa Hoạt Động' : 'Thêm Hoạt Động Mới'}
                        </h3>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Tên Hoạt Động *</label>
                            <input
                                type="text"
                                value={editingActivity.activity || ''}
                                onChange={(e) => setEditingActivity(prev => ({ ...prev, activity: e.target.value }))}
                                style={styles.input}
                                placeholder="Nhập tên hoạt động..."
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Thời Gian *</label>
                                <input
                                    type="time"
                                    value={editingActivity.time || ''}
                                    onChange={(e) => setEditingActivity(prev => ({ ...prev, time: e.target.value }))}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Thời Lượng</label>
                                <input
                                    type="text"
                                    value={editingActivity.duration || ''}
                                    onChange={(e) => setEditingActivity(prev => ({ ...prev, duration: e.target.value }))}
                                    style={styles.input}
                                    placeholder="ví dụ: 2 giờ"
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Địa Điểm</label>
                            <input
                                type="text"
                                value={editingActivity.location || ''}
                                onChange={(e) => setEditingActivity(prev => ({ ...prev, location: e.target.value }))}
                                style={styles.input}
                                placeholder="Địa điểm hoạt động..."
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Chi Phí (VND)</label>
                                <input
                                    type="number"
                                    value={editingActivity.cost || 0}
                                    onChange={(e) => setEditingActivity(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                                    style={styles.input}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Loại</label>
                                <select
                                    value={editingActivity.type || 'other'}
                                    onChange={(e) => setEditingActivity(prev => ({ ...prev, type: e.target.value }))}
                                    style={styles.input}
                                >
                                    {ACTIVITY_TYPES.map(type => (
                                        <option key={type} value={type}>
                                            {ACTIVITY_ICONS[type]} {ACTIVITY_LABELS[type]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mô Tả</label>
                            <textarea
                                value={editingActivity.description || ''}
                                onChange={(e) => setEditingActivity(prev => ({ ...prev, description: e.target.value }))}
                                style={styles.textarea}
                                placeholder="Mô tả hoạt động..."
                                rows="3"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Ghi Chú</label>
                            <textarea
                                value={editingActivity.notes || ''}
                                onChange={(e) => setEditingActivity(prev => ({ ...prev, notes: e.target.value }))}
                                style={styles.textarea}
                                placeholder="Ghi chú cá nhân..."
                                rows="2"
                            />
                        </div>

                        <div style={styles.buttonGroup}>
                            <button
                                onClick={handleSaveActivity}
                                disabled={saving}
                                style={{
                                    ...styles.button,
                                    ...styles.successButton,
                                    opacity: saving ? 0.7 : 1,
                                    cursor: saving ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {saving ? '💾 Đang Lưu...' : '💾 Lưu Hoạt Động'}
                            </button>
                            <button
                                onClick={() => setShowActivityModal(false)}
                                style={{
                                    ...styles.button,
                                    ...styles.secondaryButton
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Travel Tip Modal */}
            {showTipModal && editingTip && (
                <div style={styles.modalOverlay} onClick={() => setShowTipModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 style={styles.modalTitle}>
                            {editingTip.index !== undefined ? 'Sửa Mẹo Du Lịch' : 'Thêm Mẹo Du Lịch Mới'}
                        </h3>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nội Dung Mẹo *</label>
                            <textarea
                                value={editingTip.content || ''}
                                onChange={(e) => setEditingTip(prev => ({ ...prev, content: e.target.value }))}
                                style={styles.textarea}
                                placeholder="Nhập mẹo du lịch của bạn..."
                                rows="4"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Danh Mục</label>
                            <select
                                value={editingTip.category || 'general'}
                                onChange={(e) => setEditingTip(prev => ({ ...prev, category: e.target.value }))}
                                style={styles.input}
                            >
                                <option value="general">Chung</option>
                                <option value="weather">Thời Tiết</option>
                                <option value="safety">An Toàn</option>
                                <option value="food">Ăn Uống</option>
                                <option value="transport">Giao Thông</option>
                                <option value="culture">Văn Hóa</option>
                                <option value="budget">Ngân Sách</option>
                            </select>
                        </div>

                        <div style={styles.buttonGroup}>
                            <button
                                onClick={handleSaveTip}
                                style={{
                                    ...styles.button,
                                    ...styles.successButton
                                }}
                            >
                                💾 Lưu Mẹo
                            </button>
                            <button
                                onClick={() => setShowTipModal(false)}
                                style={{
                                    ...styles.button,
                                    ...styles.secondaryButton
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default ItineraryCustomize;