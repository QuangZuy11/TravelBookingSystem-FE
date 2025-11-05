import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../shared/Breadcrumb';
import DestinationSelector from '../../common/DestinationSelector';
import { getProxiedGoogleDriveUrl, isGoogleDriveUrl, getShareUrl } from '../../../utils/googleDriveImageHelper';

export const HotelForm = ({ initialData, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        destination_id: '', // 📍 Thêm field mới cho destination
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
            coordinates: { latitude: 0, longitude: 0 }
        },
        category: '3_star',
        amenities: [],
        images: [],

        priceRange: { min: 0, max: 0 },
        policies: {
            checkInTime: '14:00',
            checkOutTime: '12:00',
            cancellationPolicy: '',
            petsAllowed: false,
            paymentOptions: []
        },
        contactInfo: { phone: '', email: '', website: '' },
        status: 'active'
    });

    const [activeSection, setActiveSection] = useState(null);
    const [googleMapsLink, setGoogleMapsLink] = useState('');
    const [coordinateError, setCoordinateError] = useState('');

    // Function to extract coordinates from Google Maps link
    const extractCoordinatesFromLink = (link) => {
        try {
            setCoordinateError('');

            // Pattern 1: /@lat,lng,zoom format
            const pattern1 = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
            const match1 = link.match(pattern1);

            if (match1) {
                return {
                    latitude: parseFloat(match1[1]),
                    longitude: parseFloat(match1[2])
                };
            }

            // Pattern 2: /place/name/@lat,lng format
            const pattern2 = /place\/[^/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/;
            const match2 = link.match(pattern2);

            if (match2) {
                return {
                    latitude: parseFloat(match2[1]),
                    longitude: parseFloat(match2[2])
                };
            }

            // Pattern 3: !3d (latitude) !4d (longitude) format
            const latPattern = /!3d(-?\d+\.\d+)/;
            const lngPattern = /!4d(-?\d+\.\d+)/;
            const latMatch = link.match(latPattern);
            const lngMatch = link.match(lngPattern);

            if (latMatch && lngMatch) {
                return {
                    latitude: parseFloat(latMatch[1]),
                    longitude: parseFloat(lngMatch[1])
                };
            }

            setCoordinateError('❌ Không tìm thấy tọa độ trong link. Vui lòng kiểm tra lại.');
            return null;
        } catch (error) {
            setCoordinateError('❌ Lỗi khi xử lý link Google Maps.');
            console.error('Error extracting coordinates:', error);
            return null;
        }
    };

    // Handle Google Maps link input
    const handleGoogleMapsLinkChange = (e) => {
        const link = e.target.value;
        setGoogleMapsLink(link);

        if (link.trim() === '') {
            setCoordinateError('');
            return;
        }

        const coords = extractCoordinatesFromLink(link);
        if (coords) {
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    coordinates: coords
                }
            }));
            setCoordinateError('✅ Đã lấy tọa độ thành công!');
        }
    };

    useEffect(() => {
        if (initialData) {
            // Map API response data to form data structure
            setFormData(prevData => ({
                ...prevData,
                name: initialData.name || '',
                description: initialData.description || '',
                destination_id: initialData.destination_id || '',
                category: initialData.category || '3_star',
                status: initialData.status || 'active',
                address: {
                    street: initialData.address?.street || '',
                    city: initialData.address?.city || '',
                    state: initialData.address?.state || '',
                    country: initialData.address?.country || '',
                    zipCode: initialData.address?.zipCode || '',
                    coordinates: initialData.address?.coordinates || { latitude: 0, longitude: 0 }
                },
                priceRange: {
                    min: initialData.priceRange?.min || 0,
                    max: initialData.priceRange?.max || 0
                },
                policies: {
                    checkInTime: initialData.policies?.checkInTime || '14:00',
                    checkOutTime: initialData.policies?.checkOutTime || '12:00',
                    cancellationPolicy: initialData.policies?.cancellationPolicy || '',
                    petsAllowed: initialData.policies?.petsAllowed || false,
                    paymentOptions: initialData.policies?.paymentOptions || []
                },
                contactInfo: {
                    phone: initialData.contactInfo?.phone || '',
                    email: initialData.contactInfo?.email || '',
                    website: initialData.contactInfo?.website || ''
                },
                amenities: initialData.amenities || [],
                images: initialData.images || []
            }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'number' ? parseFloat(value) : value
                }
            }));
        } else if (name === 'amenities') {
            setFormData(prev => ({
                ...prev,
                amenities: checked
                    ? [...prev.amenities, value]
                    : prev.amenities.filter(a => a !== value)
            }));
        } else if (name === 'paymentOptions') {
            setFormData(prev => ({
                ...prev,
                policies: {
                    ...prev.policies,
                    paymentOptions: checked
                        ? [...prev.policies.paymentOptions, value]
                        : prev.policies.paymentOptions.filter(p => p !== value)
                }
            }));
        } else if (name === 'petsAllowed') {
            setFormData(prev => ({
                ...prev,
                policies: { ...prev.policies, petsAllowed: checked }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? parseFloat(value) : value
            }));
        }
    };

    const handleImageUpload = (e) => {
        const newFiles = Array.from(e.target.files);

        // Create preview URLs for display (keep file object for upload)
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
        if (index === 0) return; // Already at top

        setFormData(prev => {
            const newImages = [...prev.images];
            console.log('🔼 Moving image up from index', index, 'to', index - 1);
            console.log('Before swap:', newImages[index - 1], newImages[index]);

            // Swap images
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
        if (index === formData.images.length - 1) return; // Already at bottom

        setFormData(prev => {
            const newImages = [...prev.images];
            console.log('🔽 Moving image down from index', index, 'to', index + 1);
            console.log('Before swap:', newImages[index], newImages[index + 1]);

            // Swap images
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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate minimum 7 images
        if (formData.images.length < 7) {
            alert('⚠️ Vui lòng tải lên ít nhất 7 ảnh khách sạn!');
            return;
        }

        // Prepare FormData to send files
        const formDataToSend = new FormData();

        // Add all form fields except images
        Object.keys(formData).forEach(key => {
            if (key !== 'images') {
                if (typeof formData[key] === 'object' && formData[key] !== null && !Array.isArray(formData[key])) {
                    // Handle nested objects (address, policies, contactInfo, priceRange)
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
        formData.images.forEach((img) => {
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

        console.log('📤 Submitting hotel FormData with', formDataToSend.getAll('images').length, 'new images');
        onSubmit(formDataToSend);
    };

    const amenitiesList = [
        'Wi-Fi', 'Parking', 'Pool', 'Gym', 'Restaurant', 'Spa',
        'Bar', 'Room Service', 'Business Center', 'Airport Shuttle',
        'Air Conditioning', 'Conference Room', 'Laundry Service'
    ];

    const paymentOptionsList = [
        'Thẻ Tín Dụng', 'Thẻ Ghi Nợ', 'Tiền Mặt', 'Chuyển Khoản', 'Ví Điện Tử'
    ];

    // Styles
    const containerStyle = {
        minHeight: '100vh',
        // background: '#10b981',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };

    const formContainerStyle = {
        maxWidth: '1200px',
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
        // background: '#10b981',
        color: '#111827',
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
        marginBottom: '2.5rem',
        padding: '2rem',
        background: '#f9fafb',
        borderRadius: '16px',
        border: '2px solid transparent',
        transition: 'all 0.3s ease',
        display: 'block'
    };

    const sectionActiveStyle = {
        ...sectionStyle,
        border: '2px solid #10b981',
        background: 'white',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)',
        display: 'block'
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

    const iconStyle = {
        fontSize: '1.75rem'
    };

    const inputStyle = {
        width: '80%',
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
        gridTemplateColumns: '1fr',
        gap: '1.5rem',
        marginBottom: '1.5rem'
    };

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
        border: '2px solid #10b981'
    };

    const checkboxStyle = {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
        accentColor: '#10b981'
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
    const breadcrumbItems = [
        { label: 'Dashboard', path: '/provider' },
        { label: 'Hotels', path: '/provider/hotels' },
        { label: 'Add New Hotel' }
    ];
    return (
        <div style={containerStyle}>
            <Breadcrumb items={breadcrumbItems} />

            <form onSubmit={handleSubmit} style={formContainerStyle}>
                <div style={headerStyle}>
                    <h1 style={titleStyle}>
                        {initialData ? 'Cập Nhật Khách Sạn' : 'Thêm Khách Sạn Mới'}
                    </h1>
                    <p style={subtitleStyle}>Điền thông tin chi tiết để thêm cơ sở kinh doanh của bạn</p>
                </div>

                {/* Basic Information */}
                <div
                    style={activeSection === 'basic' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('basic')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={iconStyle}>🏨</span>
                        Thông Tin Cơ Bản
                    </h2>
                    <div style={{ ...gridStyle, marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Tên Khách Sạn</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            placeholder="Nhập tên khách sạn"
                        />
                    </div>
                    <div style={{ ...gridStyle, marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Mô Tả</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="4"
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            placeholder="Mô tả về khách sạn của bạn"
                        />
                    </div>

                    {/* Destination Selector */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <DestinationSelector
                            selectedId={formData.destination_id}
                            onChange={(destinationId) => {
                                setFormData(prev => ({
                                    ...prev,
                                    destination_id: destinationId
                                }));
                            }}
                        />
                    </div>

                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Hạng Sao</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            >
                                <option value="1_star">⭐ 1 Sao</option>
                                <option value="2_star">⭐⭐ 2 Sao</option>
                                <option value="3_star">⭐⭐⭐ 3 Sao</option>
                                <option value="4_star">⭐⭐⭐⭐ 4 Sao</option>
                                <option value="5_star">⭐⭐⭐⭐⭐ 5 Sao</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Trạng Thái</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            >
                                <option value="active">✅ Đang Hoạt Động</option>
                                <option value="inactive">⏸️ Tạm Ngưng</option>
                                <option value="maintenance">🔧 Đang Bảo Trì</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Address Information */}
                <div
                    style={activeSection === 'address' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('address')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={iconStyle}>📍</span>
                        Thông Tin Địa Chỉ
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Số Nhà, Đường</label>
                            <input
                                type="text"
                                name="address.street"
                                value={formData.address.street}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="123 Đường Nguyễn Huệ"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Thành Phố</label>
                            <input
                                type="text"
                                name="address.city"
                                value={formData.address.city}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="Thành phố Hồ Chí Minh"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Quận/Huyện</label>
                            <input
                                type="text"
                                name="address.state"
                                value={formData.address.state}
                                onChange={handleChange}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="Quận 1"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Quốc Gia</label>
                            <input
                                type="text"
                                name="address.country"
                                value={formData.address.country}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="Việt Nam"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>ZIP Code</label>
                            <input
                                type="text"
                                name="address.zipCode"
                                value={formData.address.zipCode}
                                onChange={handleChange}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="70000"
                            />
                        </div>
                    </div>

                    {/* Google Maps Link Input */}
                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)', borderRadius: '12px', border: '2px solid #10b981' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#10b981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.5rem' }}>🗺️</span>
                            Vị Trí Google Maps (Tự động lấy tọa độ)
                        </h3>
                        <label style={{ ...labelStyle, color: '#10b981' }}>
                            Dán link Google Maps của khách sạn
                        </label>
                        <input
                            type="text"
                            value={googleMapsLink}
                            onChange={handleGoogleMapsLinkChange}
                            style={{
                                ...inputStyle,
                                width: '100%',
                                borderColor: coordinateError.includes('✅') ? '#10b981' : coordinateError.includes('❌') ? '#ef4444' : '#10b981'
                            }}
                            placeholder="https://www.google.com/maps/place/..."
                        />
                        {coordinateError && (
                            <p style={{
                                marginTop: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: coordinateError.includes('✅') ? '#10b981' : '#ef4444'
                            }}>
                                {coordinateError}
                            </p>
                        )}
                        {formData.address.coordinates.latitude !== 0 && formData.address.coordinates.longitude !== 0 && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '2px solid #10b981' }}>
                                <p style={{ fontSize: '0.875rem', color: '#059669', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    📍 Tọa độ hiện tại:
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Latitude:</span>
                                        <p style={{ fontSize: '1rem', color: '#111827', fontWeight: '700', marginTop: '4px' }}>
                                            {formData.address.coordinates.latitude}
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Longitude:</span>
                                        <p style={{ fontSize: '1rem', color: '#111827', fontWeight: '700', marginTop: '4px' }}>
                                            {formData.address.coordinates.longitude}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem', lineHeight: '1.5' }}>
                            💡 <strong>Hướng dẫn:</strong> Mở Google Maps → Tìm vị trí khách sạn → Click "Chia sẻ" → Sao chép link → Dán vào ô trên
                        </p>
                    </div>
                </div>

                {/* Price Information */}
                <div
                    style={activeSection === 'price' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('price')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={iconStyle}>💰</span>
                        Thông Tin Giá
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Giá Thấp Nhất (VNĐ)</label>
                            <input
                                type="number"
                                name="priceRange.min"
                                value={formData.priceRange.min}
                                onChange={handleChange}
                                required
                                min="0"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="500.000"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Giá Cao Nhất (VNĐ)</label>
                            <input
                                type="number"
                                name="priceRange.max"
                                value={formData.priceRange.max}
                                onChange={handleChange}
                                required
                                min={formData.priceRange.min}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="2.000.000"
                            />
                        </div>
                    </div>
                </div>

                {/* Policies */}
                <div
                    style={activeSection === 'policies' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('policies')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={iconStyle}>📋</span>
                        Chính Sách
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Giờ Nhận Phòng</label>
                            <input
                                type="time"
                                name="policies.checkInTime"
                                value={formData.policies.checkInTime}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Giờ Trả Phòng</label>
                            <input
                                type="time"
                                name="policies.checkOutTime"
                                value={formData.policies.checkOutTime}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                        <label style={labelStyle}>Chính Sách Hủy Phòng</label>
                        <textarea
                            name="policies.cancellationPolicy"
                            value={formData.policies.cancellationPolicy}
                            onChange={handleChange}
                            rows="3"
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            placeholder="Miễn phí hủy phòng trước 24 giờ..."
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Phương Thức Thanh Toán</label>
                        <div style={checkboxContainerStyle}>
                            {paymentOptionsList.map(option => (
                                <label
                                    key={option}
                                    style={formData.policies.paymentOptions.includes(option)
                                        ? checkboxLabelActiveStyle
                                        : checkboxLabelStyle}
                                >
                                    <input
                                        type="checkbox"
                                        name="paymentOptions"
                                        value={option}
                                        checked={formData.policies.paymentOptions.includes(option)}
                                        onChange={handleChange}
                                        style={checkboxStyle}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label
                            style={{
                                ...checkboxLabelStyle,
                                display: 'inline-flex',
                                width: 'auto'
                            }}
                        >
                            <input
                                type="checkbox"
                                name="petsAllowed"
                                checked={formData.policies.petsAllowed}
                                onChange={handleChange}
                                style={checkboxStyle}
                            />
                            <span>🐾 Cho phép thú cưng</span>
                        </label>
                    </div>
                </div>

                {/* Contact Information */}
                <div
                    style={activeSection === 'contact' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('contact')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={iconStyle}>📞</span>
                        Thông tin liên lạc
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Phone</label>
                            <input
                                type="tel"
                                name="contactInfo.phone"
                                value={formData.contactInfo.phone}
                                onChange={handleChange}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="+84 123 456 789"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Email</label>
                            <input
                                type="email"
                                name="contactInfo.email"
                                value={formData.contactInfo.email}
                                onChange={handleChange}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="contact@hotel.com"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Website</label>
                            <input
                                type="url"
                                name="contactInfo.website"
                                value={formData.contactInfo.website}
                                onChange={handleChange}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="https://yourhotel.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Amenities */}
                <div
                    style={activeSection === 'amenities' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('amenities')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={iconStyle}>✨</span>
                        Tiện nghi
                    </h2>
                    <div style={checkboxContainerStyle}>
                        {amenitiesList.map(amenity => (
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
                                    style={checkboxStyle}
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
                        <span style={iconStyle}>📸</span>
                        Hình Ảnh
                        <span style={{
                            marginLeft: 'auto',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: formData.images.length >= 7 ? '#10b981' : '#ef4444',
                            background: formData.images.length >= 7 ? '#d1fae5' : '#fee2e2',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px'
                        }}>
                            {formData.images.length}/7 ảnh {formData.images.length >= 7 ? '✓' : '(Tối thiểu 7 ảnh)'}
                        </span>
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
                                // Determine image URL (handle both file objects and strings)
                                const imageUrl = typeof image === 'string' ? image : (image.preview || '');

                                // Use proxy for Google Drive URLs
                                const displayUrl = isGoogleDriveUrl(imageUrl)
                                    ? getProxiedGoogleDriveUrl(imageUrl)
                                    : imageUrl;

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
                                            alt={`Hotel preview ${index + 1}`}
                                            style={imagePreviewStyle}
                                            onError={(e) => {
                                                console.error('Failed to load image:', displayUrl);
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
                                            {/* Image Number Badge */}
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
                                                        title="Tiến lên"
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
                                                        title="Lùi xuống"
                                                    >
                                                        ⬇️
                                                    </button>
                                                )}

                                                {/* Delete Button */}
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
                                                    title="Xóa ảnh"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>

                                        {/* Google Drive Badge */}
                                        {isGoogleDriveUrl(imageUrl) && (
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
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={formData.images.length < 7}
                        style={{
                            ...submitButtonStyle,
                            opacity: formData.images.length < 7 ? 0.5 : 1,
                            cursor: formData.images.length < 7 ? 'not-allowed' : 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            if (formData.images.length >= 7) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (formData.images.length >= 7) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                            }
                        }}
                    >
                        {initialData ? '✅ Cập nhật khách sạn' : '✨ Tạo khách sạn'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HotelForm;