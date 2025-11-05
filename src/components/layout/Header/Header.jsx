import { useState, useRef, useEffect } from "react";
import {
  FaUserCircle,
  FaUser,
  FaSignOutAlt,
  FaSuitcase,
  FaChevronDown,
  FaUsers,
  FaBell,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./Header.css";
import Logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { clearAuthData } from "../../../utils/authHelpers";

const Header = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  // Mock notifications data (hardcoded)
  const [notifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Booking Confirmed",
      message: "Your hotel booking #HB-001 has been confirmed",
      time: "5 phút trước",
      isRead: false,
    },
    {
      id: 2,
      type: "info",
      title: "New Promotion",
      message: "Summer sale 30% off - Book now!",
      time: "1 giờ trước",
      isRead: false,
    },
    {
      id: 3,
      type: "warning",
      title: "Payment Reminder",
      message: "Complete payment for tour #T-2025-001",
      time: "3 giờ trước",
      isRead: true,
    },
    {
      id: 4,
      type: "success",
      title: "Review Request",
      message: "Share your experience at Hanoi Hotel",
      time: "1 ngày trước",
      isRead: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Kiểm tra trạng thái đăng nhập khi component được tải
  useEffect(() => {
    const checkLoginStatus = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error("Lỗi khi đọc dữ liệu người dùng:", error);
          localStorage.removeItem("user");
        }
      }
    };

    checkLoginStatus();
    // Lắng nghe sự kiện storage để cập nhật khi có thay đổi từ tab khác
    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  // Đóng dropdown khi click ra bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    // Clear all auth data using centralized helper
    clearAuthData();
    setUser(null);
    setShowDropdown(false);
    window.location.href = "/"; // Chuyển hướng về trang chủ
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="notification-type-icon success" />;
      case "info":
        return <FaInfoCircle className="notification-type-icon info" />;
      case "warning":
        return <FaExclamationTriangle className="notification-type-icon warning" />;
      default:
        return <FaInfoCircle className="notification-type-icon info" />;
    }
  };

  // Hàm xử lý click vào "Quản lý dịch vụ"
  const handleServiceManagement = (e) => {
    e.preventDefault();
    setShowDropdown(false);

    // Check provider registration status
    const providerStr = localStorage.getItem("provider");
    let provider = null;

    try {
      provider = providerStr ? JSON.parse(providerStr) : null;
    } catch (error) {
      console.error("Error parsing provider:", error);
    }

    // Simplified check: If has provider._id and licenses, allow access
    const hasProvider = !!provider && !!provider._id;
    const hasLicenses =
      provider &&
      Array.isArray(provider.licenses) &&
      provider.licenses.length > 0;

    if (!hasProvider || !hasLicenses) {
      console.log("Provider chưa đăng ký, redirect to registration");
      navigate("/register/service-provider");
    } else {
      // Provider đã đăng ký đầy đủ -> cho vào dashboard
      console.log("Provider đã đăng ký:", {
        provider_id: provider._id,
        licenses_count: provider.licenses.length,
        service_types: provider.licenses.map((l) => l.service_type),
      });

      // Route directly to specific service dashboard based on provider type
      const serviceTypes = provider.licenses.map(l => l.service_type);

      if (serviceTypes.includes('tour')) {
        // Tour provider
        navigate('/provider/tours');
      } else if (serviceTypes.includes('hotel')) {
        // Hotel provider  
        navigate('/provider/hotels');
      } else {
        // Fallback
        navigate('/provider/tours');
      }
    }
  };

  return (
    <header className="header ">
      <div className="header-logo">
        <img src={Logo} alt="VietTravel Logo" className="logo-img" />
        <span className="logo-text">VietTravel</span>
      </div>

      <nav className="header-nav">
        <a href="/">Trang Chủ</a>
        <a href="/tour">Tour Du Lịch</a>
        <a href="/hotel-list">Khách Sạn</a>
        <a href="/terms-of-service">Điều khoản</a>
        <a href="/contact">Liên Hệ</a>
      </nav>

      <div className="header-auth">
        {!user ? (
          // Khi chưa đăng nhập
          <Link to="/auth" className="header-login">
            <FaUserCircle className="login-icon" />
            <span>Đăng Nhập</span>
          </Link>
        ) : (
          // Khi đã đăng nhập
          <>
            {/* User Dropdown */}
            <div className="header-user" ref={dropdownRef}>
              <div className="user-info" onClick={toggleDropdown}>
                <FaUserCircle className="user-avatar" />
                <span className="user-name">
                  {user.name || user.username || user.email}
                </span>
                <FaChevronDown
                  className={`dropdown-arrow ${showDropdown ? "rotate" : ""}`}
                />
              </div>

              {showDropdown && (
                <div className="user-dropdown">
                  <a href="/profile" className="dropdown-item">
                    <FaUser className="dropdown-icon" />
                    <span>Hồ Sơ Của Tôi</span>
                  </a>
                  <a href="/my-tours" className="dropdown-item">
                    <FaSuitcase className="dropdown-icon" />
                    <span>Tour Đã Đặt</span>
                  </a>
                  <a href="/my-itineraries" className="dropdown-item">
                    <FaSuitcase className="dropdown-icon" />
                    <span>My Itineraries</span>
                  </a>
                  {user.role === "ServiceProvider" && (
                    <a
                      href="#"
                      onClick={handleServiceManagement}
                      className="dropdown-item"
                    >
                      Quản lý dịch vụ
                    </a>
                  )}
                  {user && user.role === "Admin" && (
                    <Link to="/admin/dashboard" className="dropdown-item">
                      <FaUsers className="dropdown-icon" />
                      <span>Quản lý người dùng</span>
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <FaSignOutAlt className="dropdown-icon" />
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell - After User Profile */}
            <div className="notification-wrapper" ref={notificationRef}>
              <div
                className="notification-bell"
                onClick={toggleNotifications}
              >
                <FaBell className="bell-icon" />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </div>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Thông báo</h3>
                    <span className="notification-count">
                      {unreadCount} mới
                    </span>
                  </div>

                  <div className="notification-list">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notification-item ${notif.isRead ? "read" : "unread"
                          }`}
                      >
                        <div className="notification-icon">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="notification-content">
                          <h4 className="notification-title">{notif.title}</h4>
                          <p className="notification-message">
                            {notif.message}
                          </p>
                          <span className="notification-time">
                            {notif.time}
                          </span>
                        </div>
                        {!notif.isRead && (
                          <div className="unread-dot"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="notification-footer">
                    <a href="/notifications" className="view-all-link">
                      Xem tất cả thông báo
                    </a>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
