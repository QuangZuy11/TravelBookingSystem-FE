import React, { useState } from 'react';

const TokenDebugger = () => {
    const [debugInfo, setDebugInfo] = useState({});

    const checkAuthHeaders = async () => {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

        // Create test request to see what headers are sent
        const testUrl = 'http://localhost:3000/api/ai-itinerary/1/editable';

        const info = {
            tokenKeys: {
                token: localStorage.getItem('token'),
                accessToken: localStorage.getItem('accessToken'),
                authToken: localStorage.getItem('authToken'),
                refreshToken: localStorage.getItem('refreshToken')
            },
            selectedToken: token,
            tokenPreview: token ? `${token.substring(0, 30)}...` : 'None',
            allLocalStorageKeys: Object.keys(localStorage),
            testingUrl: testUrl
        };

        setDebugInfo(info);

        // Test actual fetch request
        try {
            const response = await fetch(testUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            setDebugInfo(prev => ({
                ...prev,
                fetchTest: {
                    success: response.ok,
                    status: response.status,
                    statusText: response.statusText,
                    response: data,
                    headers: {
                        authorization: `Bearer ${token ? token.substring(0, 30) + '...' : 'None'}`
                    }
                }
            }));

        } catch (error) {
            setDebugInfo(prev => ({
                ...prev,
                fetchTest: {
                    success: false,
                    error: error.message
                }
            }));
        }
    };

    const clearAndTest = () => {
        localStorage.clear();
        setDebugInfo({});
        alert('localStorage cleared! Please login again.');
    };

    const addTestToken = () => {
        // Add a test token
        const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
        localStorage.setItem('token', testToken);
        localStorage.setItem('fullName', 'Test User');
        localStorage.setItem('role', 'Traveler');
        alert('Test token added! Try the auth check now.');
    };

    return (
        <div style={{
            position: 'fixed',
            top: '50px',
            right: '10px',
            backgroundColor: 'white',
            border: '2px solid #007bff',
            borderRadius: '8px',
            padding: '15px',
            width: '400px',
            maxHeight: '80vh',
            overflow: 'auto',
            zIndex: 10000,
            fontSize: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#007bff' }}>🔍 Token Debugger</h3>

            <div style={{ marginBottom: '10px' }}>
                <button onClick={checkAuthHeaders} style={buttonStyle}>
                    🔎 Check Auth Status
                </button>
                <button onClick={addTestToken} style={{ ...buttonStyle, backgroundColor: '#28a745' }}>
                    🧪 Add Test Token
                </button>
                <button onClick={clearAndTest} style={{ ...buttonStyle, backgroundColor: '#dc3545' }}>
                    🗑️ Clear & Reset
                </button>
            </div>

            {Object.keys(debugInfo).length > 0 && (
                <div>
                    <h4>📋 Debug Results:</h4>

                    <div style={sectionStyle}>
                        <strong>Token Keys in localStorage:</strong>
                        <pre style={preStyle}>
                            {JSON.stringify(debugInfo.tokenKeys, null, 2)}
                        </pre>
                    </div>

                    {debugInfo.selectedToken && (
                        <div style={sectionStyle}>
                            <strong>Selected Token Preview:</strong>
                            <div style={preStyle}>{debugInfo.tokenPreview}</div>
                        </div>
                    )}

                    <div style={sectionStyle}>
                        <strong>All localStorage Keys:</strong>
                        <div style={preStyle}>{debugInfo.allLocalStorageKeys?.join(', ')}</div>
                    </div>

                    {debugInfo.fetchTest && (
                        <div style={sectionStyle}>
                            <strong>🌐 Fetch Test Result:</strong>
                            <div style={{
                                ...preStyle,
                                backgroundColor: debugInfo.fetchTest.success ? '#d4edda' : '#f8d7da',
                                border: `1px solid ${debugInfo.fetchTest.success ? '#c3e6cb' : '#f5c6cb'}`
                            }}>
                                Status: {debugInfo.fetchTest.success ? '✅' : '❌'} {debugInfo.fetchTest.status} {debugInfo.fetchTest.statusText}
                                <br />
                                {debugInfo.fetchTest.response && (
                                    <>Response: {JSON.stringify(debugInfo.fetchTest.response, null, 2)}</>
                                )}
                                {debugInfo.fetchTest.error && (
                                    <>Error: {debugInfo.fetchTest.error}</>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div style={{ ...sectionStyle, backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
                <strong>💡 Quick Fix Tips:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '11px' }}>
                    <li>If no token found → Login again</li>
                    <li>If 401 error → Token expired/invalid</li>
                    <li>If token present but 401 → Backend auth issue</li>
                    <li>Check Network tab for actual request headers</li>
                </ul>
            </div>
        </div>
    );
};

const buttonStyle = {
    marginRight: '5px',
    marginBottom: '5px',
    padding: '5px 10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '11px'
};

const sectionStyle = {
    marginBottom: '10px',
    padding: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px'
};

const preStyle = {
    fontSize: '10px',
    margin: '5px 0 0 0',
    padding: '5px',
    backgroundColor: '#e9ecef',
    borderRadius: '3px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all'
};

export default TokenDebugger;