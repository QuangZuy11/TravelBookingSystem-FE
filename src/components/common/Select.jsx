import React from 'react';
import { cn } from '@utils/tourHelpers';

/**
 * Reusable Select Component
 * 
 * @param {Object} props
 * @param {string} props.label - Select label
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Options array [{value, label}]
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.className - Additional CSS classes
 */
const Select = ({
    label,
    placeholder = 'Chọn...',
    value,
    onChange,
    options = [],
    error,
    helperText,
    required = false,
    disabled = false,
    icon,
    className,
    ...rest
}) => {
    const selectId = React.useId();

    const selectStyles = cn(
        'w-full px-4 py-2.5 text-gray-900 bg-white border rounded-lg appearance-none',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
        error
            ? 'border-danger-500 focus:ring-danger-500'
            : 'border-gray-300 hover:border-gray-400',
        icon && 'pl-11',
        className
    );

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={selectId}
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

                <select
                    id={selectId}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    className={selectStyles}
                    {...rest}
                >
                    <option value="" disabled>
                        {placeholder}
                    </option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>

            {error && (
                <p className="mt-1.5 text-sm text-danger-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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

export default Select;
