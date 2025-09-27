import React, { createContext, useState, useContext, useEffect } from 'react';

// Không cần jwt-decode nữa!

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Khi app tải, đọc thông tin user đã lưu trong localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // Chuyển chuỗi JSON thành object và cập nhật state
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Hàm login giờ sẽ nhận thẳng fullName từ API
  const login = (data) => {
    // 1. Tạo object user mới
    const userToSet = {
      name: data.fullName // Lấy thẳng fullName từ data API trả về
    };
    // 2. Lưu token và user object vào localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('fullName', userToSet.name);
    
    // 3. Cập nhật state để UI thay đổi ngay lập tức
    setUser(userToSet);
  };

  const logout = () => {
    // Xóa cả token và thông tin user
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    setUser(null);
    navigate('/'); 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};