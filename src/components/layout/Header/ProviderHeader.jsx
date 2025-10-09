import React, { useState } from 'react';
import { FaUserCircle } from "react-icons/fa";
import styles from "./ProviderHeader.module.css";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { useAuth } from '../../../contexts/AuthContext';

const ProviderHeader = () => {
  const { user, logout } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDropdownVisible(false);
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLogo}>
        <img src={Logo} alt="VietTravel Logo" />
        <span>VietTravel</span>
      </div>

      <nav className={styles.headerNav}>
        <a href="/">Trang Chủ</a>
        <a href="/tour">Tour Du Lịch</a>
        <a href="/hotel-page">Khách Sạn</a>
        <a href="/about">Về Chúng Tôi</a>
        <a href="/contact">Liên Hệ</a>
      </nav>

      <div className={styles.headerAuth}>
        {user ? (
          <div className={styles.headerUserInfo} onClick={() => setDropdownVisible(!dropdownVisible)}>
            <FaUserCircle className={styles.loginIcon} />
            <span>{user.name}</span>
            {dropdownVisible && (
              <div className={styles.dropdownMenu}>
                <Link to="/profile" className={styles.dropdownItem}>Profile</Link>
                {user.role === 'ServiceProvider' && (
                  <Link to="/provider/hotels" className={styles.dropdownItem}>Quản lý dịch vụ</Link>
                )}
                <button onClick={handleLogout} className={styles.dropdownItem}>Đăng xuất</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth" className={styles.headerLoginLink}>
            <div className={styles.headerLogin}>
              <FaUserCircle className={styles.loginIcon} />
              <span>Đăng Nhập</span>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
};

export default ProviderHeader;