import React, { useEffect } from 'react';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'medium',
    closeOnOverlayClick = true,
    showCloseButton = true
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose?.();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        small: '400px',
        medium: '600px',
        large: '800px',
        xlarge: '1000px',
        full: '95vw'
    };

    // Styles
    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem',
        animation: 'fadeIn 0.2s ease',
        backdropFilter: 'blur(4px)'
    };

    const modalStyle = {
        background: 'white',
        borderRadius: '16px',
        maxWidth: sizes[size] || sizes.medium,
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'slideUp 0.3s ease',
        overflow: 'hidden'
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem 2rem',
        borderBottom: '2px solid #e5e7eb'
    };

    const titleStyle = {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#1f2937',
        margin: 0
    };

    const closeButtonStyle = {
        background: 'transparent',
        border: 'none',
        fontSize: '1.5rem',
        color: '#6b7280',
        cursor: 'pointer',
        padding: '0.25rem 0.5rem',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const bodyStyle = {
        flex: 1,
        overflowY: 'auto',
        padding: '2rem'
    };

    const footerStyle = {
        padding: '1.5rem 2rem',
        borderTop: '2px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem'
    };

    return (
        <>
            <style>
                {`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }

                    @keyframes slideUp {
                        from {
                            transform: translateY(50px);
                            opacity: 0;
                        }
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }
                `}
            </style>
            <div
                style={overlayStyle}
                onClick={(e) => {
                    if (closeOnOverlayClick && e.target === e.currentTarget) {
                        onClose?.();
                    }
                }}
            >
                <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    {(title || showCloseButton) && (
                        <div style={headerStyle}>
                            {title && <h3 style={titleStyle}>{title}</h3>}
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    style={closeButtonStyle}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#f3f4f6';
                                        e.currentTarget.style.color = '#1f2937';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#6b7280';
                                    }}
                                    aria-label="Close modal"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    )}

                    {/* Body */}
                    <div style={bodyStyle}>{children}</div>

                    {/* Footer */}
                    {footer && <div style={footerStyle}>{footer}</div>}
                </div>
            </div>
        </>
    );
};

// Predefined action buttons for common use cases
Modal.Button = ({ children, onClick, variant = 'primary', ...props }) => {
    const baseStyle = {
        padding: '0.75rem 1.5rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    };

    const variants = {
        primary: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
        },
        secondary: {
            background: 'white',
            color: '#6b7280',
            border: '2px solid #e5e7eb'
        },
        danger: {
            background: '#ef4444',
            color: 'white'
        },
        success: {
            background: '#10b981',
            color: 'white'
        }
    };

    return (
        <button
            style={{ ...baseStyle, ...variants[variant] }}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Modal;