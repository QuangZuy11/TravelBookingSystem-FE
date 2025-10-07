import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../shared/Breadcrumb';

export const HotelForm = ({ initialData, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
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
        totalRooms: 0,
        availableRooms: 0,
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

    useEffect(() => {
        if (initialData) {
            setFormData(prevData => ({ ...prevData, ...initialData }));
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
        const files = Array.from(e.target.files).map(file => URL.createObjectURL(file));
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const amenitiesList = [
        'Wi-Fi', 'Parking', 'Pool', 'Gym', 'Restaurant', 'Spa',
        'Bar', 'Room Service', 'Business Center', 'Airport Shuttle',
        'Air Conditioning', 'Conference Room', 'Laundry Service'
    ];

    const paymentOptionsList = [
        'Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'Digital Wallet'
    ];

    // Styles
    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        borderBottom: '3px solid #667eea',
        paddingBottom: '1.5rem'
    };

    const titleStyle = {
        fontSize: '2.5rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        border: '2px solid #667eea',
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderColor: '#667eea'
    };

    const checkboxStyle = {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
        accentColor: '#667eea'
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                        {initialData ? 'Update Hotel' : 'Create New Hotel'}
                    </h1>
                    <p style={subtitleStyle}>Fill in the details to add your property</p>
                </div>

                {/* Basic Information */}
                <div 
                    style={activeSection === 'basic' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('basic')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={iconStyle}>🏨</span>
                        Basic Information
                    </h2>
                    <div style={{ ...gridStyle, marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Hotel Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            placeholder="Enter hotel name"
                        />
                    </div>
                    <div style={{ ...gridStyle, marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="4"
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            placeholder="Describe your hotel"
                        />
                    </div>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            >
                                <option value="1_star">⭐ 1 Star</option>
                                <option value="2_star">⭐⭐ 2 Stars</option>
                                <option value="3_star">⭐⭐⭐ 3 Stars</option>
                                <option value="4_star">⭐⭐⭐⭐ 4 Stars</option>
                                <option value="5_star">⭐⭐⭐⭐⭐ 5 Stars</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            >
                                <option value="active">✅ Active</option>
                                <option value="inactive">⏸️ Inactive</option>
                                <option value="maintenance">🔧 Maintenance</option>
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
                        Address Information
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Street</label>
                            <input
                                type="text"
                                name="address.street"
                                value={formData.address.street}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="123 Main Street"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>City</label>
                            <input
                                type="text"
                                name="address.city"
                                value={formData.address.city}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="Ho Chi Minh City"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>State/Province</label>
                            <input
                                type="text"
                                name="address.state"
                                value={formData.address.state}
                                onChange={handleChange}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="District 1"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Country</label>
                            <input
                                type="text"
                                name="address.country"
                                value={formData.address.country}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="Vietnam"
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
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="70000"
                            />
                        </div>
                    </div>
                </div>

                {/* Room & Price Information */}
                <div 
                    style={activeSection === 'rooms' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('rooms')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={iconStyle}>🛏️</span>
                        Room & Price Information
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Total Rooms</label>
                            <input
                                type="number"
                                name="totalRooms"
                                value={formData.totalRooms}
                                onChange={handleChange}
                                required
                                min="0"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="50"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Available Rooms</label>
                            <input
                                type="number"
                                name="availableRooms"
                                value={formData.availableRooms}
                                onChange={handleChange}
                                required
                                min="0"
                                max={formData.totalRooms}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="30"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Minimum Price (VND)</label>
                            <input
                                type="number"
                                name="priceRange.min"
                                value={formData.priceRange.min}
                                onChange={handleChange}
                                required
                                min="0"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="500000"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Maximum Price (VND)</label>
                            <input
                                type="number"
                                name="priceRange.max"
                                value={formData.priceRange.max}
                                onChange={handleChange}
                                required
                                min={formData.priceRange.min}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                placeholder="2000000"
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
                        Policies
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Check-in Time</label>
                            <input
                                type="time"
                                name="policies.checkInTime"
                                value={formData.policies.checkInTime}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Check-out Time</label>
                            <input
                                type="time"
                                name="policies.checkOutTime"
                                value={formData.policies.checkOutTime}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                        <label style={labelStyle}>Cancellation Policy</label>
                        <textarea
                            name="policies.cancellationPolicy"
                            value={formData.policies.cancellationPolicy}
                            onChange={handleChange}
                            rows="3"
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            placeholder="Free cancellation up to 24 hours before check-in..."
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Payment Options</label>
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
                            <span>🐾 Pets Allowed</span>
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
                        Contact Information
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
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
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
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
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
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
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
                        Amenities
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
                        Images
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
                            {formData.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Hotel preview ${index + 1}`}
                                    style={imagePreviewStyle}
                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                />
                            ))}
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
                        {initialData ? '✅ Update Hotel' : '✨ Create Hotel'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HotelForm;