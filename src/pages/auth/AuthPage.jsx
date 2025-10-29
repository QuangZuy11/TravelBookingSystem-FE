import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../config/apiClient";
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

    const endpoint = isRegister ? "/auth/register" : "/auth/login";

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
      const { data } = await apiClient.post(endpoint, body);

      if (!data?.success && !data?.data) {
        throw new Error(data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
      }

      // Lưu provider info nếu có
      if (data.data.role_id === 2) {
        if (data.data.provider && data.data.provider._id) {
          localStorage.setItem("providerId", data.data.provider._id);
        } else {
          localStorage.setItem("providerId", data.data.id);
        }
        if (data.data.provider) {
          localStorage.setItem("provider", JSON.stringify(data.data.provider));
        }
      }

      const roleId = login(data.data);

      if (roleId === 2) {
        const provider = data.data.provider;
        const hasProvider = !!provider && !!provider._id;
        const hasLicenses =
          provider && Array.isArray(provider.licenses) && provider.licenses.length > 0;

        if (!hasProvider || !hasLicenses) {
          navigate("/register/service-provider");
        } else if (!provider.admin_verified) {
          alert("⏳ Tài khoản của bạn đang chờ xác minh từ Admin.");
          navigate("/");
        } else {
          navigate("/provider");
        }
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      alert(error?.response?.data?.message || error.message || "Đăng nhập thất bại");
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
            {!isRegister && (
              <div className="auth-inline-actions">
                <Link to="/forgot-password" className="auth-link">Quên mật khẩu?</Link>
              </div>
            )}
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
