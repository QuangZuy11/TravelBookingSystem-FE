/**
 * Google Drive Image Helper Utilities
 * 
 * This utility helps convert various Google Drive URL formats
 * into a format that works with <img> tags and handles CORS properly.
 */

/**
 * Extract file ID from various Google Drive URL formats
 * @param {string} url - Google Drive URL
 * @returns {string|null} - Extracted file ID or null
 */
export const extractGoogleDriveFileId = (url) => {
    if (!url || typeof url !== 'string') return null;

    let fileId = null;

    // Format 1 & 2: https://drive.google.com/uc?id=FILE_ID&export=download
    // Format: https://drive.google.com/uc?id=FILE_ID
    const ucMatch = url.match(/[?&]id=([^&]+)/);
    if (ucMatch) {
        fileId = ucMatch[1];
    }

    // Format 3 & 4: https://drive.google.com/file/d/FILE_ID/view
    // Format: https://drive.google.com/file/d/FILE_ID/preview
    if (!fileId) {
        const fileMatch = url.match(/\/file\/d\/([^/?]+)/);
        if (fileMatch) {
            fileId = fileMatch[1];
        }
    }

    // Format 5: https://drive.google.com/open?id=FILE_ID
    if (!fileId) {
        const openMatch = url.match(/open\?id=([^&]+)/);
        if (openMatch) {
            fileId = openMatch[1];
        }
    }

    return fileId;
};

/**
 * Convert Google Drive URL to a viewable image URL
 * @param {string} url - Original URL (can be Google Drive or regular URL)
 * @param {boolean} useProxy - Whether to use backend proxy to bypass CORS (default: false)
 * @param {string} proxyBaseUrl - Backend base URL for proxy (default: import.meta.env.VITE_API_BASE_URL)
 * @returns {string} - Converted URL or original URL if not Google Drive
 */
export const convertGoogleDriveUrl = (url, useProxy = false, proxyBaseUrl = null) => {
    if (!url) return url;

    // Check if it's a Google Drive URL
    if (!url.includes('drive.google.com') && !url.includes('googleapis.com')) {
        return url;
    }

    // Extract file ID
    const fileId = extractGoogleDriveFileId(url);

    if (!fileId) {
        console.warn('Could not extract file ID from Google Drive URL:', url);
        return url;
    }

    // Convert to viewable format
    // Using 'export=view' instead of 'export=download' works better with <img> tags
    const convertedUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    // If proxy is enabled, wrap the URL with proxy endpoint
    if (useProxy) {
        const baseUrl = proxyBaseUrl || import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000';
        return `${baseUrl}/image-proxy?url=${encodeURIComponent(convertedUrl)}`;
    }

    return convertedUrl;
};

/**
 * Get alternative Google Drive URL formats for fallback/retry
 * @param {string} fileId - Google Drive file ID
 * @returns {string[]} - Array of alternative URLs to try
 */
export const getGoogleDriveFallbackUrls = (fileId) => {
    if (!fileId) return [];

    return [
        // Method 1: Standard view URL (most reliable)
        `https://drive.google.com/uc?export=view&id=${fileId}`,

        // Method 2: Thumbnail API (good for public images)
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,

        // Method 3: User content domain (alternative)
        `https://drive.usercontent.google.com/download?id=${fileId}&export=view`,

        // Method 4: Google user content (lh3 proxy)
        `https://lh3.googleusercontent.com/d/${fileId}=w400`,

        // Method 5: Direct file preview
        `https://drive.google.com/file/d/${fileId}/preview`
    ];
};

/**
 * Check if a URL is a Google Drive URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if it's a Google Drive URL
 */
export const isGoogleDriveUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.includes('drive.google.com') || url.includes('googleapis.com');
};

/**
 * Get sharing URL for a Google Drive file
 * @param {string} url - Google Drive URL
 * @returns {string|null} - Sharing settings URL or null
 */
export const getGoogleDriveSharingUrl = (url) => {
    const fileId = extractGoogleDriveFileId(url);
    if (!fileId) return null;

    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
};

/**
 * Validate if Google Drive file is publicly accessible
 * This is a client-side check only - actual validation happens when image loads
 * @param {string} url - Google Drive URL
 * @returns {Promise<boolean>} - True if accessible
 */
export const validateGoogleDriveAccess = async (url) => {
    const convertedUrl = convertGoogleDriveUrl(url);

    try {
        const response = await fetch(convertedUrl, { method: 'HEAD', mode: 'no-cors' });
        // With no-cors, we can't read the response, but we can check if it loaded
        return true;
    } catch (error) {
        console.error('Google Drive access validation failed:', error);
        return false;
    }
};

/**
 * Get user-friendly error message for Google Drive issues
 * @param {string} url - Google Drive URL
 * @returns {object} - Error info object
 */
export const getGoogleDriveErrorInfo = (url) => {
    const fileId = extractGoogleDriveFileId(url);

    return {
        title: 'Access Denied',
        message: 'This Google Drive file is not publicly accessible',
        suggestions: [
            'Make sure the file is shared as "Anyone with the link"',
            'Right-click the file → Share → Change access to "Anyone with the link"',
            'Or upload the image directly instead of using Google Drive'
        ],
        sharingUrl: fileId ? `https://drive.google.com/file/d/${fileId}/view?usp=sharing` : null,
        fileId
    };
};

export default {
    extractGoogleDriveFileId,
    convertGoogleDriveUrl,
    getGoogleDriveFallbackUrls,
    isGoogleDriveUrl,
    getGoogleDriveSharingUrl,
    validateGoogleDriveAccess,
    getGoogleDriveErrorInfo
};
