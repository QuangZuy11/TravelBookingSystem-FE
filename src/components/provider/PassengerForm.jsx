import React, { useState, useEffect } from 'react';

const PassengerForm = ({
    passenger = null,
    onSave,
    onCancel,
    seatNumber = '',
    seatClass = '',
    passengerIndex = 0
}) => {
    const [formData, setFormData] = useState({
        fullName: '',
        gender: 'male',
        dateOfBirth: '',
        nationality: 'Vietnam',
        passportNumber: '',
        seatNumber: seatNumber,
        seatClass: seatClass,
        mealPreference: 'none',
        specialRequests: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (passenger) {
            setFormData(passenger);
        } else {
            setFormData(prev => ({
                ...prev,
                seatNumber: seatNumber,
                seatClass: seatClass
            }));
        }
    }, [passenger, seatNumber, seatClass]);

    const countries = [
        'Vietnam', 'United States', 'United Kingdom', 'Canada', 'Australia',
        'Japan', 'South Korea', 'China', 'Singapore', 'Thailand',
        'Malaysia', 'Indonesia', 'Philippines', 'India', 'France',
        'Germany', 'Italy', 'Spain', 'Other'
    ];

    const mealOptions = [
        { value: 'none', label: 'Không yêu cầu' },
        { value: 'vegetarian', label: 'Ăn chay' },
        { value: 'vegan', label: 'Thuần chay' },
        { value: 'halal', label: 'Halal' },
        { value: 'kosher', label: 'Kosher' },
        { value: 'gluten-free', label: 'Không gluten' },
        { value: 'diabetic', label: 'Tiểu đường' }
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ tên';
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Vui lòng nhập ngày sinh';
        } else {
            const birthDate = new Date(formData.dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();

            if (age < 0 || age > 150) {
                newErrors.dateOfBirth = 'Ngày sinh không hợp lệ';
            }
        }

        if (!formData.passportNumber.trim()) {
            newErrors.passportNumber = 'Vui lòng nhập số hộ chiếu';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onSave(formData);
        }
    };

    // Styles
    const formContainerStyle = {
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        border: '2px solid #e5e7eb',
        marginBottom: '1.5rem'
    };

    const formHeaderStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e5e7eb'
    };

    const headerTitleStyle = {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
    };

    const formGroupStyle = {
        marginBottom: '0'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '0.5rem'
    };

    const requiredStyle = {
        color: '#ef4444',
        marginLeft: '0.25rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        outline: 'none',
        transition: 'all 0.3s ease'
    };

    const selectStyle = {
        ...inputStyle
    };

    const textareaStyle = {
        ...inputStyle,
        minHeight: '80px',
        resize: 'vertical'
    };

    const radioContainerStyle = {
        display: 'flex',
        gap: '1.5rem',
        marginTop: '0.5rem'
    };

    const radioLabelStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        color: '#374151',
        cursor: 'pointer'
    };

    const errorStyle = {
        color: '#ef4444',
        fontSize: '0.75rem',
        marginTop: '0.25rem'
    };

    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        paddingTop: '1rem',
        borderTop: '2px solid #e5e7eb'
    };

    const buttonStyle = {
        padding: '0.75rem 1.5rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    };

    const primaryButtonStyle = {
        ...buttonStyle,
        background: '#10b981',
        color: 'white',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    };

    const secondaryButtonStyle = {
        ...buttonStyle,
        background: 'white',
        color: '#6b7280',
        border: '2px solid #e5e7eb'
    };

    return (
        <form onSubmit={handleSubmit} style={formContainerStyle}>
            <div style={formHeaderStyle}>
                <h3 style={headerTitleStyle}>
                    <span>👤</span>
                    Hành khách {passengerIndex > 0 ? `#${passengerIndex + 1}` : ''}
                </h3>
            </div>

            {/* Basic Information */}
            <div style={gridStyle}>
                <div style={formGroupStyle}>
                    <label style={labelStyle}>
                        Họ và tên <span style={requiredStyle}>*</span>
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Nhập họ và tên"
                    />
                    {errors.fullName && <p style={errorStyle}>{errors.fullName}</p>}
                </div>

                <div style={formGroupStyle}>
                    <label style={labelStyle}>
                        Giới tính <span style={requiredStyle}>*</span>
                    </label>
                    <div style={radioContainerStyle}>
                        <label style={radioLabelStyle}>
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={formData.gender === 'male'}
                                onChange={handleChange}
                            />
                            Male
                        </label>
                        <label style={radioLabelStyle}>
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={formData.gender === 'female'}
                                onChange={handleChange}
                            />
                            Female
                        </label>
                        <label style={radioLabelStyle}>
                            <input
                                type="radio"
                                name="gender"
                                value="other"
                                checked={formData.gender === 'other'}
                                onChange={handleChange}
                            />
                            Other
                        </label>
                    </div>
                </div>

                <div style={formGroupStyle}>
                    <label style={labelStyle}>
                        Date of Birth <span style={requiredStyle}>*</span>
                    </label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                    {errors.dateOfBirth && <p style={errorStyle}>{errors.dateOfBirth}</p>}
                </div>
            </div>

            {/* Travel Document */}
            <div style={gridStyle}>
                <div style={formGroupStyle}>
                    <label style={labelStyle}>
                        Nationality <span style={requiredStyle}>*</span>
                    </label>
                    <select
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        style={selectStyle}
                    >
                        {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>
                </div>

                <div style={formGroupStyle}>
                    <label style={labelStyle}>
                        Passport Number <span style={requiredStyle}>*</span>
                    </label>
                    <input
                        type="text"
                        name="passportNumber"
                        value={formData.passportNumber}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Enter passport number"
                    />
                    {errors.passportNumber && <p style={errorStyle}>{errors.passportNumber}</p>}
                </div>
            </div>

            {/* Seat Information */}
            <div style={gridStyle}>
                <div style={formGroupStyle}>
                    <label style={labelStyle}>Seat Number</label>
                    <input
                        type="text"
                        name="seatNumber"
                        value={formData.seatNumber}
                        onChange={handleChange}
                        style={{ ...inputStyle, background: '#f9fafb' }}
                        placeholder="Auto-assigned"
                    />
                </div>

                <div style={formGroupStyle}>
                    <label style={labelStyle}>Class</label>
                    <input
                        type="text"
                        name="seatClass"
                        value={formData.seatClass}
                        onChange={handleChange}
                        style={{ ...inputStyle, background: '#f9fafb' }}
                        placeholder="Auto-assigned"
                        readOnly
                    />
                </div>

                <div style={formGroupStyle}>
                    <label style={labelStyle}>Meal Preference</label>
                    <select
                        name="mealPreference"
                        value={formData.mealPreference}
                        onChange={handleChange}
                        style={selectStyle}
                    >
                        {mealOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Special Requests */}
            <div style={formGroupStyle}>
                <label style={labelStyle}>Special Requests (Optional)</label>
                <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    style={textareaStyle}
                    placeholder="Any special requirements or requests..."
                />
            </div>

            {/* Action Buttons */}
            <div style={buttonContainerStyle}>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        style={secondaryButtonStyle}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    style={primaryButtonStyle}
                >
                    {passenger ? 'Update Passenger' : 'Add Passenger'}
                </button>
            </div>
        </form>
    );
};

export default PassengerForm;