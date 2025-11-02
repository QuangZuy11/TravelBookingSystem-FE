import React, { useState, useEffect } from 'react';
import { analyzeJWTToken } from '../utils/jwtHelpers';

const PermissionAlert = ({ itineraryId }) => {
    const [permissionInfo, setPermissionInfo] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const checkPermissions = () => {
            const jwtInfo = analyzeJWTToken();
            setPermissionInfo(jwtInfo);
        };

        checkPermissions();
    }, [itineraryId]);

    if (!permissionInfo || permissionInfo.error) {
        return (
            <div style={alertStyles.error}>
                <div style={alertStyles.title}>⚠️ Authentication Issue</div>
                <div>Token error: {permissionInfo?.error || 'Unknown error'}</div>
                <div style={alertStyles.action}>
                    Please <a href="/auth/login">login again</a> to edit this itinerary.
                </div>
            </div>
        );
    }

    if (permissionInfo.isExpired) {
        return (
            <div style={alertStyles.error}>
                <div style={alertStyles.title}>⏰ Token Expired</div>
                <div>Your session expired at {permissionInfo.expiresAt?.toLocaleString()}</div>
                <div style={alertStyles.action}>
                    Please <a href="/auth/login">login again</a> to continue.
                </div>
            </div>
        );
    }

    // Check if user role might cause issues
    const isServiceProvider = permissionInfo.userRole === 'ServiceProvider';
    const showWarning = isServiceProvider;

    return (
        <div style={showWarning ? alertStyles.warning : alertStyles.info}>
            <div style={alertStyles.title}>
                🔐 Edit Permissions - {permissionInfo.userRole}
            </div>

            {isServiceProvider && (
                <div style={alertStyles.warningText}>
                    <strong>⚠️ Potential Issue:</strong> ServiceProvider accounts may not be able to edit traveler itineraries.
                    If you get permission errors, try switching to a Traveler account.
                </div>
            )}

            <div style={alertStyles.userInfo}>
                <strong>Current User:</strong> {permissionInfo.userId} ({permissionInfo.userRole})
                <br />
                <strong>Editing Itinerary:</strong> {itineraryId}
                <br />
                <strong>Token Valid Until:</strong> {permissionInfo.expiresAt?.toLocaleString()}
            </div>

            <button
                onClick={() => setShowDetails(!showDetails)}
                style={alertStyles.toggleButton}
            >
                {showDetails ? '🔼 Hide Details' : '🔽 Show Details'}
            </button>

            {showDetails && (
                <div style={alertStyles.details}>
                    <strong>Full JWT Info:</strong>
                    <pre style={alertStyles.pre}>
                        {JSON.stringify(permissionInfo, null, 2)}
                    </pre>

                    <div style={alertStyles.troubleshooting}>
                        <strong>🛠️ Troubleshooting Tips:</strong>
                        <ul>
                            <li>Make sure you created this itinerary</li>
                            <li>Check if your account type matches the itinerary type</li>
                            <li>Try refreshing the page</li>
                            <li>If issues persist, try logging out and back in</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

const alertStyles = {
    error: {
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        padding: '15px',
        margin: '10px 0',
        color: '#721c24'
    },
    warning: {
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        padding: '15px',
        margin: '10px 0',
        color: '#856404'
    },
    info: {
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '8px',
        padding: '15px',
        margin: '10px 0',
        color: '#155724'
    },
    title: {
        fontWeight: 'bold',
        fontSize: '16px',
        marginBottom: '10px'
    },
    warningText: {
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '10px'
    },
    userInfo: {
        fontSize: '14px',
        marginBottom: '10px',
        fontFamily: 'monospace'
    },
    action: {
        marginTop: '10px',
        fontWeight: 'bold'
    },
    toggleButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 10px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    details: {
        marginTop: '15px',
        padding: '10px',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: '4px'
    },
    pre: {
        fontSize: '10px',
        backgroundColor: '#f8f9fa',
        padding: '8px',
        borderRadius: '4px',
        overflow: 'auto',
        maxHeight: '200px'
    },
    troubleshooting: {
        marginTop: '10px',
        fontSize: '12px'
    }
};

export default PermissionAlert;