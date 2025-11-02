import React, { useState } from 'react';

const ItineraryFinder = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // Check if we can find any existing itineraries
    const findExistingItineraries = async () => {
        setSearching(true);
        setSearchResults([]);

        const results = [];

        // Try to get user's itineraries from common endpoints
        const endpoints = [
            '/ai-itinerary/my-itineraries',
            '/ai-itinerary',
            '/itinerary',
            '/user/itineraries'
        ];

        for (const endpoint of endpoints) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/api${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    results.push({
                        endpoint,
                        status: 'SUCCESS',
                        data: data
                    });
                } else {
                    const errorData = await response.json().catch(() => null);
                    results.push({
                        endpoint,
                        status: 'ERROR',
                        statusCode: response.status,
                        error: errorData || response.statusText
                    });
                }
            } catch (error) {
                results.push({
                    endpoint,
                    status: 'FAILED',
                    error: error.message
                });
            }
        }

        setSearchResults(results);
        setSearching(false);
    };

    // Test specific itinerary ID
    const testItineraryId = async (id) => {
        if (!id.trim()) return;

        const token = localStorage.getItem('token');
        const testEndpoints = [
            `/ai-itinerary/${id}`,
            `/ai-itinerary/${id}/editable`,
        ];

        const results = [];

        for (const endpoint of testEndpoints) {
            try {
                const response = await fetch(`http://localhost:3000/api${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                results.push({
                    endpoint,
                    status: response.ok ? 'SUCCESS' : 'ERROR',
                    statusCode: response.status,
                    data: response.ok ? data : null,
                    error: !response.ok ? data : null
                });

            } catch (error) {
                results.push({
                    endpoint,
                    status: 'FAILED',
                    error: error.message
                });
            }
        }

        setSearchResults(prev => [...prev, ...results]);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ color: '#333', marginBottom: '20px' }}>🔍 Itinerary Finder & Tester</h3>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={findExistingItineraries}
                    disabled={searching}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: searching ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: searching ? 'not-allowed' : 'pointer',
                        marginRight: '10px'
                    }}
                >
                    {searching ? '🔄 Searching...' : '🔍 Find My Itineraries'}
                </button>

                <div style={{ marginTop: '10px' }}>
                    <input
                        type="text"
                        placeholder="Enter itinerary ID to test"
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            marginRight: '10px',
                            width: '200px'
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                testItineraryId(e.target.value);
                                e.target.value = '';
                            }
                        }}
                    />
                    <span style={{ fontSize: '12px', color: '#666' }}>Press Enter to test</span>
                </div>
            </div>

            {/* Results */}
            <div>
                <h4>📋 Search Results</h4>
                {searchResults.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>
                        No searches performed yet. Click "Find My Itineraries" to start.
                    </p>
                ) : (
                    <div>
                        {searchResults.map((result, index) => (
                            <div key={index} style={{
                                marginBottom: '15px',
                                padding: '12px',
                                backgroundColor:
                                    result.status === 'SUCCESS' ? '#d4edda' :
                                        result.status === 'ERROR' ? '#f8d7da' : '#f8d7da',
                                border: `1px solid ${result.status === 'SUCCESS' ? '#c3e6cb' :
                                        result.status === 'ERROR' ? '#f5c6cb' : '#f5c6cb'
                                    }`,
                                borderRadius: '4px'
                            }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                                    {result.status === 'SUCCESS' ? '✅' : '❌'}
                                    {result.endpoint} ({result.statusCode || 'No response'})
                                </div>

                                {result.status === 'SUCCESS' && result.data && (
                                    <div style={{ marginBottom: '8px' }}>
                                        <strong>Data Found:</strong>
                                        <pre style={{
                                            fontSize: '11px',
                                            backgroundColor: 'rgba(0,0,0,0.05)',
                                            padding: '8px',
                                            borderRadius: '3px',
                                            overflow: 'auto',
                                            maxHeight: '150px'
                                        }}>
                                            {JSON.stringify(result.data, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {result.error && (
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#dc3545',
                                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                        padding: '8px',
                                        borderRadius: '3px'
                                    }}>
                                        <strong>Error:</strong> {JSON.stringify(result.error, null, 2)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div style={{
                marginTop: '30px',
                padding: '15px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '5px'
            }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>💡 How to Use</h4>
                <ol style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
                    <li><strong>Find Itineraries:</strong> Click "Find My Itineraries" to search for accessible itineraries</li>
                    <li><strong>Test Specific ID:</strong> Enter an itinerary ID in the input box and press Enter</li>
                    <li><strong>Check Results:</strong> Look for successful responses (✅) that contain itinerary data</li>
                    <li><strong>Copy Working ID:</strong> Use successful itinerary IDs in the Auto Test Suite</li>
                </ol>
            </div>
        </div>
    );
};

export default ItineraryFinder;