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
  const [hotelId, setHotelId] = useState(null);

  useEffect(() => {
    const providerStr = localStorage.getItem("provider");
    if (!providerStr) return;

    try {
      const provider = JSON.parse(providerStr);
      if (provider?.licenses && Array.isArray(provider.licenses)) {
        const types = [...new Set(provider.licenses.map((item) => item.service_type))];
        setProviderTypes(types);

        // Fetch hotel ID if provider has hotel service
        if (types.includes('hotel')) {
          fetchHotelId(provider._id);
        }
      } else if (Array.isArray(provider?.type)) {
        setProviderTypes(provider.type);

        if (provider.type.includes('hotel')) {
          fetchHotelId(provider._id);
        }
      }
    } catch (error) {
      console.error("Error parsing provider types from localStorage:", error);
    }
  }, []);

  const fetchHotelId = async (providerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hotel/provider/${providerId}/hotels`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Hotel API response:', data); // Debug log

        // Try different response formats
        if (data.hotels && data.hotels.length > 0) {
          setHotelId(data.hotels[0]._id);
        } else if (data.data && data.data.length > 0) {
          setHotelId(data.data[0]._id);
        } else if (Array.isArray(data) && data.length > 0) {
          setHotelId(data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching hotel:', error);
    }
  };

  useEffect(() => {
    if (location.pathname.includes("/tour")) {
      setIsTourMenuOpen(true);
    }

    // Extract hotelId from URL if available
    const hotelIdMatch = location.pathname.match(/\/hotels\/([^\/]+)/);
    if (hotelIdMatch && hotelIdMatch[1] && hotelIdMatch[1] !== 'manage' && hotelIdMatch[1] !== 'new') {
      setHotelId(hotelIdMatch[1]);
    }
  }, [location.pathname]);

  const menuItems = [];

  if (providerTypes.includes('hotel')) {
    // If hotelId is available, use hotel-specific routes
    if (hotelId) {
      menuItems.push({
        path: `/provider/hotels/${hotelId}/overview`,
        label: 'Tổng quan',
        icon: BarChart3,
        exact: true
      });

      menuItems.push(
        {
          path: `/provider/hotels/${hotelId}/info`,
          label: 'Khách sạn',
          icon: Building2,
        },
        {
          path: `/provider/hotels/${hotelId}/rooms`,
          label: 'Phòng',
          icon: Bed,
        },
        {
          path: `/provider/hotels/${hotelId}/location`,
          label: 'Vị trí',
          icon: MapPin,
        },
        {
          path: `/provider/hotels/${hotelId}/policies`,
          label: 'Chính Sách',
          icon: FileText,
        },
        {
          path: `/provider/hotels/${hotelId}/contact`,
          label: 'Liên Hệ',
          icon: Phone,
        },
        {
          path: `/provider/hotels/${hotelId}/amenities`,
          label: 'Tiện ích',
          icon: Sparkles,
        },
        {
          path: `/provider/hotels/${hotelId}/gallery`,
          label: 'Hình ảnh',
          icon: Image,
        },
        {
          path: `/provider/bookings`,
          label: 'Booking',
          icon: Calendar,
        },
        {
          path: `/provider/promotions`,
          label: 'Giảm giá',
          icon: Tag,
        }
      );
    } else {
      // Fallback to hotel list if no hotelId yet
      menuItems.push({
        path: '/provider/hotels',
        label: 'Tổng quan',
        icon: BarChart3,
        exact: true
      });
    }
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
    menuItems.push({
      path: "/provider/tour-ads",
      label: "Tour Ads",
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

          {providerTypes.includes("tour") && (
            <div className="nav-item-wrapper">
              <button
                type="button"
                className={`nav-item-dropdown ${location.pathname.includes("/tour") ? "active" : ""}`}
                onClick={() => setIsTourMenuOpen((prev) => !prev)}
              >
                <div className="nav-item-label">
                  <Compass className="nav-icon" size={20} strokeWidth={2} />
                  <span className="nav-label">Tour Management</span>
                </div>
                <span className={`dropdown-arrow ${isTourMenuOpen ? "open" : ""}`} aria-hidden="true">
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
