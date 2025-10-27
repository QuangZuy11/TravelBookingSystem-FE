import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ItineraryForm.css';

const ItineraryForm = ({ tourId, basicInfo, existingItineraries = [], isEditMode, onNext, onBack }) => {
    const [itineraries, setItineraries] = useState(existingItineraries);
    // Nếu edit mode và có itineraries, bắt đầu từ ngày 1 để có thể edit
    // Nếu create mode hoặc chưa có itineraries, bắt đầu từ ngày 1
    const [currentDay, setCurrentDay] = useState(1);
    const token = localStorage.getItem('token');
    const [formData, setFormData] = useState({
        day_number: 1,
        title: '',
        description: '',
        meals: [],
        activities: []
    });
    const [loading, setLoading] = useState(false);
    // Lưu danh sách activities sẽ bị xóa khi save (soft delete)
    const [activitiesToDelete, setActivitiesToDelete] = useState([]);
    // Prevent double-click on delete button
    const [deletingActivityIndex, setDeletingActivityIndex] = useState(null);

    // Cập nhật khi existingItineraries thay đổi (khi quay lại từ step 3)
    useEffect(() => {
        if (existingItineraries.length > 0) {
            setItineraries(existingItineraries);
            // Clear danh sách activities chờ xóa khi reload data
            setActivitiesToDelete([]);
            // Load data của ngày đầu tiên nếu có
            const firstItinerary = existingItineraries[0];
            if (firstItinerary) {
                setCurrentDay(1);
                setFormData({
                    _id: firstItinerary._id, // ⚠️ QUAN TRỌNG: Phải set _id
                    day_number: 1,
                    title: firstItinerary.title || '',
                    description: firstItinerary.description || '',
                    meals: Array.isArray(firstItinerary.meals) ? firstItinerary.meals : [],
                    activities: Array.isArray(firstItinerary.activities) ? firstItinerary.activities : []
                });
            }
        }
    }, [existingItineraries]);

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
                activity_name: '',
                start_time: '',
                end_time: '',
                description: '',
                cost: 0,
                included_in_tour: true,
                optional: false
            }]
        }));
    };

    const handleActivityChange = (index, field, value) => {
        // Kiểm tra nếu đang ở ngày cuối và đang thay đổi end_time
        if (field === 'end_time' && currentDay === maxDays) {
            const endTimeValue = value;
            // Parse giờ từ string "HH:MM"
            if (endTimeValue) {
                const [hours] = endTimeValue.split(':').map(Number);
                // Không cho nhập giờ kết thúc sau 18:00 (6PM) ở ngày cuối
                if (hours >= 18) {
                    toast.error('⚠️ Ngày cuối cùng không thể có hoạt động buổi tối (sau 18:00)');
                    return; // Không update value
                }
            }
        }

        setFormData(prev => ({
            ...prev,
            activities: prev.activities.map((activity, i) =>
                i === index ? { ...activity, [field]: value } : activity
            )
        }));
    };

    const handleRemoveActivity = (index) => {
        // Prevent rapid multiple clicks
        if (deletingActivityIndex === index) {
            console.log('⚠️ Already deleting this activity, ignoring...');
            return;
        }

        setDeletingActivityIndex(index);

        const activity = formData.activities[index];

        console.log('🗑️ REMOVING ACTIVITY:', {
            index,
            activity,
            hasActivityId: !!activity._id,
            formDataId: formData._id,
            hasFormDataId: !!formData._id
        });

        // Nếu activity đã có _id (đã lưu vào database), thêm vào danh sách "chờ xóa"
        if (activity._id && formData._id) {
            const deleteItem = {
                itineraryId: formData._id,
                activityId: activity._id
            };
            console.log('✅ Adding to delete queue:', deleteItem);
            setActivitiesToDelete(prev => {
                const newList = [...prev, deleteItem];
                console.log('📋 Updated activitiesToDelete:', newList);
                return newList;
            });
            // Thay toast.info bằng toast (generic) hoặc toast.success
            toast('Đã đánh dấu xóa hoạt động (sẽ xóa khi bạn nhấn Lưu)', { icon: '🗑️' });
        } else {
            console.log('⚠️ NOT adding to delete queue - activity is new (not saved yet)');
        }

        // Xóa khỏi state (xóa khỏi UI ngay lập tức)
        setFormData(prev => ({
            ...prev,
            activities: prev.activities.filter((_, i) => i !== index)
        }));

        // Reset delete lock after a short delay
        setTimeout(() => setDeletingActivityIndex(null), 300);
    };

    const handleMealChange = (meal) => {
        setFormData(prev => ({
            ...prev,
            meals: prev.meals.includes(meal)
                ? prev.meals.filter(m => m !== meal)
                : [...prev.meals, meal]
        }));
    };

    // Kiểm tra giờ hoạt động có conflict không
    const validateActivityTimes = (activities) => {
        // Lọc ra các activities có đầy đủ thời gian
        const activitiesWithTime = activities.filter(
            act => act.start_time && act.end_time && act.activity_name.trim()
        );

        // So sánh từng cặp activities
        for (let i = 0; i < activitiesWithTime.length; i++) {
            for (let j = i + 1; j < activitiesWithTime.length; j++) {
                const act1 = activitiesWithTime[i];
                const act2 = activitiesWithTime[j];

                // Chuyển thời gian sang phút để so sánh dễ hơn
                const start1 = timeToMinutes(act1.start_time);
                const end1 = timeToMinutes(act1.end_time);
                const start2 = timeToMinutes(act2.start_time);
                const end2 = timeToMinutes(act2.end_time);

                // Kiểm tra end_time phải sau start_time
                if (end1 <= start1) {
                    toast.error(`Hoạt động "${act1.activity_name}": Giờ kết thúc phải sau giờ bắt đầu`);
                    return false;
                }
                if (end2 <= start2) {
                    toast.error(`Hoạt động "${act2.activity_name}": Giờ kết thúc phải sau giờ bắt đầu`);
                    return false;
                }

                // Kiểm tra conflict: act1 và act2 có chồng chéo thời gian không?
                // Chồng chéo nếu: start1 < end2 && start2 < end1
                if (start1 < end2 && start2 < end1) {
                    toast.error(
                        `Xung đột thời gian: "${act1.activity_name}" (${act1.start_time}-${act1.end_time}) ` +
                        `và "${act2.activity_name}" (${act2.start_time}-${act2.end_time})`
                    );
                    return false;
                }
            }
        }

        return true;
    };

    // Helper: Chuyển HH:mm sang số phút
    const timeToMinutes = (timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const saveCurrentItinerary = async () => {
        if (!formData.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề cho ngày này');
            return false;
        }

        if (formData.activities.length === 0) {
            toast.error('Phải có ít nhất 1 hoạt động');
            return false;
        }

        // Kiểm tra xem có hoạt động nào có tên không (Bug 2 fix)
        const validActivities = formData.activities.filter(act => act.activity_name.trim());
        if (validActivities.length === 0) {
            toast.error('Phải có ít nhất 1 hoạt động có tên hợp lệ');
            return false;
        }

        // Kiểm tra conflict giờ hoạt động (Bug mới)
        if (!validateActivityTimes(formData.activities)) {
            return false;
        }

        setLoading(true);

        try {
            // Check if this day already exists
            const existingItinerary = itineraries.find(it => it.day_number === formData.day_number);

            let itineraryId;

            if (existingItinerary && existingItinerary._id) {
                // UPDATE existing itinerary
                await axios.put(
                    `http://localhost:3000/api/itineraries/${existingItinerary._id}`,
                    {
                        title: formData.title,
                        description: formData.description,
                        meals: formData.meals
                    }, {
                    headers: { Authorization: `Bearer ${token}` }
                }
                );
                itineraryId = existingItinerary._id;

                // Không cần xóa tất cả activities nữa vì đã xóa từng cái riêng lẻ
            } else {
                // CREATE new itinerary
                const itineraryResponse = await axios.post(
                    'http://localhost:3000/api/itineraries',
                    {
                        tour_id: tourId,
                        day_number: formData.day_number,
                        title: formData.title,
                        description: formData.description,
                        meals: formData.meals
                    }, {
                    headers: { Authorization: `Bearer ${token}` }
                }
                );
                itineraryId = itineraryResponse.data.data._id;
            }

            // XÓA các activities đã đánh dấu xóa (thực hiện DELETE thực sự)
            console.log('🔍 CHECKING DELETE QUEUE:', {
                activitiesToDeleteLength: activitiesToDelete.length,
                activitiesToDelete: activitiesToDelete
            });

            if (activitiesToDelete.length > 0) {
                console.log('🗑️ STARTING DELETE OPERATIONS...');
                for (const item of activitiesToDelete) {
                    try {
                        const deleteUrl = `http://localhost:3000/api/itineraries/${item.itineraryId}/activities/${item.activityId}`;
                        console.log('🔥 Deleting activity:', deleteUrl);
                        await axios.delete(deleteUrl, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        console.log('✅ Successfully deleted activity:', item.activityId);
                    } catch (error) {
                        console.error('❌ Error deleting activity:', error);
                        // Tiếp tục xóa các activities khác dù có lỗi
                    }
                }
                // Clear danh sách chờ xóa sau khi đã xóa xong
                setActivitiesToDelete([]);
                toast.success('Đã xóa các hoạt động đã đánh dấu');
            } else {
                console.log('ℹ️ No activities to delete');
            }

            // Add/Update activities (chỉ xử lý activities có tên)
            for (const activity of validActivities) {
                if (activity._id) {
                    // UPDATE existing activity
                    await axios.put(
                        `http://localhost:3000/api/itineraries/${itineraryId}/activities/${activity._id}`,
                        {
                            activity_name: activity.activity_name,
                            start_time: activity.start_time,
                            end_time: activity.end_time,
                            description: activity.description,
                            location: activity.location
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                } else {
                    // CREATE new activity
                    const response = await axios.post(
                        `http://localhost:3000/api/itineraries/${itineraryId}/activities`,
                        activity
                    );
                    // Cập nhật _id cho activity mới tạo
                    activity._id = response.data.data._id;
                }
            }

            // Update state
            if (existingItinerary) {
                // Update existing
                setItineraries(prev => prev.map(it =>
                    it.day_number === formData.day_number
                        ? { ...formData, _id: itineraryId, activities: validActivities }
                        : it
                ));
            } else {
                // Add new
                setItineraries(prev => [...prev, {
                    ...formData,
                    _id: itineraryId,
                    activities: validActivities
                }]);
            }

            toast.success(`Đã ${existingItinerary ? 'cập nhật' : 'lưu'} ngày ${formData.day_number}`);
            return true;
        } catch (error) {
            console.error('Error saving itinerary:', error);
            toast.error('Không thể lưu lịch trình. Vui lòng thử lại!');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleAddDay = async () => {
        // Lưu ngày hiện tại trước
        const hasCurrentDayData = formData.title.trim() && formData.activities.some(act => act.activity_name.trim());
        if (hasCurrentDayData) {
            const success = await saveCurrentItinerary();
            if (!success) return;
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

        // Load ngày mới
        setCurrentDay(nextDay);
        setFormData({
            day_number: nextDay,
            title: '',
            description: '',
            meals: [],
            activities: []
        });
        toast.info(`Đang tạo ngày ${nextDay}`);
    };

    const handleFinish = async () => {
        // Bug 2 Fix: Kiểm tra ngày hiện tại có dữ liệu hợp lệ không
        const hasCurrentDayData = formData.title.trim() && formData.activities.some(act => act.activity_name.trim());

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

    // Load itinerary của ngày được chọn
    const loadDay = (dayNumber) => {
        const itinerary = itineraries.find(it => it.day_number === dayNumber);
        if (itinerary) {
            setCurrentDay(dayNumber);
            setFormData({
                _id: itinerary._id, // ⚠️ QUAN TRỌNG: Phải set _id để handleRemoveActivity biết activity đã lưu
                day_number: dayNumber,
                title: itinerary.title || '',
                description: itinerary.description || '',
                meals: Array.isArray(itinerary.meals) ? itinerary.meals : [],
                activities: Array.isArray(itinerary.activities) ? itinerary.activities : []
            });
        } else {
            // Ngày mới
            setCurrentDay(dayNumber);
            setFormData({
                day_number: dayNumber,
                title: '',
                description: '',
                meals: [],
                activities: []
            });
        }
    };

    // Delete một ngày đã lưu
    const handleDeleteDay = async (dayNumber) => {
        const itinerary = itineraries.find(it => it.day_number === dayNumber);
        if (!itinerary || !itinerary._id) return;

        if (!confirm(`Bạn có chắc muốn xóa Ngày ${dayNumber}?`)) return;

        try {
            setLoading(true);
            // Delete itinerary from backend
            await axios.delete(`http://localhost:3000/api/itineraries/${itinerary._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from state
            setItineraries(prev => prev.filter(it => it.day_number !== dayNumber));
            toast.success(`Đã xóa ngày ${dayNumber}`);

            // Load ngày 1 hoặc ngày mới
            if (itineraries.length > 1) {
                loadDay(1);
            } else {
                setCurrentDay(1);
                setFormData({
                    day_number: 1,
                    title: '',
                    description: '',
                    meals: [],
                    activities: []
                });
            }
        } catch (error) {
            console.error('Error deleting itinerary:', error);
            toast.error('Không thể xóa ngày. Vui lòng thử lại!');
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
    const handleBackClick = () => {
        const updatedItineraries = saveDraftItinerary();
        console.log('⬅️ Saving draft before going back:', updatedItineraries);
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

            {/* Pending Deletions Warning */}
            {activitiesToDelete.length > 0 && (
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#fee2e2',
                    border: '2px solid #f87171',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    color: '#991b1b',
                    fontSize: '14px',
                    fontWeight: '600'
                }}>
                    🗑️ Có {activitiesToDelete.length} hoạt động đang chờ xóa. Nhấn "Lưu và tiếp tục" để xóa vĩnh viễn.
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
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="form-input"
                    placeholder={`VD: Ngày ${currentDay}: Khởi hành - Đà Nẵng`}
                />
            </div>

            {/* Description */}
            <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="form-textarea"
                    placeholder="Mô tả chi tiết về lịch trình trong ngày..."
                />
            </div>

            {/* Meals */}
            <div className="meals-section">
                <label className="form-label">Bữa ăn</label>
                <div className="meals-grid">
                    {[
                        { value: 'breakfast', label: '🍳 Sáng', icon: '☀️' },
                        { value: 'lunch', label: '🍱 Trưa', icon: '🌤️' },
                        { value: 'dinner', label: '🍽️ Tối', icon: '🌙' }
                    ].map(meal => (
                        <label key={meal.value} className={`meal-checkbox ${formData.meals.includes(meal.value) ? 'checked' : ''}`}>
                            <input
                                type="checkbox"
                                checked={formData.meals.includes(meal.value)}
                                onChange={() => handleMealChange(meal.value)}
                            />
                            <span className="meal-icon">{meal.icon}</span>
                            <span className="meal-label">{meal.label}</span>
                        </label>
                    ))}
                </div>
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
                    </h3>
                    <button
                        type="button"
                        onClick={handleAddActivity}
                        className="btn-add-activity"
                    >
                        + Thêm hoạt động
                    </button>
                </div>

                {/* Warning cho ngày cuối */}
                {currentDay === maxDays && (
                    <div style={{
                        backgroundColor: '#fef3c7',
                        border: '1px solid #fbbf24',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ fontSize: '20px' }}>⚠️</span>
                        <span style={{ color: '#92400e', fontSize: '14px', fontWeight: '500' }}>
                            Đây là ngày cuối - Hoạt động không được kết thúc sau 18:00 (không có buổi tối)
                        </span>
                    </div>
                )}

                {formData.activities.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📋</span>
                        <p>Chưa có hoạt động nào. Nhấn "Thêm hoạt động" để bắt đầu.</p>
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
                                    {/* Activity Name */}
                                    <div className="form-group">
                                        <label className="form-label">Tên hoạt động *</label>
                                        <input
                                            type="text"
                                            value={activity.activity_name}
                                            onChange={(e) => handleActivityChange(index, 'activity_name', e.target.value)}
                                            className="form-input"
                                            placeholder="VD: Tham quan Bà Nà Hills"
                                        />
                                    </div>

                                    {/* Time */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Giờ bắt đầu</label>
                                            <input
                                                type="time"
                                                value={activity.start_time}
                                                onChange={(e) => handleActivityChange(index, 'start_time', e.target.value)}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Giờ kết thúc</label>
                                            <input
                                                type="time"
                                                value={activity.end_time}
                                                onChange={(e) => handleActivityChange(index, 'end_time', e.target.value)}
                                                className="form-input"
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="form-group">
                                        <label className="form-label">Mô tả</label>
                                        <textarea
                                            value={activity.description}
                                            onChange={(e) => handleActivityChange(index, 'description', e.target.value)}
                                            rows={2}
                                            className="form-textarea"
                                            placeholder="Mô tả chi tiết về hoạt động..."
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
                    <button
                        type="button"
                        onClick={handleAddDay}
                        disabled={loading || currentDay >= maxDays}
                        className="btn-add-day"
                        title={currentDay >= maxDays ? `Đã đạt số ngày tối đa (${maxDays} ngày)` : 'Lưu ngày này và thêm ngày mới'}
                    >
                        💾 Lưu và thêm ngày mới {currentDay >= maxDays && '(Đã max)'}
                    </button>

                    <button
                        type="button"
                        onClick={handleFinish}
                        disabled={loading}
                        className="btn-submit"
                    >
                        {loading ? 'Đang xử lý...' : 'Tiếp theo: Ngân sách →'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItineraryForm;
