import React from 'react';
import { cn } from '@utils/tourHelpers';

/**
 * Reusable Input Component
 * 
 * @param {Object} props
 * @param {'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'} props.type - Input type
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {React.ReactNode} props.icon - Icon component (left)
 * @param {React.ReactNode} props.rightIcon - Icon component (right)
 * @param {string} props.className - Additional CSS classes
 */
const Input = ({
    type = 'text',
    label,
    placeholder,
    value,
    onChange,
    error,
    helperText,
    required = false,
    disabled = false,
    icon,
    rightIcon,
    className,
    ...rest
}) => {
    const inputId = React.useId();

    const inputStyles = cn(
        'w-full px-4 py-2.5 text-gray-900 bg-white border rounded-lg',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
        error
            ? 'border-danger-500 focus:ring-danger-500'
            : 'border-gray-300 hover:border-gray-400',
        icon && 'pl-11',
        rightIcon && 'pr-11',
        className
    );

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block mb-2 text-sm font-medium text-gray-700"
                >
                    {label}
                    {required && <span className="text-danger-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        {icon}
                    </div>
                )}

                <input
                    id={inputId}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={inputStyles}
                    {...rest}
                />

                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                        {rightIcon}
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1.5 text-sm text-danger-600 flex items-center gap-1">
                    <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
};

export default Input;
