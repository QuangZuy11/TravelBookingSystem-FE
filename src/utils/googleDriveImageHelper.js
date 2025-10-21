// ========================================
// GOOGLE DRIVE IMAGE HELPER UTILITIES
// ========================================
// Complete utility for handling Google Drive images with CORS bypass

/**
 * Convert Google Drive URL to use backend proxy
 * This bypasses CORS restrictions by routing through your backend
 * 
 * @param {string} originalUrl - The original Google Drive URL
 * @param {string} backendUrl - Your backend URL (default from env variable)
 * @returns {string} Proxied URL that works without CORS errors
 * 
 * @example
 * const proxyUrl = useProxyForGoogleDrive(
 *   'https://drive.google.com/uc?export=view&id=123',
 *   'http://localhost:3000'
 * );
 * // Returns: 'http://localhost:3000/api/image-proxy?url=https%3A%2F%2F...'
 */
export const useProxyForGoogleDrive = (
    originalUrl,
    backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
) => {
    if (!originalUrl) return originalUrl;

    // Only proxy Google Drive URLs
    if (originalUrl.includes('drive.google.com') || originalUrl.includes('googleusercontent.com')) {
        return `${backendUrl}/image-proxy?url=${encodeURIComponent(originalUrl)}`;
    }

    return originalUrl;
};

/**
 * Convert Google Drive sharing URL to direct view URL
 * Handles various Google Drive URL formats
 * 
 * @param {string} url - Google Drive URL (sharing or direct)
 * @returns {string} Direct view URL format
 * 
 * @example
 * convertGoogleDriveUrl('https://drive.google.com/file/d/ABC123/view')
 * // Returns: 'https://drive.google.com/uc?export=view&id=ABC123'
 */
export const convertGoogleDriveUrl = (url) => {
    if (!url) return '';

    // Already a direct URL (uc?export=view format)
    if (url.includes('drive.google.com/uc?')) {
        return url;
    }

    // Already a googleusercontent URL
    if (url.includes('googleusercontent.com')) {
        return url;
    }

    // Extract file ID from various formats:
    // - https://drive.google.com/file/d/FILE_ID/view
    // - https://drive.google.com/open?id=FILE_ID
    // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing

    let fileId = null;

    // Format 1: /file/d/FILE_ID/
    const fileIdMatch1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch1) {
        fileId = fileIdMatch1[1];
    }

    // Format 2: /d/FILE_ID/
    const fileIdMatch2 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!fileId && fileIdMatch2) {
        fileId = fileIdMatch2[1];
    }

    // Format 3: ?id=FILE_ID
    const fileIdMatch3 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (!fileId && fileIdMatch3) {
        fileId = fileIdMatch3[1];
    }

    if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    // Return original URL if no pattern matched
    return url;
};

/**
 * Combined function: Convert Google Drive URL and apply proxy
 * This is the recommended function to use in most cases
 * 
 * @param {string} url - Any Google Drive URL format
 * @param {string} backendUrl - Backend URL (optional, uses env variable)
 * @returns {string} Proxied direct view URL ready to use in <img> tags
 * 
 * @example
 * // In React component:
 * <img src={getProxiedGoogleDriveUrl(hotel.imageUrl)} alt="Hotel" />
 */
export const getProxiedGoogleDriveUrl = (
    url,
    backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
) => {
    const directUrl = convertGoogleDriveUrl(url);
    return useProxyForGoogleDrive(directUrl, backendUrl);
};

/**
 * Batch convert multiple Google Drive URLs
 * Useful for image galleries
 * 
 * @param {string[]} urls - Array of Google Drive URLs
 * @param {string} backendUrl - Backend URL (optional)
 * @returns {string[]} Array of proxied URLs
 * 
 * @example
 * const imageUrls = getProxiedGoogleDriveUrls(hotel.images);
 * imageUrls.map(url => <img src={url} key={url} />)
 */
export const getProxiedGoogleDriveUrls = (
    urls,
    backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
) => {
    if (!Array.isArray(urls)) return [];
    return urls.map(url => getProxiedGoogleDriveUrl(url, backendUrl));
};

/**
 * Check if a URL is a Google Drive URL
 * 
 * @param {string} url - URL to check
 * @returns {boolean} True if Google Drive URL
 */
export const isGoogleDriveUrl = (url) => {
    if (!url) return false;
    return url.includes('drive.google.com') || url.includes('googleusercontent.com');
};

/**
 * Get fallback image URL if proxy fails
 * 
 * @param {string} fallbackUrl - Fallback image URL
 * @returns {function} Error handler for img onError
 * 
 * @example
 * <img 
 *   src={getProxiedGoogleDriveUrl(url)}
 *   onError={handleImageError('/images/placeholder.jpg')}
 * />
 */
export const handleImageError = (fallbackUrl = '/images/placeholder.jpg') => {
    return (e) => {
        console.warn('Image failed to load, using fallback:', e.target.src);
        e.target.src = fallbackUrl;
    };
};

/**
 * Extract Google Drive file ID from URL
 * 
 * @param {string} url - Google Drive URL
 * @returns {string|null} File ID or null if not found
 */
export const extractFileId = (url) => {
    if (!url) return null;

    // Try different patterns
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,
        /\/d\/([a-zA-Z0-9_-]+)/,
        /[?&]id=([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
};

/**
 * Get Google Drive sharing URL from file ID
 * 
 * @param {string} fileIdOrUrl - File ID or Google Drive URL
 * @returns {string} Sharing URL
 */
export const getShareUrl = (fileIdOrUrl) => {
    const fileId = extractFileId(fileIdOrUrl) || fileIdOrUrl;
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
};

// ========================================
// DEFAULT EXPORT
// ========================================

export default {
    useProxyForGoogleDrive,
    convertGoogleDriveUrl,
    getProxiedGoogleDriveUrl,
    getProxiedGoogleDriveUrls,
    isGoogleDriveUrl,
    handleImageError,
    extractFileId,
    getShareUrl
};

// ========================================
// USAGE EXAMPLES
// ========================================

/*
// Example 1: Simple image in React
import { getProxiedGoogleDriveUrl } from '@/utils/googleDriveImageHelper';

const HotelImage = ({ imageUrl }) => (
  <img 
    src={getProxiedGoogleDriveUrl(imageUrl)} 
    alt="Hotel"
  />
);

// Example 2: Image gallery with fallback
import { getProxiedGoogleDriveUrls, handleImageError } from '@/utils/googleDriveImageHelper';

const ImageGallery = ({ images }) => (
  <div className="gallery">
    {getProxiedGoogleDriveUrls(images).map((url, index) => (
      <img
        key={index}
        src={url}
        alt={`Image ${index + 1}`}
        onError={handleImageError()}
        loading="lazy"
      />
    ))}
  </div>
);

// Example 3: With custom backend URL
const ImageWithCustomBackend = ({ imageUrl }) => {
  const backendUrl = 'https://api.myapp.com';
  return (
    <img 
      src={getProxiedGoogleDriveUrl(imageUrl, backendUrl)} 
      alt="Custom"
    />
  );
};

// Example 4: Conditional proxy (only for Google Drive URLs)
import { isGoogleDriveUrl, getProxiedGoogleDriveUrl } from '@/utils/googleDriveImageHelper';

const SmartImage = ({ imageUrl }) => {
  const src = isGoogleDriveUrl(imageUrl) 
    ? getProxiedGoogleDriveUrl(imageUrl)
    : imageUrl; // Use original URL for non-Google Drive images
    
  return <img src={src} alt="Smart" />;
};

// Example 5: Get sharing link
import { getShareUrl } from '@/utils/googleDriveImageHelper';

const ShareButton = ({ imageUrl }) => {
  const shareLink = getShareUrl(imageUrl);
  return (
    <a href={shareLink} target="_blank" rel="noopener noreferrer">
      View on Google Drive
    </a>
  );
};
*/
