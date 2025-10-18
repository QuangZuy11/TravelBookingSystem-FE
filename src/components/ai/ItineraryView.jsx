import React from 'react';
import './AIItinerary.css';

const ItineraryView = ({ itinerary }) => {
    if (!itinerary) return <div>No itinerary to show.</div>;

    // Expect itinerary.days: array or itinerary.daysCount + itinerary.activities grouped
    const days = itinerary.days || (() => {
        // Try to normalize fallback shapes
        if (Array.isArray(itinerary.activities)) {
            // Group activities by day index if present
            const grouped = {};
            itinerary.activities.forEach((act) => {
                const day = act.day || 1;
                if (!grouped[day]) grouped[day] = [];
                grouped[day].push(act);
            });
            return Object.keys(grouped).sort((a, b) => a - b).map(d => ({ day: Number(d), activities: grouped[d] }));
        }
        return [];
    })();

    return (
        <div className="ai-result-wrap">
            <div className="ai-card">
                <h3 className="text-lg font-semibold">Itinerary Overview</h3>
                <p className="itinerary-overview mt-2">{itinerary.summary || itinerary.title || 'Generated itinerary'}</p>
            </div>

            {days.length === 0 && (
                <div className="ai-card">No per-day breakdown found. Showing raw JSON below.</div>
            )}

            {days.map((d) => (
                <div key={d.day} className="itinerary-day">
                    <h4 className="font-semibold">Day {d.day}</h4>
                    <div className="mt-2 space-y-2">
                        {d.activities && d.activities.length > 0 ? (
                            d.activities.map((act, idx) => (
                                <div key={idx} className="activity-item">
                                    <div className="text-sm font-medium">{act.title || act.name || act.activity || `Activity ${idx + 1}`}</div>
                                    <div className="text-xs text-gray-600">{act.time || act.duration || ''}</div>
                                    <div className="text-sm mt-1">{act.description || act.notes || ''}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-600">No activities found for this day.</div>
                        )}
                    </div>
                </div>
            ))}

            <div className="ai-card">
                <h4 className="font-semibold">Budget / Notes</h4>
                <pre className="mt-2 text-sm text-gray-800">{JSON.stringify(itinerary.budget || itinerary.notes || {}, null, 2)}</pre>
            </div>
        </div>
    );
};

export default ItineraryView;
