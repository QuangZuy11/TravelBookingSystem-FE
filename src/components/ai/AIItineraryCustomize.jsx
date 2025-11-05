import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { getCustomizableItinerary, updateCustomizedItinerary } from '../../services/aiItineraryService';
import TopBar from '../layout/Topbar/Topbar';
import Header from '../layout/Header/Header';
import Footer from '../layout/Footer/Footer';

/**
 * Enhanced AI Itinerary Customization Page
 * Features: Auto-save, debouncing, real-time updates, user modification tracking
 */
const AIItineraryCustomize = () => {
    const { aiGeneratedId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [itinerary, setItinerary] = useState(null);
    const [formData, setFormData] = useState({
        summary: '',
        itinerary_data: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', 'error'
    const [hasChanges, setHasChanges] = useState(false);
    const [error, setError] = useState(null);

    // Initialize customization
    useEffect(() => {
        const initializeCustomization = async () => {
            if (!aiGeneratedId) {
                setError('ID lộ trình không hợp lệ');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await getCustomizableItinerary(aiGeneratedId);

                if (response.success && response.data) {
                    setItinerary(response.data);
                    setFormData({
                        summary: response.data.summary || '',
                        itinerary_data: response.data.days || []
                    });
                } else {
                    throw new Error(response.message || 'Không thể tải lộ trình tùy chỉnh');
                }
            } catch (err) {
                console.error('❌ Initialization Error:', err);
                setError(err.message || 'Không thể khởi tạo tùy chỉnh');
                toast.error(err.message || 'Không thể tải lộ trình để tùy chỉnh');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            initializeCustomization();
        }
    }, [aiGeneratedId, user]);

    // Auto-save with debouncing
    const autoSave = useCallback(
        debounce(async (data) => {
            if (!hasChanges) return;

            try {
                setSaving(true);
                setSaveStatus('saving');

                const response = await updateCustomizedItinerary(itinerary.aiGeneratedId, data);

                if (response.success) {
                    setSaveStatus('saved');
                    setHasChanges(false);

                    // Update itinerary with latest data
                    if (response.data) {
                        setItinerary(prev => ({ ...prev, ...response.data }));
                    }
                } else {
                    throw new Error(response.message || 'Lưu không thành công');
                }
            } catch (error) {
                console.error('❌ Auto-save Error:', error);
                setSaveStatus('error');
                toast.error(error.message || 'Không thể tự động lưu thay đổi');
            } finally {
                setSaving(false);
                setTimeout(() => setSaveStatus(''), 2000);
            }
        }, 1000),
        [itinerary?.aiGeneratedId, hasChanges]
    );

    // Trigger auto-save when formData changes
    useEffect(() => {
        if (hasChanges && formData.itinerary_data.length > 0) {
            autoSave(formData);
        }
    }, [formData, hasChanges, autoSave]);

    // Update summary
    const handleSummaryChange = (newSummary) => {
        setFormData(prev => ({
            ...prev,
            summary: newSummary
        }));
        setHasChanges(true);
    };

    // Update day details
    const handleDayUpdate = (dayIndex, updates) => {
        setFormData(prev => {
            const newData = { ...prev };
            newData.itinerary_data = [...newData.itinerary_data];
            newData.itinerary_data[dayIndex] = {
                ...newData.itinerary_data[dayIndex],
                ...updates,
                userModified: true
            };
            return newData;
        });
        setHasChanges(true);
    };

    // Update activity
    const handleActivityUpdate = (dayIndex, activityIndex, updates) => {
        setFormData(prev => {
            const newData = { ...prev };
            newData.itinerary_data = [...newData.itinerary_data];
            const day = { ...newData.itinerary_data[dayIndex] };
            day.activities = [...day.activities];
            day.activities[activityIndex] = {
                ...day.activities[activityIndex],
                ...updates,
                userModified: true
            };

            // Recalculate day total
            day.dayTotal = day.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);

            newData.itinerary_data[dayIndex] = day;
            return newData;
        });
        setHasChanges(true);
    };

    // Add new activity
    const handleAddActivity = (dayIndex) => {
        const newActivity = {
            activityId: `activity_${Date.now()}`,
            activity: 'New Activity',
            location: 'Add location',
            timeSlot: 'morning',
            duration: 60,
            cost: 0,
            activityType: 'sightseeing',
            userModified: true
        };

        setFormData(prev => {
            const newData = { ...prev };
            newData.itinerary_data = [...newData.itinerary_data];
            const day = { ...newData.itinerary_data[dayIndex] };
            day.activities = [...day.activities, newActivity];
            day.dayTotal = day.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
            newData.itinerary_data[dayIndex] = day;
            return newData;
        });
        setHasChanges(true);
    };

    // Remove activity
    const handleRemoveActivity = (dayIndex, activityIndex) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa hoạt động này?')) {
            return;
        }

        setFormData(prev => {
            const newData = { ...prev };
            newData.itinerary_data = [...newData.itinerary_data];
            const day = { ...newData.itinerary_data[dayIndex] };
            day.activities = day.activities.filter((_, index) => index !== activityIndex);
            day.dayTotal = day.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
            newData.itinerary_data[dayIndex] = day;
            return newData;
        });
        setHasChanges(true);
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
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
        saveStatus: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
        },
        summaryCard: {
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        summaryInput: {
            width: '100%',
            padding: '1rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            resize: 'vertical',
            minHeight: '80px',
            fontFamily: 'inherit'
        },
        dayCard: {
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        dayHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.5rem'
        },
        dayTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937'
        },
        dayInput: {
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            marginBottom: '0.5rem'
        },
        activityCard: {
            backgroundColor: '#f8fafc',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '1rem',
            border: '2px solid #e5e7eb',
            position: 'relative'
        },
        modifiedBadge: {
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            backgroundColor: '#fbbf24',
            color: '#92400e',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: '600'
        },
        activityGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 200px 100px 120px',
            gap: '1rem',
            alignItems: 'center'
        },
        input: {
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem'
        },
        select: {
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            backgroundColor: 'white'
        },
        button: (variant = 'primary') => {
            const variants = {
                primary: {
                    backgroundColor: '#10b981',
                    color: 'white'
                },
                secondary: {
                    backgroundColor: '#6b7280',
                    color: 'white'
                },
                danger: {
                    backgroundColor: '#ef4444',
                    color: 'white'
                },
                add: {
                    backgroundColor: '#3b82f6',
                    color: 'white'
                }
            };

            return {
                ...variants[variant],
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
            };
        },
        daySummary: {
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '0.75rem',
            borderLeft: '4px solid #0ea5e9'
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
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚙️</div>
                            <p style={{ color: '#6b7280' }}>Đang tải giao diện tùy chỉnh...</p>
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
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
                            <h2 style={{ color: '#1f2937', marginBottom: '1rem' }}>Lỗi tùy chỉnh</h2>
                            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{error}</p>
                            <button
                                onClick={() => navigate('/my-itineraries')}
                                style={styles.button()}
                            >
                                Quay lại lộ trình của tôi
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getSaveStatusDisplay = () => {
        switch (saveStatus) {
            case 'saving':
                return (
                    <div style={{ ...styles.saveStatus, color: '#f59e0b' }}>
                        <span>⏳</span>
                        <span>Đang lưu thay đổi...</span>
                    </div>
                );
            case 'saved':
                return (
                    <div style={{ ...styles.saveStatus, color: '#10b981' }}>
                        <span>✅</span>
                        <span>Đã tự động lưu thay đổi</span>
                    </div>
                );
            case 'error':
                return (
                    <div style={{ ...styles.saveStatus, color: '#ef4444' }}>
                        <span>❌</span>
                        <span>Không thể lưu thay đổi</span>
                    </div>
                );
            default:
                return hasChanges ? (
                    <div style={{ ...styles.saveStatus, color: '#6b7280' }}>
                        <span>💾</span>
                        <span>Thay đổi sẽ được tự động lưu</span>
                    </div>
                ) : null;
        }
    };

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
                                navigate(`/ai-itinerary/${itinerary.originalAiGeneratedId || aiGeneratedId}`);
                            }}
                            style={styles.backButton}
                        >
                            <span>←</span>
                            <span>Quay lại chi tiết</span>
                        </a>

                        <h1 style={styles.title}>
                            🎨 Tùy chỉnh chuyến đi {itinerary?.destination} của bạn
                        </h1>
                        <p style={styles.subtitle}>
                            {itinerary?.isOriginal ? 'Đang tạo phiên bản tùy chỉnh...' : 'Đang chỉnh sửa phiên bản tùy chỉnh'}
                        </p>

                        {getSaveStatusDisplay()}
                    </div>

                    {/* Summary Customization */}
                    <div style={styles.summaryCard}>
                        <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>📝 Tóm tắt chuyến đi</h3>
                        <textarea
                            value={formData.summary}
                            onChange={(e) => handleSummaryChange(e.target.value)}
                            placeholder="Mô tả chuyến đi hoàn hảo của bạn..."
                            style={styles.summaryInput}
                        />
                    </div>

                    {/* Days Customization */}
                    {formData.itinerary_data.map((day, dayIndex) => (
                        <div key={day.dayId || dayIndex} style={styles.dayCard}>
                            <div style={styles.dayHeader}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={styles.dayTitle}>Day {day.dayNumber}</h3>
                                    <input
                                        type="text"
                                        value={day.theme || ''}
                                        onChange={(e) => handleDayUpdate(dayIndex, { theme: e.target.value })}
                                        placeholder="Day theme (e.g., 'Exploring Nature')"
                                        style={styles.dayInput}
                                    />
                                    <textarea
                                        value={day.description || ''}
                                        onChange={(e) => handleDayUpdate(dayIndex, { description: e.target.value })}
                                        placeholder="Day description..."
                                        style={styles.dayInput}
                                        rows={2}
                                    />
                                </div>
                            </div>

                            {/* Activities */}
                            <div>
                                <h4 style={{ marginBottom: '1rem', color: '#374151' }}>🎯 Các hoạt động</h4>

                                {day.activities?.map((activity, activityIndex) => (
                                    <div key={activity.activityId || activityIndex} style={styles.activityCard}>
                                        {activity.userModified && (
                                            <div style={styles.modifiedBadge}>✏️ Đã sửa</div>
                                        )}

                                        <div style={styles.activityGrid}>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={activity.activity || ''}
                                                    onChange={(e) => handleActivityUpdate(dayIndex, activityIndex, { activity: e.target.value })}
                                                    placeholder="Tên hoạt động"
                                                    style={styles.input}
                                                />
                                                <input
                                                    type="text"
                                                    value={activity.location || ''}
                                                    onChange={(e) => handleActivityUpdate(dayIndex, activityIndex, { location: e.target.value })}
                                                    placeholder="Địa điểm"
                                                    style={{ ...styles.input, marginTop: '0.5rem' }}
                                                />
                                            </div>

                                            <select
                                                value={activity.timeSlot || 'morning'}
                                                onChange={(e) => handleActivityUpdate(dayIndex, activityIndex, { timeSlot: e.target.value })}
                                                style={styles.select}
                                            >
                                                <option value="morning">Buổi sáng</option>
                                                <option value="afternoon">Buổi chiều</option>
                                                <option value="evening">Buổi tối</option>
                                                <option value="night">Đêm</option>
                                            </select>

                                            <input
                                                type="number"
                                                value={activity.duration || 60}
                                                onChange={(e) => handleActivityUpdate(dayIndex, activityIndex, { duration: parseInt(e.target.value) || 60 })}
                                                placeholder="Minutes"
                                                style={styles.input}
                                                min="15"
                                                step="15"
                                            />

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <input
                                                    type="number"
                                                    value={activity.cost || 0}
                                                    onChange={(e) => handleActivityUpdate(dayIndex, activityIndex, { cost: parseInt(e.target.value) || 0 })}
                                                    placeholder="Cost (VND)"
                                                    style={styles.input}
                                                    min="0"
                                                />
                                                <button
                                                    onClick={() => handleRemoveActivity(dayIndex, activityIndex)}
                                                    style={styles.button('danger')}
                                                >
                                                    🗑️ Xóa
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Activity Button */}
                                <button
                                    onClick={() => handleAddActivity(dayIndex)}
                                    style={styles.button('add')}
                                >
                                    ➕ Thêm hoạt động
                                </button>
                            </div>

                            {/* Day Summary */}
                            {day.dayTotal > 0 && (
                                <div style={styles.daySummary}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', color: '#0369a1' }}>
                                            📊 Day {day.dayNumber} Total:
                                        </span>
                                        <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0369a1' }}>
                                            {formatCurrency(day.dayTotal)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </>
    );
};

export default AIItineraryCustomize;