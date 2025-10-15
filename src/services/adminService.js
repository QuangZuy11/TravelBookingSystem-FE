import apiClient from '../config/apiClient';

const adminService = {
  // 1. Lấy danh sách Users (có filter, pagination)
  getAllUsers: (params) => {
    return apiClient.get('/admin/users', { params });
  },

  // 2. Lấy chi tiết một User
  getUserById: (userId) => {
    return apiClient.get(`/admin/users/${userId}`);
  },

  // 3. Tạo User mới
  createUser: (userData) => {
    return apiClient.post('/admin/users', userData);
  },

  // 4. Cập nhật User
  updateUser: (userId, userData) => {
    return apiClient.put(`/admin/users/${userId}`, userData);
  },

  // 5. Xóa User
  deleteUser: (userId) => {
    return apiClient.delete(`/admin/users/${userId}`);
  },

  // 6. Ban/Unban User
  banOrUnbanUser: (userId, action, reason = null) => {
    const payload = { action };
    if (reason) {
      payload.reason = reason;
    }
    return apiClient.put(`/admin/users/${userId}/ban`, payload);
  },

  // 7. Admin đổi mật khẩu cho User
  changeUserPassword: (userId, new_password) => {
    return apiClient.put(`/admin/users/${userId}/password`, { new_password });
  },
  
  // 8. Lấy thống kê Users
  getUserStats: () => {
    return apiClient.get('/admin/users/stats');
  },

  // API thống kê chung cho dashboard (từ bài trước)
  getDashboardStats: () => {
    return apiClient.get('/admin/dashboard/stats');
  }
};

export default adminService;