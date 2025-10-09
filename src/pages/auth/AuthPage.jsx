import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./AuthPage.css";

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Traveler",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isRegister
      ? "http://localhost:3000/api/auth/register"
      : "http://localhost:3000/api/auth/login";

    const body = isRegister
      ? {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role_name: formData.role,
        }
      : {
          email: formData.email,
          password: formData.password,
        };

    if (isRegister && formData.password !== formData.confirmPassword) {
      return alert("Mật khẩu xác nhận không khớp!");
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Có lỗi xảy ra, vui lòng thử lại.");
      }

      // Lưu provider_id vào localStorage nếu user có role_id = 2
      if (data.data.role_id === 2) {
        localStorage.setItem('providerId', data.data.id);
      }

      // Login và lấy role_id được trả về
      const roleId = login(data.data);

      // Điều hướng người dùng dựa vào role
      if (roleId === 2) {
        navigate("/provider/hotels");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-box">
        <div className="auth-header">
          <h1 className="auth-logo-text">VietTravel</h1>
          <p>Khám phá Việt Nam cùng chúng tôi</p>
        </div>
        <h2>Chào mừng trở lại</h2>
        <p className="auth-subtitle">Đăng nhập hoặc tạo tài khoản mới</p>

        <div className="auth-tabs">
          <button
            className={`tab-btn ${!isRegister ? "active" : ""}`}
            onClick={() => setIsRegister(false)}
          >
            Đăng nhập
          </button>
          <button
            className={`tab-btn ${isRegister ? "active" : ""}`}
            onClick={() => setIsRegister(true)}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="input-group">
              <label htmlFor="name">Họ và tên</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          {isRegister && (
            <div className="input-group">
              <label htmlFor="role">Loại tài khoản</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="Traveler">Du khách</option>
                <option value="ServiceProvider">Nhà cung cấp dịch vụ</option>
              </select>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Ít nhất 6 ký tự"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {isRegister && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <button type="submit" className="submit-btn">
            {isRegister ? "Đăng ký tài khoản" : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
