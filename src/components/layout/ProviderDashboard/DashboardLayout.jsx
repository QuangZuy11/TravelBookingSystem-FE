import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const location = useLocation();
  const [isFlightMenuOpen, setIsFlightMenuOpen] = useState(false);
  const [isTourMenuOpen, setIsTourMenuOpen] = useState(false);

  // Auto-expand dropdown if user is on a flight-related page
  useEffect(() => {
    if (location.pathname.includes('/flight')) {
      setIsFlightMenuOpen(true);
    }
    if (location.pathname.includes('/tour')) {
      setIsTourMenuOpen(true);
    }
  }, [location.pathname]);

  const menuItems = [
    { path: '/provider/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/provider/hotels', label: 'Hotels', icon: '🏨' },
  ];

  const flightSubmenu = [
    { path: '/provider/flights', label: 'All Flights', icon: '✈️' },
    { path: '/provider/flight-statistics', label: 'Statistics', icon: '📈' },
    { path: '/provider/flight-bookings', label: 'Bookings', icon: '📋' },
    { path: '/provider/flight-classes', label: 'Classes', icon: '🎖️' },
  ];

  const tourSubmenu = [
    { path: '/provider/tours', label: 'Dashboard', icon: '📊' },
    { path: '/provider/tours/create', label: 'Create Tour', icon: '➕' },
    { path: '/provider/tours/bookings', label: 'Tour Bookings', icon: '📋' },
    { path: '/provider/tours/statistics', label: 'Statistics', icon: '📊' },
  ];

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Provider Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}

          {/* Tour Management Menu with Dropdown */}
          <div className="nav-item-wrapper">
            <button
              className={`nav-item-dropdown ${location.pathname.includes('/tour') ? 'active' : ''
                }`}
              onClick={() => setIsTourMenuOpen(!isTourMenuOpen)}
            >
              <div className="nav-item-label">
                <span className="nav-icon">🏛️</span>
                <span className="nav-label">Tour Management</span>
              </div>
              <span className={`dropdown-arrow ${isTourMenuOpen ? 'open' : ''}`}>
                ▼
              </span>
            </button>

            {/* Tour Submenu */}
            <div className={`submenu ${isTourMenuOpen ? 'open' : ''}`}>
              {tourSubmenu.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `submenu-item ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Flight Menu with Dropdown */}
          <div className="nav-item-wrapper">
            <button
              className={`nav-item-dropdown ${location.pathname.includes('/flight') ? 'active' : ''
                }`}
              onClick={() => setIsFlightMenuOpen(!isFlightMenuOpen)}
            >
              <div className="nav-item-label">
                <span className="nav-icon">✈️</span>
                <span className="nav-label">Flight Management</span>
              </div>
              <span className={`dropdown-arrow ${isFlightMenuOpen ? 'open' : ''}`}>
                ▼
              </span>
            </button>

            {/* Submenu */}
            <div className={`submenu ${isFlightMenuOpen ? 'open' : ''}`}>
              {flightSubmenu.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `submenu-item ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Service Management</h1>
            {/* Add additional header content like profile menu, notifications, etc. */}
          </div>
        </header>
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;