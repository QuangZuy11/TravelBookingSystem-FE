import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const location = useLocation();
  const [isFlightMenuOpen, setIsFlightMenuOpen] = useState(false);
  
  // Auto-expand dropdown if user is on a flight-related page
  useEffect(() => {
    if (location.pathname.includes('/flight')) {
      setIsFlightMenuOpen(true);
    }
  }, [location.pathname]);
  
  const menuItems = [
    { path: '/provider/tours', label: 'Tours', icon: '🏛️' },
    { path: '/provider/hotels', label: 'Hotels', icon: '🏨' },
  ];

  const flightSubmenu = [
    { path: '/provider/flights', label: 'All Flights', icon: '✈️' },
    { path: '/provider/flight-statistics', label: 'Statistics', icon: '📈' },
    { path: '/provider/flight-bookings', label: 'Bookings', icon: '�' },
    { path: '/provider/flight-classes', label: 'Classes', icon: '🎖️' },
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

          {/* Flight Menu with Dropdown */}
          <div className="nav-item-wrapper">
            <button
              className={`nav-item-dropdown ${
                location.pathname.includes('/flight') ? 'active' : ''
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