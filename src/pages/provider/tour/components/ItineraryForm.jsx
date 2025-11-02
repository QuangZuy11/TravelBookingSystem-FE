/**
 * Updated ItineraryForm Component
 * Now uses new aiItineraryService.js with Tour API endpoints
 * Simplified time+action format matching API structure
 */
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    createTourItinerary,
    getTourItineraries,
    updateTourItinerary,
    deleteTourItinerary
} from '../../../../services/aiItineraryService';
import './ItineraryForm.css'; const ItineraryForm = ({ tourId, basicInfo, existingItineraries = [], isEditMode, onNext, onBack }) => {
    const [itineraries, setItineraries] = useState(existingItineraries);
    const [currentDay, setCurrentDay] = useState(1);
    const [formData, setFormData] = useState({
        day_number: 1,
        title: '',
        description: '',
        activities: [{ time: '08:00', action: '' }]
    });

    // Local state để track changes without losing data
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Debug: Log formData changes
    useEffect(() => {
        console.log('📋 FormData changed:', {
            day: formData.day_number,
            title: formData.title,
            activitiesCount: formData.activities?.length || 0,
            activities: formData.activities,
            hasUnsavedChanges
        });
    }, [formData, hasUnsavedChanges]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingActivityIndex, setDeletingActivityIndex] = useState(null);

    // Load existing itineraries when component mounts
    useEffect(() => {
        if (tourId && isEditMode) {
            loadExistingItineraries();
        } else if (existingItineraries.length > 0) {
            setItineraries(existingItineraries);
            loadDay(1);
        }
    }, [tourId, existingItineraries, isEditMode]);

    // Ensure there's always at least one activity
    useEffect(() => {
        if (!formData.activities || formData.activities.length === 0) {
            console.log('🔧 Auto-adding default activity - activities were empty');
            setFormData(prev => ({
                ...prev,
                activities: [{ time: '08:00', action: '' }]
            }));
        }
    }, [formData.activities]);

    // Load existing itineraries from API
    const loadExistingItineraries = async () => {
        try {
            setLoading(true);
            const response = await getTourItineraries(tourId);

            if (response.success && response.data) {
                setItineraries(response.data);
                if (response.data.length > 0) {
                    loadDay(1);
                }
            }
        } catch (error) {
            console.error('❌ Load Existing Itineraries Error:', error);
            toast.error('Failed to load existing itineraries');
        } finally {
            setLoading(false);
        }
    };

    // Parse số ngày từ duration string "X ngày Y đêm"
    const parseDaysFromDuration = (durationString) => {
        if (!durationString) return 1;

        // Tìm số trước chữ "ngày"
        const match = durationString.match(/(\d+)\s*ngày/i);
        if (match && match[1]) {
            return parseInt(match[1], 10);
        }

        // Fallback: nếu có duration_hours (cho backward compatibility)
        if (basicInfo?.duration_hours) {
            return Math.ceil(basicInfo.duration_hours / 24);
        }

        return 1; // Default
    };

    // Tính số ngày tối đa từ duration string
    const maxDays = parseDaysFromDuration(basicInfo?.duration);

    console.log('📅 Duration Info:', {
        durationString: basicInfo?.duration,
        maxDays,
        currentDay
    });

    const handleAddActivity = () => {
        setFormData(prev => ({
            ...prev,
            activities: [...prev.activities, {
                time: '10:00',
                action: ''
            }]
        }));
    };

    const handleActivityChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            activities: prev.activities.map((activity, i) =>
                i === index ? { ...activity, [field]: value } : activity
            )
        }));
        setHasUnsavedChanges(true);
    };

    // Track title và description changes
    const handleFormFieldChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setHasUnsavedChanges(true);
    };

    const handleRemoveActivity = (index) => {
        // Prevent removing the last activity
        if (formData.activities.length <= 1) {
            toast.error('Phải có ít nhất 1 hoạt động trong ngày!');
            return;
        }

        // Prevent rapid multiple clicks
        if (deletingActivityIndex === index) {
            console.log('⚠️ Already deleting this activity, ignoring...');
            return;
        }

        setDeletingActivityIndex(index);

        // Xóa activity đơn giản khỏi state
        setFormData(prev => ({
            ...prev,
            activities: prev.activities.filter((_, i) => i !== index)
        }));

        // Reset delete lock after a short delay
        setTimeout(() => setDeletingActivityIndex(null), 300);
    };



    // Validate activities - simplified format (time + action)
    const validateActivities = (activities) => {
        const validActivities = activities.filter(act => act.time?.trim() && act.action?.trim());
        if (validActivities.length === 0) {
            toast.error('Phải có ít nhất 1 hoạt động với thời gian và hành động');
            return false;
        }
        return true;
    };

    const saveCurrentItinerary = async (preventFormReset = false) => {
        console.log('💾 saveCurrentItinerary called with formData:', formData);

        if (!formData.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề cho ngày này');
            return false;
        }

        if (!formData.activities || formData.activities.length === 0) {
            toast.error('Phải có ít nhất 1 hoạt động');
            return false;
        }

        // Validate activities - simplified format
        if (!validateActivities(formData.activities)) {
            return false;
        }

        const validActivities = formData.activities.filter(act => act.time?.trim() && act.action?.trim());

        if (validActivities.length === 0) {
            toast.error('Phải có ít nhất 1 hoạt động hợp lệ (có thời gian và nội dung)');
            return false;
        }

        setSaving(true);

        try {
            // Check if this day already exists
            const existingItinerary = itineraries.find(it => it.day_number === formData.day_number);

            const itineraryData = {
                day_number: formData.day_number,
                title: formData.title.trim(),
                description: formData.description?.trim() || '',
                activities: validActivities
            };

            console.log('📤 Sending itinerary data:', itineraryData);

            let response;

            if (existingItinerary && existingItinerary._id) {
                // UPDATE existing itinerary using new service
                console.log('🔄 Updating existing itinerary:', existingItinerary._id);
                response = await updateTourItinerary(existingItinerary._id, itineraryData);
            } else {
                // CREATE new itinerary using new service
                console.log('✨ Creating new itinerary for tour:', tourId);
                response = await createTourItinerary(tourId, itineraryData);
            }

            if (response.success) {
                const savedItinerary = response.data;
                console.log('✅ Saved itinerary:', savedItinerary);

                // Update itineraries state immediately
                let updatedItineraries;
                if (existingItinerary) {
                    // Update existing
                    updatedItineraries = itineraries.map(it =>
                        it.day_number === formData.day_number ? savedItinerary : it
                    );
                } else {
                    // Add new
                    updatedItineraries = [...itineraries, savedItinerary];
                }

                setItineraries(updatedItineraries);

                // Update form data với saved data (không reset)
                if (!preventFormReset) {
                    setFormData({
                        _id: savedItinerary._id,
                        day_number: savedItinerary.day_number,
                        title: savedItinerary.title,
                        description: savedItinerary.description,
                        activities: savedItinerary.activities.length > 0
                            ? savedItinerary.activities
                            : [{ time: '08:00', action: '' }]
                    });
                }

                setHasUnsavedChanges(false);
                toast.success(`Đã ${existingItinerary ? 'cập nhật' : 'lưu'} ngày ${formData.day_number}`);
                return true;
            } else {
                throw new Error(response.message || 'Failed to save itinerary');
            }
        } catch (error) {
            console.error('❌ Save Itinerary Error:', error);
            toast.error(error.message || 'Không thể lưu lịch trình. Vui lòng thử lại!');
            return false;
        } finally {
            setSaving(false);
        }
    };

    // Thêm button "Lưu ngày hiện tại"
    const handleSaveCurrentDay = async () => {
        const success = await saveCurrentItinerary();
        if (success) {
            // Không reset form, chỉ update với saved data
            console.log('✅ Current day saved successfully');
        }
    };

    const handleAddDay = async () => {
        console.log('🔄 handleAddDay - Current formData:', formData);

        // Kiểm tra có unsaved changes không
        if (hasUnsavedChanges) {
            toast.error('Vui lòng lưu ngày hiện tại trước khi thêm ngày mới!');
            return;
        }

        // Tìm số ngày tiếp theo chưa được tạo
        let nextDay = 1;
        while (itineraries.some(it => it.day_number === nextDay) && nextDay <= maxDays) {
            nextDay++;
        }

        // Kiểm tra số ngày tối đa
        if (nextDay > maxDays) {
            toast.error(`Tour chỉ có ${maxDays} ngày (${basicInfo?.duration || 'N/A'}). Không thể thêm ngày mới!`);
            return;
        }

        console.log(`🆕 Creating new day ${nextDay}`);

        // Load ngày mới với activities mặc định
        setCurrentDay(nextDay);

        // Set form data cho ngày mới
        const newFormData = {
            day_number: nextDay,
            title: '',
            description: '',
            activities: [{ time: '08:00', action: '' }]
        };

        setFormData(newFormData);
        setHasUnsavedChanges(false);

        console.log('📋 New day form data set:', newFormData);
        toast.success(`Đã tạo ngày ${nextDay}! Hãy điền thông tin lịch trình.`);
    }; const handleFinish = async () => {
        // Kiểm tra ngày hiện tại có dữ liệu hợp lệ không
        const hasCurrentDayData = formData.title.trim() && formData.activities.some(act => act.time.trim() && act.action.trim());

        if (itineraries.length === 0 && !hasCurrentDayData) {
            toast.error('Phải có ít nhất 1 ngày lịch trình với hoạt động hợp lệ!');
            return;
        }

        // Nếu ngày hiện tại có dữ liệu, lưu nó trước
        if (hasCurrentDayData) {
            const success = await saveCurrentItinerary();
            if (!success) return;
        }

        onNext({ itineraries: hasCurrentDayData ? [...itineraries] : itineraries });
    };

    // Load itinerary data for selected day
    const loadDay = async (dayNumber) => {
        // Kiểm tra có unsaved changes không
        if (hasUnsavedChanges) {
            const confirmed = window.confirm(
                `Bạn có thay đổi chưa được lưu cho ngày ${currentDay}. Bạn có muốn lưu trước khi chuyển sang ngày ${dayNumber} không?\n\n` +
                `• Chọn "OK" để lưu và chuyển\n` +
                `• Chọn "Hủy" để bỏ thay đổi và chuyển`
            );

            if (confirmed) {
                const success = await saveCurrentItinerary();
                if (!success) {
                    toast.error('Không thể lưu ngày hiện tại. Vui lòng thử lại!');
                    return;
                }
            } else {
                // User chose to discard changes
                setHasUnsavedChanges(false);
            }
        }

        const itinerary = itineraries.find(it => it.day_number === dayNumber);

        let newFormData;
        if (itinerary) {
            newFormData = {
                _id: itinerary._id,
                day_number: dayNumber,
                title: itinerary.title || '',
                description: itinerary.description || '',
                activities: Array.isArray(itinerary.activities) && itinerary.activities.length > 0
                    ? itinerary.activities
                    : [{ time: '08:00', action: '' }]
            };
        } else {
            // New day - initialize with default activity
            newFormData = {
                day_number: dayNumber,
                title: '',
                description: '',
                activities: [{ time: '08:00', action: '' }]
            };
        }

        setCurrentDay(dayNumber);
        setFormData(newFormData);
        setHasUnsavedChanges(false);

        console.log('� Loaded day', dayNumber, 'with data:', newFormData);
        toast.info(`Đã chuyển sang ngày ${dayNumber}`);
    };    // Delete a saved day using new service
    const handleDeleteDay = async (dayNumber) => {
        const itinerary = itineraries.find(it => it.day_number === dayNumber);
        if (!itinerary || !itinerary._id) return;

        if (!confirm(`Bạn có chắc muốn xóa Ngày ${dayNumber}?`)) return;

        try {
            setLoading(true);

            // Delete itinerary using new service
            const response = await deleteTourItinerary(itinerary._id);

            if (response.success) {
                // Remove from state
                setItineraries(prev => prev.filter(it => it.day_number !== dayNumber));
                toast.success(`Đã xóa ngày ${dayNumber}`);

                // Load day 1 or create new day
                if (itineraries.length > 1) {
                    loadDay(1);
                } else {
                    setCurrentDay(1);
                    setFormData({
                        day_number: 1,
                        title: '',
                        description: '',
                        activities: [{ time: '08:00', action: '' }]
                    });
                }
            } else {
                throw new Error(response.message || 'Failed to delete itinerary');
            }
        } catch (error) {
            console.error('❌ Delete Itinerary Error:', error);
            toast.error(error.message || 'Không thể xóa ngày. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    // Lưu current form data vào itineraries (draft mode - không validate)
    const saveDraftItinerary = () => {
        // Tìm itinerary đang edit
        const existingIndex = itineraries.findIndex(it => it.day_number === currentDay);

        if (existingIndex >= 0) {
            // Update existing
            const updated = [...itineraries];
            updated[existingIndex] = {
                ...updated[existingIndex],
                ...formData
            };
            return updated;
        } else if (formData.title.trim() || formData.activities.length > 0) {
            // Add new nếu có data
            return [...itineraries, formData];
        }

        return itineraries;
    };

    // Handler khi nhấn "Quay lại"
    const handleBackClick = async () => {
        if (hasUnsavedChanges) {
            const confirmed = window.confirm(
                `Bạn có thay đổi chưa được lưu cho ngày ${currentDay}. Bạn có muốn lưu trước khi quay lại không?\n\n` +
                `• Chọn "OK" để lưu và quay lại\n` +
                `• Chọn "Hủy" để bỏ thay đổi và quay lại`
            );

            if (confirmed) {
                const success = await saveCurrentItinerary();
                if (!success) {
                    toast.error('Không thể lưu. Vui lòng thử lại!');
                    return;
                }
            }
        }

        const updatedItineraries = saveDraftItinerary();
        console.log('⬅️ Going back with itineraries:', updatedItineraries);
        onBack(updatedItineraries);
    };

    return (
        <div className="itinerary-form">
            <div className="form-header">
                <h2 className="form-section-title">Lịch trình & Hoạt động</h2>
                <div className="day-counter">
                    <span className="current-day">Ngày {currentDay}/{maxDays}</span>
                    <span className="saved-days">{itineraries.length} ngày đã lưu</span>
                </div>
            </div>

            {/* Saved Days Navigation */}
            {itineraries.length > 0 && (
                <div className="saved-days-nav">
                    <h3 className="nav-title">Các ngày đã tạo:</h3>
                    <div className="days-grid">
                        {itineraries.map((itinerary) => (
                            <div
                                key={itinerary.day_number}
                                className={`day-card ${currentDay === itinerary.day_number ? 'active' : ''}`}
                            >
                                <div className="day-card-header">
                                    <span className="day-number">Ngày {itinerary.day_number}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteDay(itinerary.day_number)}
                                        className="btn-delete-day"
                                        title="Xóa ngày này"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <div className="day-card-body" onClick={() => loadDay(itinerary.day_number)}>
                                    <p className="day-title">{itinerary.title || 'Chưa có tiêu đề'}</p>
                                    <p className="day-meta">
                                        {itinerary.activities?.length || 0} hoạt động
                                    </p>
                                </div>
                                {currentDay !== itinerary.day_number && (
                                    <button
                                        type="button"
                                        onClick={() => loadDay(itinerary.day_number)}
                                        className="btn-edit-day"
                                    >
                                        ✏️ Chỉnh sửa
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Warning if max days */}
            {currentDay >= maxDays && (
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#fef3c7',
                    border: '2px solid #fbbf24',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    color: '#92400e',
                    fontSize: '14px',
                    fontWeight: '600'
                }}>
                    ⚠️ Đây là ngày cuối cùng (Tour: {basicInfo?.duration || 'N/A'} = {maxDays} ngày)
                </div>
            )}

            {/* Save reminder */}
            {hasUnsavedChanges && (
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#fef3c7',
                    border: '2px solid #fbbf24',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#92400e',
                    fontSize: '14px',
                    fontWeight: '600'
                }}>
                    💾 <span>Bạn có thay đổi chưa lưu! Nhấn <strong>"💾 Lưu ngày"</strong> để lưu hoặc <strong>"➕ Thêm ngày mới"</strong> sẽ bị vô hiệu hóa.</span>
                </div>
            )}



            {/* Day Title */}
            <div className="form-group">
                <label className="form-label">
                    Tiêu đề ngày {currentDay} <span className="required">*</span>
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFormFieldChange('title', e.target.value)}
                    className="form-input"
                    placeholder={`VD: Ngày ${currentDay}: Khởi hành - Đà Nẵng`}
                />
            </div>

            {/* Description */}
            <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => handleFormFieldChange('description', e.target.value)}
                    rows={3}
                    className="form-textarea"
                    placeholder="Mô tả chi tiết về lịch trình trong ngày..."
                />
            </div>

            {/* Activities */}
            <div className="activities-section">
                <div className="section-header">
                    <h3 className="subsection-title">
                        Hoạt động trong ngày <span className="required">*</span>
                        <span style={{
                            marginLeft: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: formData.activities.length === 0 ? '#ef4444' : '#10b981',
                            backgroundColor: formData.activities.length === 0 ? '#fee2e2' : '#d1fae5',
                            padding: '4px 12px',
                            borderRadius: '12px'
                        }}>
                            {formData.activities.length} hoạt động
                        </span>
                        {hasUnsavedChanges && (
                            <span style={{
                                marginLeft: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#f59e0b',
                                backgroundColor: '#fef3c7',
                                padding: '4px 8px',
                                borderRadius: '8px'
                            }}>
                                Chưa lưu
                            </span>
                        )}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={handleSaveCurrentDay}
                            disabled={saving}
                            className="btn-save-day"
                            style={{
                                padding: '6px 12px',
                                backgroundColor: hasUnsavedChanges ? '#10b981' : '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: saving ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {saving ? '💾 Đang lưu...' : '💾 Lưu ngày'}
                        </button>
                        <button
                            type="button"
                            onClick={handleAddActivity}
                            className="btn-add-activity"
                        >
                            + Thêm hoạt động
                        </button>
                    </div>
                </div>



                {formData.activities.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📋</span>
                        <p>Chưa có hoạt động nào. Nhấn "Thêm hoạt động" để bắt đầu.</p>
                        <button
                            type="button"
                            onClick={handleAddActivity}
                            className="btn-add-activity"
                            style={{ marginTop: '1rem' }}
                        >
                            + Thêm hoạt động đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="activities-list">
                        {formData.activities.map((activity, index) => (
                            <div key={activity._id || `new-${index}`} className="activity-card">
                                <div className="activity-header">
                                    <span className="activity-number">Hoạt động #{index + 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveActivity(index)}
                                        className="btn-remove-activity"
                                        disabled={deletingActivityIndex === index}
                                    >
                                        🗑️ Xóa
                                    </button>
                                </div>

                                <div className="activity-form">
                                    {/* Time - Simplified format */}
                                    <div className="form-group">
                                        <label className="form-label">Thời gian *</label>
                                        <input
                                            type="time"
                                            value={activity.time}
                                            onChange={(e) => handleActivityChange(index, 'time', e.target.value)}
                                            className="form-input"
                                        />
                                    </div>

                                    {/* Action - Single field */}
                                    <div className="form-group">
                                        <label className="form-label">Hoạt động *</label>
                                        <input
                                            type="text"
                                            value={activity.action}
                                            onChange={(e) => handleActivityChange(index, 'action', e.target.value)}
                                            className="form-input"
                                            placeholder="VD: Tham quan Bà Nà Hills, cáp treo"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Saved Itineraries Summary */}
            {itineraries.length > 0 && (
                <div className="saved-itineraries">
                    <h3 className="subsection-title">Các ngày đã lưu</h3>
                    <div className="saved-list">
                        {itineraries.map((item, index) => (
                            <div key={index} className="saved-item">
                                <span className="saved-icon">✓</span>
                                <span className="saved-title">{item.title}</span>
                                <span className="saved-activities">{item.activities.length} hoạt động</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Form Actions */}
            <div className="form-actions">
                <button
                    type="button"
                    onClick={handleBackClick}
                    className="btn-cancel"
                >
                    ← Quay lại
                </button>

                <div className="right-actions">
                    {hasUnsavedChanges && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            backgroundColor: '#fef3c7',
                            border: '2px solid #fbbf24',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#92400e'
                        }}>
                            ⚠️ Bạn cần lưu ngày hiện tại trước!
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleAddDay}
                        disabled={loading || saving || currentDay >= maxDays || hasUnsavedChanges}
                        className="btn-add-day"
                        style={{
                            opacity: hasUnsavedChanges ? 0.5 : 1,
                            cursor: hasUnsavedChanges ? 'not-allowed' : 'pointer'
                        }}
                        title={
                            hasUnsavedChanges
                                ? 'Vui lòng lưu ngày hiện tại trước khi thêm ngày mới'
                                : currentDay >= maxDays
                                    ? `Đã đạt số ngày tối đa (${maxDays} ngày)`
                                    : 'Thêm ngày mới'
                        }
                    >
                        {saving ? '💾 Đang lưu...' : hasUnsavedChanges ? '🔒 Cần lưu trước' : `➕ Thêm ngày ${currentDay + 1} ${currentDay >= maxDays ? '(Đã max)' : ''}`}
                    </button>

                    <button
                        type="button"
                        onClick={handleFinish}
                        disabled={loading || saving}
                        className="btn-submit"
                    >
                        {(loading || saving) ? 'Đang xử lý...' : 'Tiếp theo: Ngân sách →'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItineraryForm;
