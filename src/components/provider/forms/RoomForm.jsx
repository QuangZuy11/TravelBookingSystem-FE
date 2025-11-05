import React, { useState, useEffect } from 'react';
import { getProxiedGoogleDriveUrl } from '../../../utils/googleDriveImageHelper';

export const RoomForm = ({ initialData, onSubmit, hotelId }) => {
    const [formData, setFormData] = useState({
        hotelId: hotelId || '',
        roomNumber: '',
        type: 'single',
        capacity: 1,
        pricePerNight: 0,
        amenities: [],
        status: 'available',
        floor: 1,
        images: [],
        description: ''
    });

    const [activeSection, setActiveSection] = useState(null);

    useEffect(() => {
        if (initialData) {
            const newFormData = {
                ...formData,
                ...initialData,
                hotelId: hotelId || initialData.hotelId
            };
            setFormData(newFormData);
        }
    }, [initialData, hotelId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'amenities') {
            setFormData(prev => ({
                ...prev,
                amenities: checked
                    ? [...prev.amenities, value]
                    : prev.amenities.filter(a => a !== value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? parseFloat(value) || 0 : value
            }));
        }
    };

    const handleImageUpload = (e) => {
        const newFiles = Array.from(e.target.files);

        // Create preview URLs for display
        const previewUrls = newFiles.map(file => ({
            file: file,
            preview: URL.createObjectURL(file),
            name: file.name
        }));

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...previewUrls]
        }));
    };

    // 🗑️ Remove image by index
    const handleRemoveImage = (indexToRemove) => {
        setFormData(prev => {
            const updatedImages = prev.images.filter((_, index) => index !== indexToRemove);

            // Cleanup blob URL if it's a new upload
            const imageToRemove = prev.images[indexToRemove];
            if (imageToRemove && imageToRemove.preview && imageToRemove.preview.startsWith('blob:')) {
                URL.revokeObjectURL(imageToRemove.preview);
            }

            return {
                ...prev,
                images: updatedImages
            };
        });
    };

    // ⬆️ Move image up
    const handleMoveImageUp = (index) => {
        if (index === 0) return;

        setFormData(prev => {
            const newImages = [...prev.images];
            console.log('🔼 Moving image up from index', index, 'to', index - 1);
            console.log('Before swap:', newImages[index - 1], newImages[index]);

            [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];

            console.log('After swap:', newImages[index - 1], newImages[index]);
            return {
                ...prev,
                images: newImages
            };
        });
    };

    // ⬇️ Move image down
    const handleMoveImageDown = (index) => {
        if (index === formData.images.length - 1) return;

        setFormData(prev => {
            const newImages = [...prev.images];
            console.log('🔽 Moving image down from index', index, 'to', index + 1);
            console.log('Before swap:', newImages[index], newImages[index + 1]);

            [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];

            console.log('After swap:', newImages[index], newImages[index + 1]);
            return {
                ...prev,
                images: newImages
            };
        });
    };    // Cleanup blob URLs when component unmounts
    React.useEffect(() => {
        return () => {
            // Revoke all blob URLs
            formData.images.forEach(img => {
                if (img.preview && img.preview.startsWith('blob:')) {
                    URL.revokeObjectURL(img.preview);
                }
            });
        };
    }, [formData.images]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare FormData to send files
        const formDataToSend = new FormData();

        // Add all form fields except images
        Object.keys(formData).forEach(key => {
            if (key !== 'images') {
                if (typeof formData[key] === 'object' && formData[key] !== null && !Array.isArray(formData[key])) {
                    // Handle nested objects
                    formDataToSend.append(key, JSON.stringify(formData[key]));
                } else if (Array.isArray(formData[key])) {
                    // Handle arrays (amenities, etc)
                    formDataToSend.append(key, JSON.stringify(formData[key]));
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            }
        });

        // Add image files (new uploads) and existing URLs separately
        const existingImages = [];
        formData.images.forEach((img, index) => {
            if (typeof img === 'string') {
                // Existing image URL (edit mode)
                existingImages.push(img);
            } else if (img.file) {
                // New file upload - append to FormData
                formDataToSend.append('images', img.file);
            }
        });

        // If there are existing images, send them as JSON
        if (existingImages.length > 0) {
            formDataToSend.append('existing_images', JSON.stringify(existingImages));
        }

        onSubmit(formDataToSend);
    };

    const roomTypes = [
        { value: 'single', label: '🛏️ Single Room', capacity: 1 },
        { value: 'double', label: '🛏️🛏️ Double Room', capacity: 2 },
        { value: 'twin', label: '👥 Twin Room', capacity: 2 },
        { value: 'suite', label: '👑 Suite', capacity: 3 },
        { value: 'deluxe', label: '✨ Deluxe', capacity: 4 },
        { value: 'family', label: '👨‍👩‍👧‍👦 Family Room', capacity: 5 }
    ];

    const roomAmenities = [
        'Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Safe Box',
        'Balcony', 'City View', 'Ocean View', 'Mountain View',
        'Bathtub', 'Shower', 'Hair Dryer', 'Iron', 'Coffee Maker',
        'Room Service', 'Work Desk', 'Sofa', 'Wardrobe'
    ];

    const statusOptions = [
        { value: 'available', label: '✅ Available', color: '#10b981' },
        { value: 'occupied', label: '🔒 Occupied', color: '#ef4444' },
        { value: 'maintenance', label: '🔧 Maintenance', color: '#f59e0b' },
        { value: 'reserved', label: '📅 Reserved', color: '#3b82f6' }
    ];

    // Styles
    const containerStyle = {
        minHeight: '100vh',
        background: '#10b981',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };

    const formContainerStyle = {
        maxWidth: '1000px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '24px',
        padding: '3rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    };

    const headerStyle = {
        marginBottom: '2.5rem',
        borderBottom: '3px solid #10b981',
        paddingBottom: '1.5rem'
    };

    const titleStyle = {
        fontSize: '2.5rem',
        fontWeight: '700',
        background: '#10b981',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '0.5rem'
    };

    const subtitleStyle = {
        fontSize: '1rem',
        color: '#6b7280'
    };

    const sectionStyle = {
        marginBottom: '2rem',
        padding: '2rem',
        background: '#f9fafb',
        borderRadius: '16px',
        border: '2px solid transparent',
        transition: 'all 0.3s ease'
    };

    const sectionActiveStyle = {
        ...sectionStyle,
        border: '2px solid #10b981',
        background: 'white',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)'
    };

    const sectionTitleStyle = {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        fontSize: '1rem',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        outline: 'none',
        background: 'white'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
    };

    const roomTypeCardStyle = (isSelected) => ({
        padding: '1.5rem',
        background: isSelected ? '#10b981' : 'white',
        color: isSelected ? 'white' : '#374151',
        border: `2px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'center',
        fontWeight: '600'
    });

    const checkboxContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1rem'
    };

    const checkboxLabelStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontSize: '0.875rem',
        fontWeight: '500'
    };

    const checkboxLabelActiveStyle = {
        ...checkboxLabelStyle,
        background: '#10b981',
        color: 'white',
        borderColor: '#10b981'
    };

    const imageGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '1rem',
        marginTop: '1rem'
    };

    const imagePreviewStyle = {
        height: '150px',
        width: '100%',
        objectFit: 'cover',
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s ease'
    };

    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        marginTop: '2.5rem',
        paddingTop: '2rem',
        borderTop: '2px solid #e5e7eb'
    };

    const buttonStyle = {
        padding: '1rem 2.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    };

    const cancelButtonStyle = {
        ...buttonStyle,
        background: 'white',
        color: '#6b7280',
        border: '2px solid #e5e7eb'
    };

    const submitButtonStyle = {
        ...buttonStyle,
        background: '#10b981',
        color: 'white',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    };

    return (
        <div style={containerStyle}>
            <form onSubmit={handleSubmit} style={formContainerStyle}>
                <div style={headerStyle}>
                    <h1 style={titleStyle}>
                        {initialData ? '✏️ Edit Room' : '✨ Create New Room'}
                    </h1>
                    <p style={subtitleStyle}>Add room details and configure availability</p>
                </div>

                {/* Basic Information */}
                <div
                    style={activeSection === 'basic' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('basic')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>🏠</span>
                        Basic Information
                    </h2>

                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Room Number</label>
                            <input
                                type="text"
                                name="roomNumber"
                                value={formData.roomNumber}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="e.g., 101, A-205"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Floor</label>
                            <input
                                type="number"
                                name="floor"
                                value={formData.floor}
                                onChange={handleChange}
                                required
                                min="1"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="Floor number"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            placeholder="Describe the room features and highlights..."
                        />
                    </div>
                </div>

                {/* Room Type */}
                <div
                    style={activeSection === 'type' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('type')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>🛏️</span>
                        Room Type & Capacity
                    </h2>

                    <div style={{ ...gridStyle, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                        {roomTypes.map(roomType => (
                            <div
                                key={roomType.value}
                                style={roomTypeCardStyle(formData.type === roomType.value)}
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        type: roomType.value,
                                        capacity: roomType.capacity
                                    }));
                                }}
                                onMouseEnter={(e) => {
                                    if (formData.type !== roomType.value) {
                                        e.currentTarget.style.borderColor = '#10b981';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (formData.type !== roomType.value) {
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                    {roomType.label.split(' ')[0]}
                                </div>
                                <div>{roomType.label.replace(/[^\w\s]/g, '')}</div>
                                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.9 }}>
                                    Max: {roomType.capacity} guests
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <label style={labelStyle}>Custom Capacity (guests)</label>
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            required
                            min="1"
                            style={{ ...inputStyle, maxWidth: '200px' }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>
                </div>

                {/* Pricing & Status */}
                <div
                    style={activeSection === 'pricing' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('pricing')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>💰</span>
                        Pricing & Status
                    </h2>

                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Price Per Night (VND)</label>
                            <input
                                type="number"
                                name="pricePerNight"
                                value={formData.pricePerNight}
                                onChange={handleChange}
                                required
                                min="0"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="500000"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Room Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Amenities */}
                <div
                    style={activeSection === 'amenities' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('amenities')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>✨</span>
                        Room Amenities
                    </h2>

                    <div style={checkboxContainerStyle}>
                        {roomAmenities.map(amenity => (
                            <label
                                key={amenity}
                                style={formData.amenities.includes(amenity)
                                    ? checkboxLabelActiveStyle
                                    : checkboxLabelStyle}
                            >
                                <input
                                    type="checkbox"
                                    name="amenities"
                                    value={amenity}
                                    checked={formData.amenities.includes(amenity)}
                                    onChange={handleChange}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10b981' }}
                                />
                                <span>{amenity}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Images */}
                <div
                    style={activeSection === 'images' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('images')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>📸</span>
                        Room Images
                    </h2>

                    <input
                        type="file"
                        multiple
                        onChange={handleImageUpload}
                        accept="image/*"
                        style={{
                            ...inputStyle,
                            padding: '1rem',
                            cursor: 'pointer'
                        }}
                    />

                    {formData.images.length > 0 && (
                        <div style={imageGridStyle}>
                            {formData.images.map((image, index) => {
                                const imageUrl = typeof image === 'string' ? image : image.preview;
                                const displayUrl = getProxiedGoogleDriveUrl(imageUrl);
                                const isGDrive = imageUrl && imageUrl.includes('drive.google.com');

                                // Generate unique key (use URL or preview as key instead of index)
                                const uniqueKey = typeof image === 'string'
                                    ? image
                                    : (image.preview || image.name || `img-${index}`);

                                return (
                                    <div key={uniqueKey} style={{
                                        position: 'relative',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}>
                                        <img
                                            src={displayUrl}
                                            alt={`Room preview ${index + 1}`}
                                            style={imagePreviewStyle}
                                            onError={(e) => {
                                                e.target.style.opacity = '0.5';
                                                e.target.alt = 'Failed to load';
                                            }}
                                        />

                                        {/* Image Controls Overlay */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
                                            padding: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start'
                                        }}>
                                            {/* Image Number */}
                                            <span style={{
                                                background: 'rgba(102, 126, 234, 0.95)',
                                                color: 'white',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                #{index + 1}
                                            </span>

                                            {/* Control Buttons */}
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {/* Move Up */}
                                                {index > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMoveImageUp(index)}
                                                        style={{
                                                            background: 'rgba(255, 255, 255, 0.95)',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            width: '32px',
                                                            height: '32px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '1.1rem',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = '#10b981';
                                                            e.currentTarget.style.transform = 'scale(1.1)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                        }}
                                                        title="Move up"
                                                    >
                                                        ⬆️
                                                    </button>
                                                )}

                                                {/* Move Down */}
                                                {index < formData.images.length - 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMoveImageDown(index)}
                                                        style={{
                                                            background: 'rgba(255, 255, 255, 0.95)',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            width: '32px',
                                                            height: '32px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '1.1rem',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = '#10b981';
                                                            e.currentTarget.style.transform = 'scale(1.1)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                        }}
                                                        title="Move down"
                                                    >
                                                        ⬇️
                                                    </button>
                                                )}

                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.95)',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        width: '32px',
                                                        height: '32px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.1rem',
                                                        color: 'white',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#dc2626';
                                                        e.currentTarget.style.transform = 'scale(1.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.95)';
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                    }}
                                                    title="Delete image"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>

                                        {/* Google Drive Badge */}
                                        {isGDrive && (
                                            <span style={{
                                                position: 'absolute',
                                                bottom: '8px',
                                                left: '8px',
                                                background: 'rgba(102, 126, 234, 0.95)',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                🔗 Google Drive
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Submit Buttons */}
                <div style={buttonContainerStyle}>
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        style={cancelButtonStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        style={submitButtonStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                        }}
                    >
                        {initialData ? '✅ Update Room' : '✨ Create Room'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RoomForm;