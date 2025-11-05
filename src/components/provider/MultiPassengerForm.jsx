import React, { useState } from 'react';
import PassengerForm from './PassengerForm';

const MultiPassengerForm = ({ onSave, onCancel, defaultSeatClass = 'Economy' }) => {
    const [passengers, setPassengers] = useState([
        {
            id: Date.now(),
            fullName: '',
            gender: 'male',
            dateOfBirth: '',
            nationality: 'Vietnam',
            passportNumber: '',
            seatNumber: '',
            seatClass: defaultSeatClass,
            mealPreference: 'none',
            specialRequests: ''
        }
    ]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [errors, setErrors] = useState({});

    const addNewPassenger = () => {
        const newPassenger = {
            id: Date.now(),
            fullName: '',
            gender: 'male',
            dateOfBirth: '',
            nationality: 'Vietnam',
            passportNumber: '',
            seatNumber: '',
            seatClass: defaultSeatClass,
            mealPreference: 'none',
            specialRequests: ''
        };
        setPassengers([...passengers, newPassenger]);
        setCurrentIndex(passengers.length);
    };

    const duplicatePassenger = (index) => {
        const passengerToDuplicate = passengers[index];
        const duplicatedPassenger = {
            ...passengerToDuplicate,
            id: Date.now(),
            passportNumber: '', // Clear passport number for new passenger
            seatNumber: '' // Clear seat number for new passenger
        };
        const newPassengers = [...passengers];
        newPassengers.splice(index + 1, 0, duplicatedPassenger);
        setPassengers(newPassengers);
        setCurrentIndex(index + 1);
    };

    const removePassenger = (index) => {
        if (passengers.length > 1) {
            const newPassengers = passengers.filter((_, i) => i !== index);
            setPassengers(newPassengers);
            if (currentIndex >= newPassengers.length) {
                setCurrentIndex(newPassengers.length - 1);
            }
        }
    };

    const updatePassenger = (index, updatedData) => {
        const newPassengers = [...passengers];
        newPassengers[index] = { ...newPassengers[index], ...updatedData };
        setPassengers(newPassengers);
    };

    const validateAllPassengers = () => {
        const newErrors = {};
        
        passengers.forEach((passenger, index) => {
            const passengerErrors = {};

            if (!passenger.fullName.trim()) {
                passengerErrors.fullName = 'Full name is required';
            }

            if (!passenger.dateOfBirth) {
                passengerErrors.dateOfBirth = 'Date of birth is required';
            }

            if (!passenger.passportNumber.trim()) {
                passengerErrors.passportNumber = 'Passport number is required';
            }

            if (Object.keys(passengerErrors).length > 0) {
                newErrors[index] = passengerErrors;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveAll = () => {
        if (validateAllPassengers()) {
            // Remove temporary IDs before saving
            const passengersToSave = passengers.map(({ id, ...passenger }) => passenger);
            onSave(passengersToSave);
        } else {
            // Find first passenger with errors and navigate to it
            const firstErrorIndex = Object.keys(errors).map(Number)[0];
            setCurrentIndex(firstErrorIndex);
        }
    };

    const handlePassengerSave = (updatedData) => {
        updatePassenger(currentIndex, updatedData);
    };

    // Styles
    const containerStyle = {
        background: '#f9fafb',
        borderRadius: '16px',
        padding: '2rem'
    };

    const headerStyle = {
        marginBottom: '2rem'
    };

    const titleStyle = {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    };

    const subtitleStyle = {
        fontSize: '0.875rem',
        color: '#6b7280'
    };

    const passengerTabsStyle = {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem'
    };

    const tabStyle = (isActive, hasErrors) => ({
        padding: '0.75rem 1.25rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        borderRadius: '10px',
        border: hasErrors ? '2px solid #ef4444' : '2px solid transparent',
        background: isActive ? '#10b981' : 'white',
        color: isActive ? 'white' : '#374151',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    });

    const actionButtonsStyle = {
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
    };

    const buttonStyle = {
        padding: '0.75rem 1.25rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const addButtonStyle = {
        ...buttonStyle,
        background: '#10b981',
        color: 'white'
    };

    const duplicateButtonStyle = {
        ...buttonStyle,
        background: '#3b82f6',
        color: 'white'
    };

    const removeButtonStyle = {
        ...buttonStyle,
        background: '#ef4444',
        color: 'white'
    };

    const footerButtonsStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '2rem',
        paddingTop: '1.5rem',
        borderTop: '2px solid #e5e7eb'
    };

    const summaryStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        color: '#6b7280'
    };

    const countBadgeStyle = {
        background: '#10b981',
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: '700'
    };

    const saveAllButtonStyle = {
        ...buttonStyle,
        background: '#10b981',
        color: 'white',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
        padding: '0.875rem 2rem'
    };

    const cancelButtonStyle = {
        ...buttonStyle,
        background: 'white',
        color: '#6b7280',
        border: '2px solid #e5e7eb'
    };

    const errorMessageStyle = {
        background: '#fee2e2',
        color: '#dc2626',
        padding: '1rem',
        borderRadius: '10px',
        fontSize: '0.875rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h2 style={titleStyle}>
                    <span>✈️</span>
                    Passenger Information
                </h2>
                <p style={subtitleStyle}>
                    Add passenger details for this booking. You can add multiple passengers and duplicate information for similar passengers.
                </p>
            </div>

            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
                <div style={errorMessageStyle}>
                    <span>⚠️</span>
                    <span>
                        {Object.keys(errors).length} passenger(s) have incomplete information. 
                        Please review and complete all required fields.
                    </span>
                </div>
            )}

            {/* Passenger Tabs */}
            <div style={passengerTabsStyle}>
                {passengers.map((passenger, index) => (
                    <button
                        key={passenger.id}
                        onClick={() => setCurrentIndex(index)}
                        style={tabStyle(index === currentIndex, errors[index])}
                    >
                        <span>👤</span>
                        <span>Passenger {index + 1}</span>
                        {errors[index] && <span>⚠️</span>}
                    </button>
                ))}
            </div>

            {/* Action Buttons */}
            <div style={actionButtonsStyle}>
                <button onClick={addNewPassenger} style={addButtonStyle}>
                    <span>➕</span>
                    Add New Passenger
                </button>
                <button 
                    onClick={() => duplicatePassenger(currentIndex)} 
                    style={duplicateButtonStyle}
                >
                    <span>📋</span>
                    Duplicate Current
                </button>
                {passengers.length > 1 && (
                    <button 
                        onClick={() => removePassenger(currentIndex)} 
                        style={removeButtonStyle}
                    >
                        <span>🗑️</span>
                        Remove Current
                    </button>
                )}
            </div>

            {/* Current Passenger Form */}
            <PassengerForm
                passenger={passengers[currentIndex]}
                onSave={handlePassengerSave}
                passengerIndex={currentIndex}
                seatClass={defaultSeatClass}
            />

            {/* Footer */}
            <div style={footerButtonsStyle}>
                <div style={summaryStyle}>
                    <span>Total Passengers:</span>
                    <span style={countBadgeStyle}>{passengers.length}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {onCancel && (
                        <button onClick={onCancel} style={cancelButtonStyle}>
                            Cancel
                        </button>
                    )}
                    <button onClick={handleSaveAll} style={saveAllButtonStyle}>
                        <span>💾</span>
                        Save All Passengers
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MultiPassengerForm;