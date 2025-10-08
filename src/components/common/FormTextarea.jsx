import React from 'react';

const FormTextarea = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    required = false,
    error,
    disabled = false,
    rows = 4,
    maxLength,
    minLength,
    helpText,
    resize = 'vertical',
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

    const textareaStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
        borderRadius: '10px',
        outline: 'none',
        transition: 'all 0.3s ease',
        background: disabled ? '#f9fafb' : 'white',
        color: disabled ? '#9ca3af' : '#1f2937',
        fontFamily: 'inherit',
        resize: resize,
        lineHeight: '1.5'
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
            
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                rows={rows}
                maxLength={maxLength}
                minLength={minLength}
                style={textareaStyle}
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

export default FormTextarea;