import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebugger = () => {
    const { user } = useAuth();

    const authData = {
        token: localStorage.getItem('token'),
        fullName: localStorage.getItem('fullName'),
        email: localStorage.getItem('email'),
        providerId: localStorage.getItem('providerId'),
        role: localStorage.getItem('role'),
        userObject: user
    };

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '15px',
            maxWidth: '350px',
            fontSize: '12px',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>🔍 Auth Debug Info</h4>

            <div style={{ marginBottom: '8px' }}>
                <strong>User State:</strong> {user ? '✅ Logged In' : '❌ Not Logged In'}
            </div>

            <div style={{ marginBottom: '8px' }}>
                <strong>Token:</strong> {authData.token ? '✅ Present' : '❌ Missing'}
            </div>

            <div style={{ marginBottom: '8px' }}>
                <strong>Full Name:</strong> {authData.fullName || '❌ Missing'}
            </div>

            <div style={{ marginBottom: '8px' }}>
                <strong>Role:</strong> {authData.role || '❌ Missing'}
            </div>

            {authData.token && (
                <div style={{ marginTop: '10px', fontSize: '11px', color: '#6c757d' }}>
                    <strong>Token Preview:</strong><br />
                    {`${authData.token.substring(0, 20)}...`}
                </div>
            )}

            <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', color: '#007bff' }}>
                    View Full Auth Data
                </summary>
                <pre style={{
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '4px',
                    fontSize: '10px',
                    overflow: 'auto',
                    maxHeight: '200px'
                }}>
                    {JSON.stringify(authData, null, 2)}
                </pre>
            </details>
        </div>
    );
};

export default AuthDebugger;