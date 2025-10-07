import React from 'react';

const FormSelect = ({
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder = 'Select an option',
    required = false,
    error,
    disabled = false,
    icon,
    helpText,
    ...props
}) => {
    const containerStyle = {
        marginBottom: '1.5rem',
        width: '100%'
    };

    const labelStyle = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        gap: '0.25rem'
    };

    const selectWrapperStyle = {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    };

    const selectStyle = {
        width: '100%',
        padding: icon ? '0.75rem 2.5rem 0.75rem 2.75rem' : '0.75rem 2.5rem 0.75rem 1rem',
        fontSize: '0.875rem',
        border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
        borderRadius: '10px',
        outline: 'none',
        transition: 'all 0.3s ease',
        background: disabled ? '#f9fafb' : 'white',
        color: value ? '#1f2937' : '#9ca3af',
        cursor: disabled ? 'not-allowed' : 'pointer',
        appearance: 'none'
    };

    const iconStyle = {
        position: 'absolute',
        left: '1rem',
        color: '#6b7280',
        fontSize: '1rem',
        pointerEvents: 'none'
    };

    const arrowStyle = {
        position: 'absolute',
        right: '1rem',
        color: '#6b7280',
        fontSize: '0.75rem',
        pointerEvents: 'none'
    };

    const errorStyle = {
        marginTop: '0.5rem',
        fontSize: '0.75rem',
        color: '#ef4444',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
    };

    const helpTextStyle = {
        marginTop: '0.5rem',
        fontSize: '0.75rem',
        color: '#6b7280'
    };

    return (
        <div style={containerStyle}>
            {label && (
                <label htmlFor={name} style={labelStyle}>
                    {label}
                    {required && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
            )}
            
            <div style={selectWrapperStyle}>
                {icon && <span style={iconStyle}>{icon}</span>}
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    style={selectStyle}
                    onFocus={(e) => {
                        if (!error && !disabled) {
                            e.target.style.borderColor = '#667eea';
                            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }
                    }}
                    onBlur={(e) => {
                        if (!error) {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.boxShadow = 'none';
                        }
                    }}
                    {...props}
                >
                    <option value="" disabled>
                        {placeholder}
                    </option>
                    {options.map((option, index) => (
                        <option
                            key={option.value || index}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <span style={arrowStyle}>▼</span>
            </div>

            {error && (
                <div style={errorStyle}>
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {helpText && !error && (
                <div style={helpTextStyle}>{helpText}</div>
            )}
        </div>
    );
};

export default FormSelect;