import React, { useState } from 'react';
import { FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import Logo from "../../assets/logo.png";
import { useAuth } from '../../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDropdownVisible(false);
    navigate('/');
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
        <a href="/hotel-page">Khách Sạn</a>
        <a href="/about">Về Chúng Tôi</a>
        <a href="/contact">Liên Hệ</a>
      </nav>
      <div className="header-auth">
        {user ? (
          <div className="header-user-info" onClick={() => setDropdownVisible(!dropdownVisible)}>
            <FaUserCircle className="login-icon" />
            <span>{user.name}</span>
            {dropdownVisible && (
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item">Profile</Link>
                <button onClick={handleLogout} className="dropdown-item">Đăng xuất</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth" className="header-login-link">
            <div className="header-login">
              <FaUserCircle className="login-icon" />
              <span>Đăng Nhập</span>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;