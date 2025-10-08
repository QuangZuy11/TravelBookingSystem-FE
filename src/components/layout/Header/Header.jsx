import { useState, useRef, useEffect } from "react";
import {
  FaUserCircle,
  FaUser,
  FaSignOutAlt,
  FaSuitcase,
  FaChevronDown,
} from "react-icons/fa";
import "./Header.css"; // Nhớ import file CSS
import Logo from "../../assets/logo.png"; // Đường dẫn tới logo của bạn
import { Link } from "react-router-dom";

const Header = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setShowDropdown(false);
    window.location.href = "/"; // Chuyển hướng về trang chủ
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="header">
      <div className="header-logo">
        <img src={Logo} alt="VietTravel Logo" className="logo-img" />
        <span className="logo-text">VietTravel</span>
      </div>

      <nav className="header-nav">
        <a href="/">Trang Chủ</a>
        <a href="/tour">Tour Du Lịch</a>
        <a href="/hotel-list">Khách Sạn</a>
        <a href="/about">Về Chúng Tôi</a>
        <a href="/contact">Liên Hệ</a>
      </nav>

      <div className="header-auth" ref={dropdownRef}>
        {!user ? (
          // Khi chưa đăng nhập
          <Link to="/auth" className="header-login">
            <FaUserCircle className="login-icon" />
            <span>Đăng Nhập</span>
          </Link>
        ) : (
          // Khi đã đăng nhập
          <div className="header-user">
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
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout">
                  <FaSignOutAlt className="dropdown-icon" />
                  <span>Đăng Xuất</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
