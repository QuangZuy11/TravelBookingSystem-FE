import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const location = useLocation();
  const [isTourMenuOpen, setIsTourMenuOpen] = useState(false);
  const [providerTypes, setProviderTypes] = useState([]);

  useEffect(() => {
    const providerStr = localStorage.getItem("provider");
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
      console.error("Error parsing provider types from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    if (location.pathname.includes("/tour")) {
      setIsTourMenuOpen(true);
    }
  }, [location.pathname]);

  const menuItems = [];

  if (providerTypes.includes("hotel")) {
    menuItems.push(
      {
        path: "/provider/hotels",
        label: "Hotels",
        icon: "🏨",
      },
      {
        path: "/provider/hotel-ads",
        label: "Hotel Ads",
        icon: "📣",
      }
    );
  }

  if (providerTypes.includes("tour")) {
    menuItems.push({
      path: "/provider/tour-ads",
      label: "Tour Ads",
      icon: "🪧",
    });
  }

  if (providerTypes.includes("hotel") || providerTypes.includes("tour")) {
    menuItems.push({
      path: "/provider/promotions",
      label: "Promotions",
      icon: "🏷️",
    });
  }

  const tourSubmenu = [
    {
      path: "/provider/tours",
      label: "Dashboard",
      icon: "📊",
    },
    {
      path: "/provider/tours/create",
      label: "Create Tour",
      icon: "➕",
    },
    {
      path: "/provider/tours/bookings",
      label: "Tour Bookings",
      icon: "🧾",
    },
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
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}

          {providerTypes.includes("tour") && (
            <div className="nav-item-wrapper">
              <button
                type="button"
                className={`nav-item-dropdown ${location.pathname.includes("/tour") ? "active" : ""}`}
                onClick={() => setIsTourMenuOpen((prev) => !prev)}
              >
                <div className="nav-item-label">
                  <span className="nav-icon" aria-hidden="true">
                    🧭
                  </span>
                  <span className="nav-label">Tour Management</span>
                </div>
                <span className={`dropdown-arrow ${isTourMenuOpen ? "open" : ""}`} aria-hidden="true">
                  ▾
                </span>
              </button>

              <div className={`submenu ${isTourMenuOpen ? "open" : ""}`}>
                {tourSubmenu.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `submenu-item ${isActive ? "active" : ""}`}
                  >
                    <span className="nav-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Service Management</h1>
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
