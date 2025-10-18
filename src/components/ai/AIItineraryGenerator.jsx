import React, { useState } from 'react';
import { useItinerary } from '../../hooks/useItinerary';
import ItineraryView from './ItineraryView';
import './AIItinerary.css';
import { tourApi } from '../../api/tourApi';

// Reuse homepage layout pieces so the page format matches Homepage
import TopBar from '../layout/Topbar/Topbar';
import Header from '../layout/Header/Header';
import Footer from '../layout/Footer/Footer';

const AIItineraryGenerator = () => {
    const [days, setDays] = useState(3);
    const [budget, setBudget] = useState('medium');
    const [travelers, setTravelers] = useState(2);
    const [interests, setInterests] = useState('sightseeing,food');
    const [result, setResult] = useState(null);
    const { generateItineraryFromAI, loading } = useItinerary(null);
    const [destination, setDestination] = useState('Hanoi');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [duration, setDuration] = useState(days);
    const [estimatedBudget, setEstimatedBudget] = useState('');
    const [ageRange, setAgeRange] = useState('25-40');
    const [status, setStatus] = useState('pending');

    const onSubmit = async (e) => {
        e.preventDefault();
        setResult(null);
        try {
            const payload = {
                days,
                budget,
                travelers,
                interests: interests.split(',').map((s) => s.trim()),
            };

            const generated = await generateItineraryFromAI(payload);
            setResult(generated);
        } catch (err) {
            setResult({ error: err.message || 'Lỗi khi gọi AI' });
        }
    };

    return (
        <>
            <TopBar />
            <Header />

            <main className="container mx-auto px-4 py-8">
                <section className="max-w-4xl mx-auto ai-card">
                    <h2 className="text-2xl font-semibold mb-4">AI Itinerary Generator</h2>

                    <form onSubmit={onSubmit} className="ai-form-grid">
                        <div className="full">
                            <label className="block text-sm font-medium">Destination</label>
                            <input className="ai-input" value={destination} onChange={(e) => setDestination(e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Start date</label>
                            <input className="ai-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">End date</label>
                            <input className="ai-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Duration (days)</label>
                            <input className="ai-input" type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Participants</label>
                            <input className="ai-input" type="number" min={1} value={travelers} onChange={(e) => setTravelers(Number(e.target.value))} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Age range</label>
                            <input className="ai-input" value={ageRange} onChange={(e) => setAgeRange(e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Estimated budget</label>
                            <input className="ai-input" type="number" value={estimatedBudget} onChange={(e) => setEstimatedBudget(Number(e.target.value))} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Status</label>
                            <select className="ai-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="pending">pending</option>
                                <option value="completed">completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Days</label>
                            <input className="ai-input" type="number" min={1} value={days} onChange={(e) => setDays(Number(e.target.value))} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Budget</label>
                            <select className="ai-select" value={budget} onChange={(e) => setBudget(e.target.value)}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Travelers</label>
                            <input className="ai-input" type="number" min={1} value={travelers} onChange={(e) => setTravelers(Number(e.target.value))} />
                        </div>

                        <div className="full">
                            <label className="block text-sm font-medium">Interests (comma separated)</label>
                            <input className="ai-input" value={interests} onChange={(e) => setInterests(e.target.value)} />
                        </div>

                        <div className="full">
                            <button disabled={loading} type="submit" className="ai-button">
                                {loading ? 'Generating...' : 'Generate Itinerary'}
                            </button>
                        </div>
                        <div className="full">
                            <button type="button" className="ai-button" onClick={async () => {
                                // Build request payload based on fields
                                const requestPayload = {
                                    destination,
                                    start_date: startDate || null,
                                    end_date: endDate || null,
                                    duration_days: duration,
                                    participant_number: travelers,
                                    age_range: ageRange.split(',').map(s => s.trim()),
                                    budget_level: budget,
                                    estimated_budget: estimatedBudget ? Number(estimatedBudget) : null,
                                    preferences: interests.split(',').map(s => s.trim()),
                                    status,
                                };
                                try {
                                    await tourApi.createAiItineraryRequest(requestPayload);
                                    alert('Request saved');
                                } catch (err) {
                                    alert('Cannot save request: ' + (err.message || 'Error'));
                                }
                            }}>Save request</button>
                        </div>
                    </form>
                </section>

                <section className="max-w-4xl mx-auto mt-6">
                    <h3 className="text-lg font-medium mb-3">Result</h3>
                    <div className="bg-gray-50 p-4 rounded">
                        {result ? <ItineraryView itinerary={result} /> : <div className="text-sm text-gray-600">No result yet</div>}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
};

export default AIItineraryGenerator;
