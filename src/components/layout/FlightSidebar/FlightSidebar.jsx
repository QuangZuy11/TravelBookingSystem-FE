import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FlightSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '📊',
            path: '/provider/flights',
            description: 'Overview & Statistics'
        },
        {
            id: 'flights',
            label: 'Flights',
            icon: '✈️',
            path: '/provider/flights',
            description: 'Manage Flights'
        },
        {
            id: 'schedules',
            label: 'Schedules',
            icon: '📅',
            path: '/provider/flight-schedules',
            description: 'Flight Schedules',
            badge: 'New'
        },
        {
            id: 'bookings',
            label: 'Bookings',
            icon: '🎫',
            path: '/provider/flight-bookings',
            description: 'Manage Bookings'
        },
        {
            id: 'classes',
            label: 'Flight Classes',
            icon: '💺',
            path: '/provider/flight-classes',
            description: 'Service Classes'
        },
        {
            id: 'statistics',
            label: 'Statistics',
            icon: '📈',
            path: '/provider/flight-statistics',
            description: 'Analytics & Reports'
        }
    ];

    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    // Styles
    const sidebarStyle = {
        width: isCollapsed ? '80px' : '280px',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
        position: 'fixed',
        left: 0,
        top: 0,
        transition: 'all 0.3s ease',
        zIndex: 100,
        boxShadow: '4px 0 20px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column'
    };

    const headerStyle = {
        padding: '1.5rem',
        borderBottom: '2px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    };

    const logoStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    };

    const logoIconStyle = {
        fontSize: '2rem'
    };

    const logoTextStyle = {
        fontSize: '1.25rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        opacity: isCollapsed ? 0 : 1,
        transition: 'opacity 0.3s ease'
    };

    const toggleButtonStyle = {
        background: 'rgba(255,255,255,0.1)',
        border: 'none',
        color: 'white',
        padding: '0.5rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1.25rem',
        transition: 'all 0.3s ease'
    };

    const menuStyle = {
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        overflowX: 'hidden'
    };

    const menuItemStyle = (active) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        marginBottom: '0.5rem',
        background: active 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'transparent',
        color: 'white',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden'
    });

    const menuIconStyle = {
        fontSize: '1.5rem',
        minWidth: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const menuTextContainerStyle = {
        flex: 1,
        overflow: 'hidden',
        opacity: isCollapsed ? 0 : 1,
        transition: 'opacity 0.3s ease'
    };

    const menuLabelStyle = {
        fontSize: '0.875rem',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        marginBottom: '0.125rem'
    };

    const menuDescStyle = {
        fontSize: '0.675rem',
        opacity: 0.7,
        whiteSpace: 'nowrap'
    };

    const badgeStyle = {
        background: '#ef4444',
        color: 'white',
        fontSize: '0.625rem',
        fontWeight: '600',
        padding: '0.125rem 0.5rem',
        borderRadius: '10px',
        whiteSpace: 'nowrap'
    };

    const footerStyle = {
        padding: '1rem',
        borderTop: '2px solid rgba(255,255,255,0.1)'
    };

    const userInfoStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px'
    };

    const avatarStyle = {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        flexShrink: 0
    };

    const userTextStyle = {
        overflow: 'hidden',
        opacity: isCollapsed ? 0 : 1,
        transition: 'opacity 0.3s ease'
    };

    const userNameStyle = {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: 'white',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    };

    const userRoleStyle = {
        fontSize: '0.675rem',
        color: 'rgba(255,255,255,0.6)',
        whiteSpace: 'nowrap'
    };

    return (
        <aside style={sidebarStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <div style={logoStyle}>
                    <span style={logoIconStyle}>✈️</span>
                    <span style={logoTextStyle}>Flight Manager</span>
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={toggleButtonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                    {isCollapsed ? '☰' : '✕'}
                </button>
            </div>

            {/* Menu Items */}
            <nav style={menuStyle}>
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            style={menuItemStyle(active)}
                            onMouseEnter={(e) => {
                                if (!active) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!active) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                            title={isCollapsed ? item.label : ''}
                        >
                            <span style={menuIconStyle}>{item.icon}</span>
                            <div style={menuTextContainerStyle}>
                                <div style={menuLabelStyle}>{item.label}</div>
                                <div style={menuDescStyle}>{item.description}</div>
                            </div>
                            {item.badge && !isCollapsed && (
                                <span style={badgeStyle}>{item.badge}</span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer - User Info */}
            <div style={footerStyle}>
                <div style={userInfoStyle}>
                    <div style={avatarStyle}>👤</div>
                    <div style={userTextStyle}>
                        <div style={userNameStyle}>Flight Provider</div>
                        <div style={userRoleStyle}>Administrator</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default FlightSidebar;