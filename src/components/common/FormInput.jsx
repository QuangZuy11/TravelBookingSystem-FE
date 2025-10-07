import React from 'react';

const FormInput = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    error,
    disabled = false,
    icon,
    maxLength,
    minLength,
    pattern,
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

    const inputWrapperStyle = {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    };

    const inputStyle = {
        width: '100%',
        padding: icon ? '0.75rem 1rem 0.75rem 2.75rem' : '0.75rem 1rem',
        fontSize: '0.875rem',
        border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
        borderRadius: '10px',
        outline: 'none',
        transition: 'all 0.3s ease',
        background: disabled ? '#f9fafb' : 'white',
        color: disabled ? '#9ca3af' : '#1f2937'
    };

    const iconStyle = {
        position: 'absolute',
        left: '1rem',
        color: '#6b7280',
        fontSize: '1rem'
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

    const characterCountStyle = {
        marginTop: '0.25rem',
        fontSize: '0.75rem',
        color: '#9ca3af',
        textAlign: 'right'
    };

    return (
        <div style={containerStyle}>
            {label && (
                <label htmlFor={name} style={labelStyle}>
                    {label}
                    {required && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
            )}
            
            <div style={inputWrapperStyle}>
                {icon && <span style={iconStyle}>{icon}</span>}
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    maxLength={maxLength}
                    minLength={minLength}
                    pattern={pattern}
                    style={inputStyle}
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
                />
            </div>

            {maxLength && value && (
                <div style={characterCountStyle}>
                    {value.length}/{maxLength}
                </div>
            )}

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

export default FormInput;