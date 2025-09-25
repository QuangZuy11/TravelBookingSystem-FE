import React from "react";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import "../Topbar/Topbar.css";

const TopBar = () => {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <FaPhoneAlt className="icon" />
        <span className="me-4">Hotline: 1900-1234</span>
      </div>
      <div className="topbar-center">
        <FaEnvelope className="icon" />
        <span>info@viettravel.com</span>
      </div>

      <div className="topbar-right">Hỗ trợ 24/7 - Đặt tour nhanh chóng</div>
    </div>
  );
};

export default TopBar;
