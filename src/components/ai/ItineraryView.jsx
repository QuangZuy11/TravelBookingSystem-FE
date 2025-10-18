import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateItineraryDay, updateActivity, addActivityToDay, deleteActivity, reorderActivities } from '../../services/aiItineraryService';
import { getPOIsByDestination } from '../../services/poiService';
import './AIItinerary.css';

/**
 * ItineraryView Component
 * Displays generated AI itinerary with day-by-day breakdown
 * Supports editing: update day info, add/edit/delete/reorder activities
 * 
 * @param {Object} data - Response data from /api/ai-itineraries/generate
 * @param {string} destination - Destination name
 * @param {Function} onUpdate - Callback when itinerary is updated (optional)
 * @param {boolean} editable - Whether to show edit controls (default: true)
 * 
 * Response format:
 * {
 *   request_id, tour_id, provider_id,
 *   itinerary_data: [
 *     {
 *       itinerary: { _id, day_number, title, description, meals, activities[] },
 *       activities: [ { _id, poi_id, activity_name, start_time, end_time, duration_hours, description, cost, optional } ]
 *     }
 *   ],
 *   summary, status, _id, created_at
 * }
 */
const ItineraryView = ({ data, destination, onUpdate, editable = true }) => {
    const [expandedDays, setExpandedDays] = useState(new Set([1])); // Expand Day 1 by default
    const [editingDay, setEditingDay] = useState(null);
    const [editingActivity, setEditingActivity] = useState(null);
    const [addingActivityToDay, setAddingActivityToDay] = useState(null);

    if (!data || !data.itinerary_data) {
        return (
            <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-600">
                No itinerary data available
            </div>
        );
    }

    const { itinerary_data, summary, status } = data;

    // Calculate totals
    const totalActivities = itinerary_data.reduce(
        (sum, day) => sum + (day.activities?.length || 0),
        0
    );

    const totalCost = itinerary_data.reduce(
        (sum, day) => sum + (day.activities?.reduce((daySum, act) => daySum + (act.cost || 0), 0) || 0),
        0
    );

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

    // Handle day update
    const handleUpdateDay = async (dayId, updates) => {
        try {
            const result = await updateItineraryDay(dayId, updates);
            toast.success('Day updated successfully');
            setEditingDay(null);
            // Refresh data to sync with backend
            if (onUpdate) await onUpdate();
        } catch (error) {
            toast.error(error.message || 'Failed to update day');
        }
    };

    // Handle activity update
    const handleUpdateActivity = async (activityId, updates) => {
        try {
            const result = await updateActivity(activityId, updates);
            toast.success('Activity updated successfully');
            setEditingActivity(null);
            // Refresh data to sync with backend
            if (onUpdate) await onUpdate();
        } catch (error) {
            toast.error(error.message || 'Failed to update activity');
        }
    };

    // Handle activity add
    const handleAddActivity = async (dayId, activityData) => {
        try {
            const result = await addActivityToDay(dayId, activityData);
            toast.success('Activity added successfully');
            setAddingActivityToDay(null);
            // Refresh data to sync with backend
            if (onUpdate) await onUpdate();
        } catch (error) {
            toast.error(error.message || 'Failed to add activity');
        }
    };

    // Handle activity delete
    const handleDeleteActivity = async (activityId) => {
        if (!window.confirm('Are you sure you want to delete this activity?')) return;

        try {
            await deleteActivity(activityId);
            toast.success('Activity deleted successfully');
            // Refresh data to sync with backend
            if (onUpdate) await onUpdate();
        } catch (error) {
            toast.error(error.message || 'Failed to delete activity');
        }
    };

    // Handle activity reorder - gửi toàn bộ thứ tự mới
    const handleReorderActivities = async (dayId, activityIds) => {
        try {
            // Gửi mảng chứa tất cả activity IDs theo thứ tự mới
            await reorderActivities(dayId, activityIds);
            toast.success('Activities reordered successfully');
            // Refresh data để đồng bộ với backend
            if (onUpdate) await onUpdate();
        } catch (error) {
            toast.error(error.message || 'Failed to reorder activities');
            // Nếu lỗi, refresh để khôi phục về trạng thái backend
            if (onUpdate) await onUpdate();
        }
    };

    return (
        <div className="itinerary-results">
            {/* Header */}
            <div className="results-header mb-8">
                <h2 className="text-3xl font-bold mb-4">
                    Your AI Travel Plan for {destination}
                </h2>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                        📍 {destination}, Vietnam
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        📅 {itinerary_data.length} Days
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        🎯 {totalActivities} Activities
                    </span>
                </div>

                {totalCost > 0 && (
                    <div className="text-lg font-semibold mb-4">
                        💰 Total Est. Cost: <span className="text-blue-600">{totalCost.toLocaleString()} VND</span>
                        <span className="text-sm text-gray-500 font-normal ml-2">
                            (~${(totalCost / 24000).toFixed(2)} USD)
                        </span>
                    </div>
                )}

                {summary && (
                    <p className="text-gray-600 mb-4">
                        {summary}
                    </p>
                )}

                <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                        💾 Save to My Trips
                    </button>
                    <button className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition font-medium">
                        ✏️ Edit
                    </button>
                    <button className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition font-medium">
                        🔗 Share
                    </button>
                    <button className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition font-medium">
                        🎫 Book Tours
                    </button>
                </div>
            </div>

            {/* Days Breakdown */}
            <div className="space-y-6">
                {itinerary_data.map((dayData) => {
                    const { itinerary, activities } = dayData;
                    const dayNumber = itinerary.day_number;
                    const isExpanded = expandedDays.has(dayNumber);

                    const dayCost = activities?.reduce((sum, act) => sum + (act.cost || 0), 0) || 0;

                    return (
                        <div key={itinerary._id} className="day-card">
                            {/* Day Header */}
                            <div
                                className="day-header cursor-pointer"
                                onClick={() => toggleDay(dayNumber)}
                            >
                                <div className="flex-1">
                                    {editingDay === itinerary._id ? (
                                        <DayEditForm
                                            day={itinerary}
                                            onSave={(updates) => handleUpdateDay(itinerary._id, updates)}
                                            onCancel={() => setEditingDay(null)}
                                        />
                                    ) : (
                                        <>
                                            <h3 className="text-2xl font-semibold flex items-center gap-2">
                                                🗓️ Day {dayNumber}: {itinerary.title || destination}
                                            </h3>
                                            {itinerary.description && (
                                                <p className="text-sm text-gray-600 mt-1">{itinerary.description}</p>
                                            )}
                                            <p className="text-sm text-gray-500 mt-1">
                                                {activities?.length || 0} activities
                                                {dayCost > 0 && ` • ${dayCost.toLocaleString()} VND`}
                                            </p>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {editable && editingDay !== itinerary._id && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingDay(itinerary._id);
                                            }}
                                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
                                        >
                                            ✏️ Edit Day
                                        </button>
                                    )}
                                    <button className="text-2xl">
                                        {isExpanded ? '▲' : '▼'}
                                    </button>
                                </div>
                            </div>

                            {/* Activities */}
                            {isExpanded && (
                                <div className="day-activities mt-4 space-y-3">
                                    {!activities || activities.length === 0 ? (
                                        <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-500">
                                            No activities planned for this day
                                        </div>
                                    ) : (
                                        <DraggableActivitiesList
                                            activities={activities}
                                            dayId={itinerary._id}
                                            itineraryId={data._id}
                                            dayNumber={itinerary.day_number}
                                            editable={editable}
                                            editingActivity={editingActivity}
                                            onEdit={setEditingActivity}
                                            onSave={handleUpdateActivity}
                                            onCancel={() => setEditingActivity(null)}
                                            onDelete={handleDeleteActivity}
                                            onReorder={handleReorderActivities}
                                        />
                                    )}

                                    {editable && (
                                        addingActivityToDay === itinerary._id ? (
                                            <ActivityAddForm
                                                onAdd={(activityData) => handleAddActivity(itinerary._id, activityData)}
                                                onCancel={() => setAddingActivityToDay(null)}
                                                destinationId={data.request_id?.destination_id || data.request_id?.destination?._id}
                                                destinationName={destination}
                                            />
                                        ) : (
                                            <button
                                                onClick={() => setAddingActivityToDay(itinerary._id)}
                                                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-blue-600 font-medium"
                                            >
                                                ➕ Add Activity
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Tips Section */}
            <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    💡 Tips & Recommendations
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Best visited in October-April for pleasant weather</li>
                    <li>• Bring comfortable walking shoes for exploring</li>
                    <li>• Try local street food in Old Quarter</li>
                    <li>• Book popular attractions in advance</li>
                    <li>• Respect local customs and dress modestly at temples</li>
                </ul>
            </div>
        </div>
    );
};

// Draggable Activities List Component
const DraggableActivitiesList = ({ activities, dayId, itineraryId, dayNumber, editable, editingActivity, onEdit, onSave, onCancel, onDelete, onReorder }) => {
    const [localActivities, setLocalActivities] = useState(activities);
    const [isDragging, setIsDragging] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Update local state when prop changes (only if not dragging)
    React.useEffect(() => {
        if (!isDragging) {
            setLocalActivities(activities);
        }
    }, [activities, isDragging]);

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setIsDragging(false);

        if (over && active.id !== over.id) {
            const oldIndex = localActivities.findIndex(act => act._id === active.id);
            const newIndex = localActivities.findIndex(act => act._id === over.id);

            const newOrder = arrayMove(localActivities, oldIndex, newIndex);

            // Optimistic update - cập nhật UI ngay lập tức
            setLocalActivities(newOrder);

            // Gửi toàn bộ thông tin về backend:
            // - dayId: ID của itinerary day
            // - newOrder.map(a => a._id): Danh sách đầy đủ activity IDs theo thứ tự mới
            // - itineraryId: ID của toàn bộ itinerary (có thể dùng để validate)
            // - dayNumber: Số thứ tự ngày (để dễ trace)
            console.log('Reordering activities:', {
                itineraryId,
                dayId,
                dayNumber,
                activityIds: newOrder.map(a => a._id)
            });

            onReorder(dayId, newOrder.map(a => a._id));
        }
    };

    const handleDragCancel = () => {
        setIsDragging(false);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <SortableContext
                items={localActivities.map(a => a._id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3">
                    {localActivities.map((activity) => (
                        <SortableActivityCard
                            key={activity._id}
                            activity={activity}
                            editable={editable}
                            isEditing={editingActivity === activity._id}
                            onEdit={() => onEdit(activity._id)}
                            onSave={(updates) => onSave(activity._id, updates)}
                            onCancel={onCancel}
                            onDelete={() => onDelete(activity._id)}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

// Sortable Activity Card Wrapper
const SortableActivityCard = ({ activity, editable, isEditing, onEdit, onSave, onCancel, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: activity._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <ActivityCard
                activity={activity}
                editable={editable}
                isEditing={isEditing}
                onEdit={onEdit}
                onSave={onSave}
                onCancel={onCancel}
                onDelete={onDelete}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
};

const ActivityCard = ({ activity, editable, isEditing, onEdit, onSave, onCancel, onDelete, dragHandleProps }) => {
    const {
        activity_name,
        start_time,
        end_time,
        duration_hours,
        description,
        cost,
        optional
    } = activity;

    if (isEditing) {
        return (
            <ActivityEditForm
                activity={activity}
                onSave={onSave}
                onCancel={onCancel}
            />
        );
    }

    return (
        <div className="activity-card" style={{ position: 'relative' }}>
            {/* Drag Handle */}
            {editable && dragHandleProps && (
                <div
                    {...dragHandleProps}
                    style={{
                        position: 'absolute',
                        left: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'grab',
                        touchAction: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                        zIndex: 10
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <div style={{ width: '4px', height: '4px', backgroundColor: '#9CA3AF', borderRadius: '50%' }}></div>
                    <div style={{ width: '4px', height: '4px', backgroundColor: '#9CA3AF', borderRadius: '50%' }}></div>
                    <div style={{ width: '4px', height: '4px', backgroundColor: '#9CA3AF', borderRadius: '50%' }}></div>
                    <div style={{ width: '4px', height: '4px', backgroundColor: '#9CA3AF', borderRadius: '50%' }}></div>
                    <div style={{ width: '4px', height: '4px', backgroundColor: '#9CA3AF', borderRadius: '50%' }}></div>
                    <div style={{ width: '4px', height: '4px', backgroundColor: '#9CA3AF', borderRadius: '50%' }}></div>
                </div>
            )}

            <div className="activity-header" style={{ marginLeft: editable ? '40px' : '0' }}>
                <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">
                        {start_time} - {end_time} ({duration_hours} hours)
                        {optional && <span className="ml-2 text-xs text-amber-600">Optional</span>}
                    </div>
                    <h4 className="text-xl font-semibold">
                        {activity_name}
                    </h4>
                </div>
                <div className="text-right">
                    <div className={`text-lg font-bold ${cost === 0 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                        {cost === 0 ? 'FREE' : `${cost.toLocaleString()} VND`}
                    </div>
                    {cost > 0 && (
                        <div className="text-xs text-gray-500">
                            ~${(cost / 24000).toFixed(2)}
                        </div>
                    )}
                </div>
            </div>

            {description && (
                <p className="activity-description mt-3 text-gray-600" style={{ marginLeft: editable ? '40px' : '0' }}>
                    {description}
                </p>
            )}

            <div className="activity-actions mt-4 flex flex-wrap gap-3 items-center justify-between" style={{ marginLeft: editable ? '40px' : '0' }}>
                <div className="flex gap-3">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        📍 View on Map
                    </button>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        ❤️ Add to Favorites
                    </button>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        ℹ️ Details →
                    </button>
                </div>

                {editable && (
                    <div className="flex gap-2">
                        <button
                            onClick={onEdit}
                            className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition"
                        >
                            ✏️ Edit
                        </button>
                        <button
                            onClick={onDelete}
                            className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Day Edit Form Component
const DayEditForm = ({ day, onSave, onCancel }) => {
    const [title, setTitle] = useState(day.title || '');
    const [description, setDescription] = useState(day.description || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ title, description });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3" onClick={(e) => e.stopPropagation()}>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Exploring Old Hanoi"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Brief description of the day's theme..."
                />
            </div>
            <div className="flex gap-2">
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                    💾 Save
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onCancel();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                    ✖️ Cancel
                </button>
            </div>
        </form>
    );
};

// Activity Edit Form Component
const ActivityEditForm = ({ activity, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        activity_name: activity.activity_name || '',
        start_time: activity.start_time || '',
        end_time: activity.end_time || '',
        duration_hours: activity.duration_hours || 1,
        description: activity.description || '',
        cost: activity.cost || 0,
        optional: activity.optional || false
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="activity-card bg-blue-50">
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name</label>
                        <input
                            type="text"
                            value={formData.activity_name}
                            onChange={(e) => handleChange('activity_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                            type="time"
                            value={formData.start_time}
                            onChange={(e) => handleChange('start_time', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                            type="time"
                            value={formData.end_time}
                            onChange={(e) => handleChange('end_time', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                        <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={formData.duration_hours}
                            onChange={(e) => handleChange('duration_hours', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cost (VND)</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.cost}
                            onChange={(e) => handleChange('cost', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows="2"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.optional}
                                onChange={(e) => handleChange('optional', e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Optional Activity</span>
                        </label>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        💾 Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                        ✖️ Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

// Activity Add Form Component
const ActivityAddForm = ({ onAdd, onCancel, destinationId, destinationName }) => {
    const [formData, setFormData] = useState({
        poi_id: '',
        activity_name: '',
        start_time: '',
        end_time: '',
        duration_hours: 1,
        description: '',
        cost: 0,
        optional: true
    });
    const [pois, setPois] = useState([]);
    const [loadingPOIs, setLoadingPOIs] = useState(false);
    const [selectedPOI, setSelectedPOI] = useState(null);

    // Load POIs when component mounts
    useEffect(() => {
        const loadPOIs = async () => {
            if (!destinationId) {
                toast.error('Destination ID is required to load POIs');
                return;
            }

            setLoadingPOIs(true);
            try {
                const response = await getPOIsByDestination(destinationId);
                setPois(response.data || []);
                console.log(`Loaded ${response.data?.length || 0} POIs for destination ${destinationId}`);
            } catch (error) {
                console.error('Failed to load POIs:', error);
                toast.error('Failed to load POIs for this destination');
            } finally {
                setLoadingPOIs(false);
            }
        };

        loadPOIs();
    }, [destinationId]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle POI selection
    const handlePOISelect = (e) => {
        const poiId = e.target.value;
        const poi = pois.find(p => p._id === poiId);

        setSelectedPOI(poi);
        setFormData(prev => ({
            ...prev,
            poi_id: poiId,
            // Auto-fill activity name from POI name if empty
            activity_name: prev.activity_name || poi?.name || '',
            // Auto-fill description from POI description if empty
            description: prev.description || poi?.description || '',
            // Auto-fill cost from POI entry fee if available
            cost: prev.cost || poi?.entry_fee || 0
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
    };

    return (
        <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <h4 className="text-lg font-semibold mb-3">➕ Add New Activity</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select POI (Point of Interest) <span className="text-red-500">*</span>
                        </label>
                        {loadingPOIs ? (
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                                Loading POIs...
                            </div>
                        ) : (
                            <select
                                value={formData.poi_id}
                                onChange={handlePOISelect}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                            >
                                <option value="">-- Select a POI --</option>
                                {pois.map((poi) => (
                                    <option key={poi._id} value={poi._id}>
                                        {poi.name} {poi.category ? `(${poi.category})` : ''}
                                    </option>
                                ))}
                            </select>
                        )}
                        {selectedPOI && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                                <p className="font-medium text-blue-900">{selectedPOI.name}</p>
                                {selectedPOI.description && (
                                    <p className="text-blue-700 text-xs mt-1">{selectedPOI.description}</p>
                                )}
                                {selectedPOI.address && (
                                    <p className="text-blue-600 text-xs mt-1">📍 {selectedPOI.address}</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Activity Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.activity_name}
                            onChange={(e) => handleChange('activity_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="e.g., Lunch at Bun Cha Restaurant"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                            type="time"
                            value={formData.start_time}
                            onChange={(e) => handleChange('start_time', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                            type="time"
                            value={formData.end_time}
                            onChange={(e) => handleChange('end_time', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                        <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={formData.duration_hours}
                            onChange={(e) => handleChange('duration_hours', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cost (VND)</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.cost}
                            onChange={(e) => handleChange('cost', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            rows="2"
                            placeholder="Brief description of the activity..."
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.optional}
                                onChange={(e) => handleChange('optional', e.target.checked)}
                                className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Optional Activity</span>
                        </label>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                        ✅ Add Activity
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                        ✖️ Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ItineraryView;
