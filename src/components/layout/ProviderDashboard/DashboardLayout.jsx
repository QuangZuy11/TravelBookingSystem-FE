import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const menuItems = [
    { path: '/provider/tours', label: 'Tours', icon: '🏛️' },
    { path: '/provider/hotels', label: 'Hotels', icon: '🏨' },
    { path: '/provider/flights', label: 'Flights', icon: '✈️' },
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