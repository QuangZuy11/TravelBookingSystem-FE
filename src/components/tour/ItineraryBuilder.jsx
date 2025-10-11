import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Badge from '@components/common/Badge';
import ActivityForm from './ActivityForm';
import { cn } from '@utils/tourHelpers';

/**
 * Itinerary Builder Component
 * Allows creating and managing multi-day tour itineraries with activities
 * 
 * @param {Object} props
 * @param {Array} props.itinerary - Itinerary data with activities
 * @param {Function} props.onAddActivity - Add activity handler
 * @param {Function} props.onUpdateActivity - Update activity handler
 * @param {Function} props.onDeleteActivity - Delete activity handler
 * @param {Function} props.onReorderActivities - Reorder activities handler
 * @param {boolean} props.readOnly - Read-only mode
 */
const ItineraryBuilder = ({
    itinerary,
    onAddActivity,
    onUpdateActivity,
    onDeleteActivity,
    onReorderActivities,
    readOnly = false,
}) => {
    const [expandedDays, setExpandedDays] = useState({});
    const [editingActivity, setEditingActivity] = useState(null);
    const [showActivityForm, setShowActivityForm] = useState(false);
    const [selectedDay, setSelectedDay] = useState(1);

    // Group activities by day
    const groupActivitiesByDay = () => {
        const grouped = {};
        const activities = itinerary?.activities || [];

        activities.forEach((activity) => {
            const day = activity.dayNumber || 1;
            if (!grouped[day]) {
                grouped[day] = [];
            }
            grouped[day].push(activity);
        });

        // Sort activities by order within each day
        Object.keys(grouped).forEach((day) => {
            grouped[day].sort((a, b) => (a.order || 0) - (b.order || 0));
        });

        return grouped;
    };

    const groupedActivities = groupActivitiesByDay();
    const totalDays = itinerary?.duration?.days || 1;
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);

    const toggleDay = (day) => {
        setExpandedDays((prev) => ({
            ...prev,
            [day]: !prev[day],
        }));
    };

    const handleAddActivity = (day) => {
        setSelectedDay(day);
        setEditingActivity(null);
        setShowActivityForm(true);
    };

    const handleEditActivity = (activity) => {
        setEditingActivity(activity);
        setSelectedDay(activity.dayNumber);
        setShowActivityForm(true);
    };

    const handleSaveActivity = async (activityData) => {
        try {
            if (editingActivity) {
                await onUpdateActivity(editingActivity._id, activityData);
            } else {
                await onAddActivity({ ...activityData, dayNumber: selectedDay });
            }
            setShowActivityForm(false);
            setEditingActivity(null);
        } catch (error) {
            console.error('Error saving activity:', error);
        }
    };

    const handleDeleteActivity = async (activityId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa hoạt động này?')) {
            try {
                await onDeleteActivity(activityId);
            } catch (error) {
                console.error('Error deleting activity:', error);
            }
        }
    };

    const getActivityTypeIcon = (type) => {
        const icons = {
            sightseeing: '🏛️',
            meal: '🍽️',
            transportation: '🚗',
            accommodation: '🏨',
            free_time: '🕐',
            other: '📋',
        };
        return icons[type] || '📋';
    };

    const getActivityTypeColor = (type) => {
        const colors = {
            sightseeing: 'bg-blue-100 text-blue-800',
            meal: 'bg-orange-100 text-orange-800',
            transportation: 'bg-purple-100 text-purple-800',
            accommodation: 'bg-green-100 text-green-800',
            free_time: 'bg-yellow-100 text-yellow-800',
            other: 'bg-gray-100 text-gray-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Lịch Trình Tour</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {totalDays} ngày • {itinerary?.activities?.length || 0} hoạt động
                    </p>
                </div>
                {!readOnly && (
                    <Button
                        variant="primary"
                        size="sm"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => handleAddActivity(1)}
                    >
                        Thêm Hoạt Động
                    </Button>
                )}
            </div>

            {/* Days Timeline */}
            <div className="space-y-4">
                {days.map((day) => {
                    const dayActivities = groupedActivities[day] || [];
                    const isExpanded = expandedDays[day] !== false; // Default expanded

                    return (
                        <Card key={day} className="overflow-hidden">
                            {/* Day Header */}
                            <div
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-white cursor-pointer hover:from-primary-100 transition-colors"
                                onClick={() => toggleDay(day)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-full font-bold">
                                        {day}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Ngày {day}</h4>
                                        <p className="text-sm text-gray-600">
                                            {dayActivities.length} hoạt động
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!readOnly && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            icon={<Plus className="w-4 h-4" />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddActivity(day);
                                            }}
                                        >
                                            Thêm
                                        </Button>
                                    )}
                                    {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {/* Day Activities */}
                            {isExpanded && (
                                <div className="p-4 space-y-3">
                                    {dayActivities.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p>Chưa có hoạt động nào</p>
                                            {!readOnly && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    icon={<Plus className="w-4 h-4" />}
                                                    onClick={() => handleAddActivity(day)}
                                                    className="mt-3"
                                                >
                                                    Thêm hoạt động đầu tiên
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        dayActivities.map((activity, index) => (
                                            <div
                                                key={activity._id || index}
                                                className={cn(
                                                    'flex items-start gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg',
                                                    'hover:border-primary-300 hover:shadow-md transition-all',
                                                    !readOnly && 'cursor-move'
                                                )}
                                            >
                                                {/* Drag Handle */}
                                                {!readOnly && (
                                                    <div className="text-gray-400 cursor-move pt-1">
                                                        <GripVertical className="w-5 h-5" />
                                                    </div>
                                                )}

                                                {/* Activity Content */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Activity Header */}
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl">
                                                                {getActivityTypeIcon(activity.type)}
                                                            </span>
                                                            <div>
                                                                <h5 className="font-semibold text-gray-900">
                                                                    {activity.title}
                                                                </h5>
                                                                <Badge
                                                                    className={getActivityTypeColor(activity.type)}
                                                                    size="sm"
                                                                >
                                                                    {activity.type}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Activity Details */}
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                        {activity.description}
                                                    </p>

                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            <span>
                                                                {activity.startTime} - {activity.endTime}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{activity.destination?.name || 'N/A'}</span>
                                                        </div>
                                                        {activity.pointsOfInterest?.length > 0 && (
                                                            <Badge variant="info" size="sm">
                                                                {activity.pointsOfInterest.length} POI
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                {!readOnly && (
                                                    <div className="flex flex-col gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditActivity(activity)}
                                                        >
                                                            Sửa
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteActivity(activity._id)}
                                                            icon={<Trash2 className="w-4 h-4 text-red-500" />}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Activity Form Modal */}
            {showActivityForm && (
                <ActivityForm
                    activity={editingActivity}
                    dayNumber={selectedDay}
                    onSave={handleSaveActivity}
                    onCancel={() => {
                        setShowActivityForm(false);
                        setEditingActivity(null);
                    }}
                />
            )}
        </div>
    );
};

export default ItineraryBuilder;
