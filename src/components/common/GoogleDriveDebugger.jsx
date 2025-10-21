import React, { useState } from 'react';
import {
    extractGoogleDriveFileId,
    convertGoogleDriveUrl,
    getGoogleDriveFallbackUrls,
    isGoogleDriveUrl,
    getGoogleDriveSharingUrl
} from '../utils/googleDriveHelper';

/**
 * Google Drive Image Debugger Component
 * 
 * Use this component to test and debug Google Drive image URLs
 * Add it temporarily to any page to test URLs
 */
export const GoogleDriveDebugger = () => {
    const [testUrl, setTestUrl] = useState('https://drive.google.com/uc?id=1niN-1UZTAGKLYYeV8PIW2m04wvO1Z-Im&export=download');
    const [currentFallbackIndex, setCurrentFallbackIndex] = useState(0);

    const fileId = extractGoogleDriveFileId(testUrl);
    const convertedUrl = convertGoogleDriveUrl(testUrl);
    const fallbackUrls = fileId ? getGoogleDriveFallbackUrls(fileId) : [];
    const sharingUrl = getGoogleDriveSharingUrl(testUrl);
    const isDriveUrl = isGoogleDriveUrl(testUrl);

    const testImageUrl = fallbackUrls[currentFallbackIndex] || convertedUrl;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '400px',
            maxHeight: '600px',
            background: 'white',
            border: '2px solid #667eea',
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            zIndex: 9999,
            overflow: 'auto',
            fontSize: '0.875rem'
        }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#667eea' }}>
                🔍 Google Drive Debugger
            </h3>

            {/* Input URL */}
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                    Test URL:
                </label>
                <textarea
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        minHeight: '60px'
                    }}
                />
            </div>

            {/* Detection Results */}
            <div style={{
                background: isDriveUrl ? '#dcfce7' : '#fee2e2',
                padding: '0.75rem',
                borderRadius: '6px',
                marginBottom: '1rem'
            }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                    {isDriveUrl ? '✅ Google Drive URL Detected' : '❌ Not a Google Drive URL'}
                </div>
                {fileId && (
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        File ID: <strong>{fileId}</strong>
                    </div>
                )}
            </div>

            {/* Converted URL */}
            {isDriveUrl && (
                <>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                            Converted URL:
                        </label>
                        <div style={{
                            background: '#f3f4f6',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontFamily: 'monospace',
                            wordBreak: 'break-all'
                        }}>
                            {convertedUrl}
                        </div>
                    </div>

                    {/* Image Preview */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                            Preview (Fallback {currentFallbackIndex + 1}/{fallbackUrls.length}):
                        </label>
                        <div style={{
                            border: '2px dashed #ddd',
                            borderRadius: '6px',
                            padding: '1rem',
                            textAlign: 'center',
                            background: '#f9fafb'
                        }}>
                            <img
                                src={testImageUrl}
                                alt="Test preview"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '200px',
                                    borderRadius: '6px'
                                }}
                                onError={() => {
                                    console.error('Failed to load:', testImageUrl);
                                }}
                                onLoad={() => {
                                    console.log('✅ Successfully loaded:', testImageUrl);
                                }}
                            />
                        </div>

                        {/* Fallback Controls */}
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            marginTop: '0.5rem',
                            justifyContent: 'center'
                        }}>
                            {fallbackUrls.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentFallbackIndex(index)}
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        fontSize: '0.75rem',
                                        border: index === currentFallbackIndex ? '2px solid #667eea' : '1px solid #ddd',
                                        background: index === currentFallbackIndex ? '#667eea' : 'white',
                                        color: index === currentFallbackIndex ? 'white' : '#333',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Fallback URLs List */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                            All Fallback URLs:
                        </label>
                        <div style={{
                            background: '#f3f4f6',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            maxHeight: '150px',
                            overflow: 'auto'
                        }}>
                            {fallbackUrls.map((url, index) => (
                                <div
                                    key={index}
                                    style={{
                                        fontSize: '0.7rem',
                                        fontFamily: 'monospace',
                                        marginBottom: '0.5rem',
                                        wordBreak: 'break-all',
                                        padding: '0.25rem',
                                        background: index === currentFallbackIndex ? '#dbeafe' : 'transparent',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <strong>{index + 1}.</strong> {url}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        flexDirection: 'column'
                    }}>
                        <a
                            href={sharingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '0.5rem',
                                background: '#667eea',
                                color: 'white',
                                textAlign: 'center',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '0.8rem'
                            }}
                        >
                            🔗 Open Sharing Settings
                        </a>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(testImageUrl);
                                alert('URL copied to clipboard!');
                            }}
                            style={{
                                padding: '0.5rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                            }}
                        >
                            📋 Copy Current URL
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default GoogleDriveDebugger;
