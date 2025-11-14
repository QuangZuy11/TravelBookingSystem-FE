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
  const [provider, setProvider] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Kiểm tra trạng thái đăng nhập khi component được tải
  useEffect(() => {
    const checkLoginStatus = () => {
      const userData = localStorage.getItem("user");
      const providerData = localStorage.getItem("provider");

      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error("Lỗi khi đọc dữ liệu người dùng:", error);
          localStorage.removeItem("user");
        }
      }

      if (providerData) {
        try {
          setProvider(JSON.parse(providerData));
        } catch (error) {
          console.error("Lỗi khi đọc dữ liệu provider:", error);
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

  // Fetch notifications from API
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;

    try {
      setLoadingNotifications(true);
      const response = await fetch(
        "http://localhost:3000/api/traveler/notifications?limit=10",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('📬 Notifications fetched:', {
            count: data.data.notifications?.length || 0,
            unreadCount: data.data.unreadCount || 0
          });
          setNotifications(data.data.notifications || []);
          setUnreadCount(data.data.unreadCount || 0);
        } else {
          console.error('❌ Failed to fetch notifications:', data.message);
        }
      } else {
        console.error('❌ Failed to fetch notifications:', response.status, response.statusText);
        if (response.status === 401) {
          console.error('   User not authenticated');
        }
      }
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;

    try {
      const response = await fetch(
        "http://localhost:3000/api/traveler/notifications/unread-count",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.data.unreadCount || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      // Listen for notification refresh event
      const handleNotificationRefresh = () => {
        console.log('🔄 Refreshing notifications...');
        fetchNotifications();
        fetchUnreadCount();
      };

      window.addEventListener('notificationRefresh', handleNotificationRefresh);

      return () => {
        clearInterval(interval);
        window.removeEventListener('notificationRefresh', handleNotificationRefresh);
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/traveler/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? { ...notif, isRead: true, status: "read" }
              : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

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
    if (!showNotifications && user) {
      // Fetch latest notifications when opening dropdown
      fetchNotifications();
    }
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
        // Tour provider - vào tổng quan
        navigate('/provider/tours');
      } else if (serviceTypes.includes('hotel')) {
        // Hotel provider - vào tổng quan của hotel đầu tiên
        // Fetch hotel ID và redirect
        fetchFirstHotelAndRedirect();
      } else {
        // Fallback
        navigate('/provider/tours');
      }
    }
  };

  // Hàm lấy hotel đầu tiên của provider và redirect vào overview
  const fetchFirstHotelAndRedirect = async () => {
    try {
      const token = localStorage.getItem('token');
      const providerStr = localStorage.getItem('provider');
      const provider = providerStr ? JSON.parse(providerStr) : null;

      if (!provider || !provider._id) {
        navigate('/provider/hotels');
        return;
      }

      const response = await fetch(`/api/hotel/provider/${provider._id}/hotels`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        // Có hotel -> redirect vào overview của hotel đầu tiên
        const firstHotelId = data.data[0]._id;
        navigate(`/provider/hotels/${firstHotelId}/overview`);
      } else {
        // Chưa có hotel -> vào danh sách hotels
        navigate('/provider/hotels');
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      navigate('/provider/hotels');
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
                  {user.role !== "ServiceProvider" && (
                    <>
                      <a href="/my-tours" className="dropdown-item">
                        <FaSuitcase className="dropdown-icon" />
                        <span>Tour Đã Đặt</span>
                      </a>
                      <a href="/my-booked-hotels" className="dropdown-item">
                        <FaSuitcase className="dropdown-icon" />
                        <span>Khách sạn đã đặt</span>
                      </a>
                      <a href="/my-itineraries" className="dropdown-item">
                        <FaSuitcase className="dropdown-icon" />
                        <span>Lộ Trình Của Tôi</span>
                      </a>
                      <a href="/my-booking-itineraries" className="dropdown-item">
                        <FaSuitcase className="dropdown-icon" />
                        <span>Lộ Trình Đặt Chỗ Của Tôi</span>
                      </a>
                    </>
                  )}
                  {user.role === "ServiceProvider" && (
                    <>
                      <a
                        href="#"
                        onClick={handleServiceManagement}
                        className="dropdown-item"
                      >
                        Quản lý dịch vụ
                      </a>
                      {/* Only show AI Bookings for tour providers */}
                      {provider && (Array.isArray(provider.type) ? provider.type.includes('tour') : provider.type === 'tour') && (
                        <a href="/provider/ai-bookings" className="dropdown-item">
                          <FaSuitcase className="dropdown-icon" />
                          <span>Quản lý AI Bookings</span>
                        </a>
                      )}
                    </>
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
                    {loadingNotifications ? (
                      <div style={{ padding: "20px", textAlign: "center" }}>
                        Đang tải...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                        Chưa có thông báo nào
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`notification-item ${notif.isRead ? "read" : "unread"
                            }`}
                          onClick={() => {
                            if (!notif.isRead) {
                              handleMarkAsRead(notif.id);
                            }
                          }}
                          style={{ cursor: "pointer" }}
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
                      ))
                    )}
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
