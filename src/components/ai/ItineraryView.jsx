import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './AIItinerary.css';

/**
 * Modern ItineraryView Component
 * Clean, professional design for displaying AI-generated itineraries
 */
const ItineraryView = ({ data, destination, onUpdate, editable = true }) => {
    const [expandedDays, setExpandedDays] = useState(new Set([1])); // Expand Day 1 by default

    // Debug log to see data structure
    console.log('📋 ItineraryView Data:', {
        data: data,
        keys: Object.keys(data || {}),
        hasItineraryData: !!data?.itinerary_data,
        hasDays: !!data?.days,
        totalCost: data?.totalCost
    });

    // Support both old and new API format
    const itinerary_data = data?.itinerary_data || data?.days || [];

    if (!data || (!itinerary_data || itinerary_data.length === 0)) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">No itinerary data available</p>
                </div>
            </div>
        );
    }

    const { summary, status } = data;

    // Calculate totals
    const totalActivities = itinerary_data.reduce(
        (sum, day) => sum + (day.activities?.length || 0),
        0
    );

    // Use totalCost from API if available, otherwise calculate from days
    const totalCost = data.totalCost || itinerary_data.reduce(
        (sum, day) => sum + (day.dayTotal || day.day_total || day.activities?.reduce((daySum, act) => daySum + (act.cost || 0), 0) || 0),
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

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="relative bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                            Your Travel Itinerary
                        </h1>
                        <p className="text-xl text-gray-600 mb-1">{destination}</p>
                        {summary && (
                            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                                {summary}
                            </p>
                        )}
                    </div>

                    {/* Stats Cards */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                            <div className="text-2xl font-bold text-blue-700">{itinerary_data.length}</div>
                            <div className="text-sm text-blue-600 font-medium">Days</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                            <div className="text-2xl font-bold text-green-700">{totalActivities}</div>
                            <div className="text-sm text-green-600 font-medium">Activities</div>
                        </div>
                        {totalCost > 0 && (
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                                <div className="text-lg font-bold text-orange-700">{totalCost.toLocaleString()} VND</div>
                                <div className="text-sm text-orange-600 font-medium">Est. Cost</div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Save to My Trips
                        </button>
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                            Share
                        </button>
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Book Tours
                        </button>
                    </div>
                </div>
            </div>

            {/* Days Timeline */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {itinerary_data.map((dayData, index) => {
                        // Handle both old and new API format
                        const dayNumber = dayData.dayNumber || dayData.day || dayData.itinerary?.day_number || (index + 1);
                        const dayTheme = dayData.theme || dayData.itinerary?.title || `Day ${dayNumber}`;
                        const dayDescription = dayData.itinerary?.description || '';
                        const activities = dayData.activities || [];
                        const isExpanded = expandedDays.has(dayNumber);

                        const dayCost = dayData.dayTotal || dayData.day_total || activities?.reduce((sum, act) => sum + (act.cost || 0), 0) || 0;

                        return (
                            <div key={dayData._id || `day-${dayNumber}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                                {/* Day Header */}
                                <div
                                    className="bg-gray-50 border-b border-gray-200 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                                    onClick={() => toggleDay(dayNumber)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                    {dayNumber}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    Day {dayNumber}: {dayTheme}
                                                </h3>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                    <span className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        {activities?.length || 0} activities
                                                    </span>
                                                    {dayCost > 0 && (
                                                        <span className="flex items-center">
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                            </svg>
                                                            {dayCost.toLocaleString()} VND
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                                                onClick={(e) => e.stopPropagation()}
                                                title="Add to favorites"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            </button>
                                            <div className={`p-2 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`}>
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Activities */}
                                {isExpanded && (
                                    <div className="p-6">
                                        {!activities || activities.length === 0 ? (
                                            <div className="text-center py-8">
                                                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h4a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1h4z" />
                                                </svg>
                                                <p className="text-gray-500">No activities planned for this day</p>
                                            </div>
                                        ) : (
                                            <SimpleActivitiesList
                                                activities={activities}
                                                dayId={`day-${dayNumber}`}
                                                dayNumber={dayNumber}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Travel Tips Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Travel Tips
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-start space-x-3">
                            <svg className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Best visited October-April for pleasant weather</span>
                        </div>
                        <div className="flex items-start space-x-3">
                            <svg className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Bring comfortable walking shoes for exploring</span>
                        </div>
                        <div className="flex items-start space-x-3">
                            <svg className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Try authentic local street food for the best experience</span>
                        </div>
                        <div className="flex items-start space-x-3">
                            <svg className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Book popular attractions in advance to avoid queues</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="bg-blue-600 py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Ready to Book Your Trip?</h3>
                    <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                        Turn this itinerary into reality. Book accommodations, tours, and activities for an unforgettable experience.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="bg-white text-blue-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
                            Book This Trip
                        </button>
                        <button className="border border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
                            Contact Us
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Activities List Component
const SimpleActivitiesList = ({ activities, dayId, dayNumber }) => {
    return (
        <div className="space-y-4">
            {activities.map((activity, index) => (
                <SimpleActivityCard
                    key={`${dayId}-activity-${index}`}
                    activity={activity}
                    index={index + 1}
                />
            ))}
        </div>
    );
};

// Activity Card Component
const SimpleActivityCard = ({ activity, index }) => {
    // Handle both old and new API format
    const time = activity.time || activity.timeSlot || `Activity ${index}`;
    const activityName = activity.activity || activity.name || activity.location || 'Activity';
    const location = activity.location || '';
    const cost = activity.cost || 0;
    const duration = activity.duration ? `${activity.duration} min` : 'Duration varies';
    const type = activity.type || 'activity';

    // Get type info with SVG icons
    const getTypeInfo = (type) => {
        const typeMap = {
            'food': {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                ),
                color: 'bg-orange-100 text-orange-700 border-orange-200'
            },
            'transport': {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                ),
                color: 'bg-blue-100 text-blue-700 border-blue-200'
            },
            'sightseeing': {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                ),
                color: 'bg-purple-100 text-purple-700 border-purple-200'
            },
            'entertainment': {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                ),
                color: 'bg-pink-100 text-pink-700 border-pink-200'
            },
            'accommodation': {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                ),
                color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
            },
            'beach': {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                ),
                color: 'bg-cyan-100 text-cyan-700 border-cyan-200'
            },
            'water activities': {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                ),
                color: 'bg-teal-100 text-teal-700 border-teal-200'
            },
            'free time': {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                ),
                color: 'bg-gray-100 text-gray-700 border-gray-200'
            }
        };
        return typeMap[type] || {
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            color: 'bg-gray-100 text-gray-700 border-gray-200'
        };
    };

    const typeInfo = getTypeInfo(type);

    return (
        <div className="relative bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors duration-200">
            {/* Activity Timeline Number */}
            <div className="absolute -left-3 top-4">
                <div className="w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {index}
                </div>
            </div>

            <div className="ml-4">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded border">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {time}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded border">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                {duration}
                            </span>
                            {type && (
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded border ${typeInfo.color}`}>
                                    {typeInfo.icon}
                                    <span className="ml-1 capitalize">{type}</span>
                                </span>
                            )}
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 mb-1 leading-tight">
                            {activityName}
                        </h4>
                        {location && (
                            <p className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {location}
                            </p>
                        )}
                    </div>

                    {/* Cost */}
                    <div className="flex-shrink-0 text-right ml-4">
                        {cost === 0 ? (
                            <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 border border-green-200 rounded-full">
                                FREE
                            </span>
                        ) : (
                            <div>
                                <div className="text-sm font-semibold text-gray-900">
                                    {cost.toLocaleString()} VND
                                </div>
                                <div className="text-xs text-gray-500">
                                    ~${(cost / 24000).toFixed(2)} USD
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
                    <button className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        View Map
                    </button>
                    <button className="inline-flex items-center text-xs text-gray-600 hover:text-red-600 font-medium transition-colors duration-200">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Save
                    </button>
                    <button className="inline-flex items-center text-xs text-gray-600 hover:text-gray-700 font-medium transition-colors duration-200">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItineraryView;