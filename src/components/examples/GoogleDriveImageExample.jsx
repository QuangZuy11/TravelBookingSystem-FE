import React, { useState } from 'react';
import {
    getProxiedGoogleDriveUrl,
    getProxiedGoogleDriveUrls,
    handleImageError,
    isGoogleDriveUrl,
    getShareUrl
} from '../../utils/googleDriveImageHelper';

/**
 * Example Component: How to use Google Drive Image Helper
 * 
 * This component demonstrates all the utility functions
 */
export const GoogleDriveImageExample = () => {
    // Sample data - replace with your actual data
    const [sampleUrls] = useState([
        'https://drive.google.com/file/d/1niN-1UZTAGKLYYeV8PIW2m04wvO1Z-Im/view',
        'https://drive.google.com/uc?id=1niN-1UZTAGKLYYeV8PIW2m04wvO1Z-Im&export=download',
        'https://example.com/regular-image.jpg' // Non-Google Drive URL
    ]);

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Google Drive Image Helper Examples</h1>

            {/* Example 1: Single Image */}
            <section style={{ marginBottom: '3rem' }}>
                <h2>1. Single Image with Proxy</h2>
                <img
                    src={getProxiedGoogleDriveUrl(sampleUrls[0])}
                    alt="Sample 1"
                    style={{ maxWidth: '300px', borderRadius: '8px' }}
                    onError={handleImageError('/images/placeholder.jpg')}
                />
                <p><strong>Original URL:</strong> {sampleUrls[0]}</p>
                <p><strong>Proxied URL:</strong> {getProxiedGoogleDriveUrl(sampleUrls[0])}</p>
            </section>

            {/* Example 2: Image Gallery */}
            <section style={{ marginBottom: '3rem' }}>
                <h2>2. Image Gallery (Batch Conversion)</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {getProxiedGoogleDriveUrls(sampleUrls).map((url, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                            <img
                                src={url}
                                alt={`Gallery ${index + 1}`}
                                style={{ width: '100%', borderRadius: '8px' }}
                                onError={handleImageError()}
                                loading="lazy"
                            />
                            <small style={{ display: 'block', marginTop: '0.5rem' }}>
                                {isGoogleDriveUrl(sampleUrls[index]) ? '🔗 Google Drive' : '📷 Regular URL'}
                            </small>
                        </div>
                    ))}
                </div>
            </section>

            {/* Example 3: Conditional Rendering */}
            <section style={{ marginBottom: '3rem' }}>
                <h2>3. Smart Image (Conditional Proxy)</h2>
                {sampleUrls.map((url, index) => {
                    const isGDrive = isGoogleDriveUrl(url);
                    const displayUrl = isGDrive ? getProxiedGoogleDriveUrl(url) : url;

                    return (
                        <div key={index} style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                            <img
                                src={displayUrl}
                                alt={`Smart ${index + 1}`}
                                style={{ maxWidth: '200px', borderRadius: '8px' }}
                                onError={handleImageError()}
                            />
                            <div style={{ marginTop: '0.5rem' }}>
                                <p><strong>Type:</strong> {isGDrive ? 'Google Drive (using proxy)' : 'Regular URL (no proxy)'}</p>
                                <p><strong>URL:</strong> <code style={{ fontSize: '0.8rem' }}>{displayUrl.substring(0, 80)}...</code></p>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Example 4: Share Link */}
            <section style={{ marginBottom: '3rem' }}>
                <h2>4. Share Links</h2>
                {sampleUrls.filter(isGoogleDriveUrl).map((url, index) => (
                    <div key={index} style={{ marginBottom: '1rem' }}>
                        <a
                            href={getShareUrl(url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                padding: '0.5rem 1rem',
                                background: '#667eea',
                                color: 'white',
                                borderRadius: '6px',
                                textDecoration: 'none'
                            }}
                        >
                            🔗 View Image {index + 1} on Google Drive
                        </a>
                    </div>
                ))}
            </section>

            {/* Example 5: With Error Handling */}
            <section>
                <h2>5. Advanced: With Custom Error Handling</h2>
                <ImageWithRetry url={sampleUrls[0]} />
            </section>
        </div>
    );
};

/**
 * Advanced Example: Image with retry logic
 */
const ImageWithRetry = ({ url, maxRetries = 3 }) => {
    const [retryCount, setRetryCount] = useState(0);
    const [hasError, setHasError] = useState(false);

    const handleError = (e) => {
        if (retryCount < maxRetries) {
            console.log(`Retry ${retryCount + 1}/${maxRetries}`);
            setRetryCount(prev => prev + 1);
            // Force reload by updating src
            e.target.src = `${getProxiedGoogleDriveUrl(url)}&retry=${retryCount + 1}`;
        } else {
            console.error('Max retries reached');
            setHasError(true);
            handleImageError()(e);
        }
    };

    if (hasError && retryCount >= maxRetries) {
        return (
            <div style={{
                padding: '2rem',
                background: '#fee2e2',
                borderRadius: '8px',
                textAlign: 'center'
            }}>
                <p>❌ Failed to load image after {maxRetries} retries</p>
                <a
                    href={getShareUrl(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#dc2626', textDecoration: 'underline' }}
                >
                    View on Google Drive
                </a>
            </div>
        );
    }

    return (
        <div>
            <img
                src={getProxiedGoogleDriveUrl(url)}
                alt="With retry"
                style={{ maxWidth: '300px', borderRadius: '8px' }}
                onError={handleError}
            />
            {retryCount > 0 && (
                <p style={{ fontSize: '0.875rem', color: '#666' }}>
                    Retry attempt: {retryCount}/{maxRetries}
                </p>
            )}
        </div>
    );
};

export default GoogleDriveImageExample;

// ========================================
// USAGE IN YOUR COMPONENTS
// ========================================

/*
// HotelForm.jsx - Update image display
import { getProxiedGoogleDriveUrl, handleImageError } from '@/utils/googleDriveImageHelper';

// In your render:
<img
  src={getProxiedGoogleDriveUrl(formData.images[index])}
  alt={`Hotel ${index + 1}`}
  onError={handleImageError()}
/>

// HotelCard.jsx - Display hotel images
import { getProxiedGoogleDriveUrls } from '@/utils/googleDriveImageHelper';

const HotelCard = ({ hotel }) => {
  const imageUrls = getProxiedGoogleDriveUrls(hotel.images);
  
  return (
    <div className="hotel-card">
      {imageUrls.map((url, i) => (
        <img key={i} src={url} alt={hotel.name} />
      ))}
    </div>
  );
};

// ImageGallery.jsx - Lightbox gallery
import { getProxiedGoogleDriveUrl, isGoogleDriveUrl } from '@/utils/googleDriveImageHelper';

const ImageGallery = ({ images }) => {
  return (
    <div className="gallery">
      {images.map((image, index) => {
        const src = isGoogleDriveUrl(image)
          ? getProxiedGoogleDriveUrl(image)
          : image;
          
        return (
          <div key={index} className="gallery-item">
            <img src={src} alt={`Image ${index + 1}`} />
            {isGoogleDriveUrl(image) && (
              <span className="badge">Google Drive</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
*/
