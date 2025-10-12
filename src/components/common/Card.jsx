import React from 'react';
import { cn } from '@utils/tourHelpers';

/**
 * Reusable Card Component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.header - Custom header content
 * @param {React.ReactNode} props.footer - Card footer
 * @param {boolean} props.noPadding - Remove default padding
 * @param {boolean} props.hoverable - Add hover effect
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 */
const Card = ({
    children,
    title,
    header,
    footer,
    noPadding = false,
    hoverable = false,
    onClick,
    className,
    ...rest
}) => {
    const cardClasses = cn(
        'bg-white rounded-lg border border-gray-200 shadow-card',
        hoverable && 'hover:shadow-card-hover transition-shadow duration-200 cursor-pointer',
        onClick && 'cursor-pointer',
        className
    );

    return (
        <div className={cardClasses} onClick={onClick} {...rest}>
            {/* Header */}
            {(header || title) && (
                <div className="px-6 py-4 border-b border-gray-200">
                    {header ? (
                        header
                    ) : (
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    )}
                </div>
            )}

            {/* Content */}
            <div className={noPadding ? '' : 'p-6'}>{children}</div>

            {/* Footer */}
            {footer && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
