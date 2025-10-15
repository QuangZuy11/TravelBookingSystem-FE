import React from 'react';
import { cn } from '@utils/tourHelpers';

/**
 * Reusable Badge Component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Badge content
 * @param {'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gray'} props.variant - Badge variant
 * @param {'sm' | 'md' | 'lg'} props.size - Badge size
 * @param {boolean} props.rounded - Fully rounded badge (pill shape)
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.className - Additional CSS classes
 */
const Badge = ({
    children,
    variant = 'primary',
    size = 'md',
    rounded = true,
    icon,
    className,
    ...rest
}) => {
    const baseStyles = 'inline-flex items-center font-medium';

    const variantStyles = {
        primary: 'bg-primary-100 text-primary-800',
        secondary: 'bg-secondary-100 text-secondary-800',
        success: 'bg-green-100 text-green-800',
        danger: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
        gray: 'bg-gray-100 text-gray-800',
    };

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs gap-1',
        md: 'px-2.5 py-1 text-sm gap-1.5',
        lg: 'px-3 py-1.5 text-base gap-2',
    };

    const roundedStyle = rounded ? 'rounded-full' : 'rounded';

    return (
        <span
            className={cn(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                roundedStyle,
                className
            )}
            {...rest}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
        </span>
    );
};

export default Badge;
