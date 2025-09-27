import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import hook để dùng context
import './AuthPage.css';

const AuthPage = () => {
  // State để chuyển đổi giữa form đăng nhập (false) và đăng ký (true)
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Lấy hàm login từ AuthContext

  // State để quản lý dữ liệu từ các ô input
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Traveler', // Giá trị mặc định cho dropdown
    password: '',
    confirmPassword: '',
  });

  // Cập nhật state mỗi khi người dùng nhập liệu
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Xử lý khi người dùng submit form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn trình duyệt tải lại trang

    const url = isRegister 
      ? 'http://localhost:3000/api/auth/register' 
      : 'http://localhost:3000/api/auth/login';

    // Chuẩn bị dữ liệu để gửi đi
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
    
    // Kiểm tra mật khẩu xác nhận
    if (isRegister && formData.password !== formData.confirmPassword) {
      return alert('Mật khẩu xác nhận không khớp!');
    }

    try {
      // Gửi request đến backend
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // Xử lý lỗi từ server
      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }

      // Nếu thành công, gọi hàm login từ context để cập nhật state toàn cục
      login(data.data);
      
      // Chuyển hướng về trang chủ
      navigate('/');

    } catch (error) {
      console.error('Lỗi xác thực:', error);
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
            className={`tab-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => setIsRegister(false)}
          >
            Đăng nhập
          </button>
          <button
            className={`tab-btn ${isRegister ? 'active' : ''}`}
            onClick={() => setIsRegister(true)}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="input-group">
              <label htmlFor="name">Họ và tên</label>
              <input type="text" id="name" name="name" placeholder="Nguyễn Văn A" value={formData.name} onChange={handleInputChange} required />
            </div>
          )}
          
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleInputChange} required />
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
            <input type="password" id="password" name="password" placeholder="Ít nhất 6 ký tự" value={formData.password} onChange={handleInputChange} required />
          </div>
          
          {isRegister && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Nhập lại mật khẩu" value={formData.confirmPassword} onChange={handleInputChange} required />
            </div>
          )}
          
          <button type="submit" className="submit-btn">
            {isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;