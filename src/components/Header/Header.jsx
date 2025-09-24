import React from "react";
import { FaUserCircle } from "react-icons/fa";
import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      {/* Logo */}
      <div className="header-logo">
        <img
          src="/logo.png" // bạn nhớ thêm đường dẫn logo
          alt="VietTravel Logo"
          className="logo-img"
        />
        <span className="logo-text">VietTravel</span>
      </div>

      {/* Navigation */}
      <nav className="header-nav">
        <a href="/">Trang Chủ</a>
        <a href="/tour">Tour Du Lịch</a>
        <a href="/hotel">Khách Sạn</a>
        <a href="/about">Về Chúng Tôi</a>
        <a href="/contact">Liên Hệ</a>
      </nav>

      {/* Login */}
      <div className="header-login">
        <FaUserCircle className="login-icon" />
        <span>Đăng Nhập</span>
      </div>
    </header>
  );
};

export default Header;
