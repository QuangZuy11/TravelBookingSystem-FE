import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  Bed,
  MapPin,
  FileText,
  Phone,
  Sparkles,
  Tag,
  Image,
  Calendar,
  Compass
} from 'lucide-react';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const location = useLocation();
  const [isTourMenuOpen, setIsTourMenuOpen] = useState(false);
  const [providerTypes, setProviderTypes] = useState([]);

  useEffect(() => {
    const providerStr = localStorage.getItem('provider');
    if (!providerStr) return;

    try {
      const provider = JSON.parse(providerStr);
      if (provider?.licenses && Array.isArray(provider.licenses)) {
        const types = [...new Set(provider.licenses.map((item) => item.service_type))];
        setProviderTypes(types);
      } else if (Array.isArray(provider?.type)) {
        setProviderTypes(provider.type);
      }
    } catch (error) {
      console.error('Error parsing provider types from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    if (location.pathname.includes('/tour')) {
      setIsTourMenuOpen(true);
    }
  }, [location.pathname]);

  const menuItems = [];

  if (providerTypes.includes('hotel')) {
    // Overview/Dashboard - using /provider/hotels route
    menuItems.push({
      path: '/provider/hotels',
      label: 'Tổng quan',
      icon: BarChart3,
      exact: true
    });

    menuItems.push(
      {
        path: '/provider/hotels/manage',
        label: 'Khách sạn',
        icon: Building2,
      },
      {
        path: '/provider/rooms',
        label: 'Phòng',
        icon: Bed,
      },
      {
        path: '/provider/location',
        label: 'Vị trí',
        icon: MapPin,
      },
      {
        path: '/provider/policies',
        label: 'Chính Sách',
        icon: FileText,
      },
      {
        path: '/provider/contact',
        label: 'Liên Hệ',
        icon: Phone,
      },
      {
        path: '/provider/amenities',
        label: 'Tiện ích',
        icon: Sparkles,
      },
      {
        path: '/provider/gallery',
        label: 'Hình ảnh',
        icon: Image,
      },
      {
        path: '/provider/bookings',
        label: 'Booking',
        icon: Calendar,
      },
      {
        path: '/provider/promotions',
        label: 'Giảm giá',
        icon: Tag,
      }
    );
  } else {
    // For non-hotel providers, keep /provider route
    menuItems.push({
      path: '/provider',
      label: 'Tổng quan',
      icon: BarChart3,
      exact: true
    });
  }

  if (providerTypes.includes('tour') && !providerTypes.includes('hotel')) {
    menuItems.push({
      path: '/provider/promotions',
      label: 'Promotions',
      icon: Tag,
    });
  }

  const tourSubmenu = [
    {
      path: '/provider/tours',
      label: 'Dashboard',
      icon: BarChart3,
    },
    {
      path: '/provider/tours/create',
      label: 'Create Tour',
      icon: Compass,
    },
    {
      path: '/provider/tours/bookings',
      label: 'Tour Bookings',
      icon: Calendar,
    },
  ];

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <IconComponent className="nav-icon" size={20} strokeWidth={2} />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}

          {providerTypes.includes('tour') && (
            <div className="nav-item-wrapper">
              <button
                type="button"
                className={`nav-item-dropdown ${location.pathname.includes('/tour') ? 'active' : ''}`}
                onClick={() => setIsTourMenuOpen((prev) => !prev)}
              >
                <div className="nav-item-label">
                  <Compass className="nav-icon" size={20} strokeWidth={2} />
                  <span className="nav-label">Tour Management</span>
                </div>
                <span className={`dropdown-arrow ${isTourMenuOpen ? 'open' : ''}`} aria-hidden="true">
                  ▾
                </span>
              </button>

              <div className={`submenu ${isTourMenuOpen ? 'open' : ''}`}>
                {tourSubmenu.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}
                    >
                      <IconComponent className="nav-icon" size={18} strokeWidth={2} />
                      <span className="nav-label">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </aside>
      <main className="dashboard-main">
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

