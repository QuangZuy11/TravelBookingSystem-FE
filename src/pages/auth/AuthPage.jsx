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

      // Lưu provider_id và provider object vào localStorage nếu user có role_id = 2
      if (data.data.role_id === 2) {
        // ✅ FIX: Lưu provider._id thay vì user.id
        if (data.data.provider && data.data.provider._id) {
          localStorage.setItem('providerId', data.data.provider._id);
          console.log('✅ Saved providerId from provider object:', data.data.provider._id);
        } else {
          // Fallback: nếu chưa có provider object, lưu user.id tạm
          localStorage.setItem('providerId', data.data.id);
          console.warn('⚠️ Provider object not found, using user.id as fallback');
        }

        // Lưu toàn bộ provider object
        if (data.data.provider) {
          localStorage.setItem('provider', JSON.stringify(data.data.provider));
        }
      }

      // Login và lấy role_id được trả về
      const roleId = login(data.data);

      // Điều hướng người dùng dựa vào role
      if (roleId === 2) {
        // Check nếu có provider object và đã đăng ký đầy đủ
        const provider = data.data.provider;

        // Nếu provider là null hoặc chưa có type/licenses -> chưa đăng ký
        if (!provider ||
          !provider.type ||
          !Array.isArray(provider.type) ||
          provider.type.length === 0 ||
          !provider.licenses ||
          !Array.isArray(provider.licenses) ||
          provider.licenses.length === 0) {
          // Chưa đăng ký provider với hệ thống -> redirect đến trang đăng ký
          console.log("Provider chưa đăng ký đầy đủ, redirect to registration");
          navigate("/register/service-provider");
        } else if (!provider.admin_verified) {
          // Đã đăng ký nhưng chưa được admin verify
          alert("⏳ Tài khoản của bạn đang chờ xác minh từ Admin. Vui lòng đợi email thông báo từ hệ thống.");
          console.log("Provider chưa được admin verify");
          navigate("/");
        } else {
          // Đã đăng ký đầy đủ và đã verify -> vào provider route (sẽ auto-redirect theo type)
          console.log("Provider đã được verify, redirect to provider route");
          navigate("/provider");
        }
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
