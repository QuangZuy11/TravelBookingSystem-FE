import React from 'react';
import { getProxiedGoogleDriveUrl } from '../../utils/googleDriveImageHelper';

/**
 * Smart Image Component - Automatically proxies Google Drive images
 * 
 * Usage: Replace <img src={url} /> with <SmartImage src={url} />
 * 
 * @param {string} src - Image URL (Google Drive or regular)
 * @param {string} alt - Alt text
 * @param {object} style - Inline styles
 * @param {string} className - CSS classes
 * @param {function} onLoad - onLoad handler
 * @param {function} onError - onError handler
 * @param {object} ...props - Other img attributes
 */
const SmartImage = ({ src, alt, style, className, onLoad, onError, ...props }) => {
    // Automatically proxy Google Drive URLs
    const displaySrc = src ? getProxiedGoogleDriveUrl(src) : '';

    const handleError = (e) => {
        console.warn('Image failed to load:', displaySrc);
        if (onError) {
            onError(e);
        }
    };

    return (
        <img
            src={displaySrc}
            alt={alt}
            style={style}
            className={className}
            onLoad={onLoad}
            onError={handleError}
            {...props}
        />
    );
};

export default SmartImage;
