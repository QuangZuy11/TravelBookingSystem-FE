import axios from 'axios';
import toast from 'react-hot-toast';
import { clearAuthData } from '../utils/authHelpers';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Return data directly if available
    return response.data || response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear all auth data and redirect to login
          clearAuthData();
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          window.location.href = '/auth';
          break;
        
        case 403:
          toast.error('Bạn không có quyền truy cập tài nguyên này.');
          break;
        
        case 404:
          toast.error('Không tìm thấy tài nguyên yêu cầu.');
          break;
        
        case 422:
          // Validation error
          toast.error(data?.message || 'Dữ liệu không hợp lệ.');
          break;
        
        case 500:
          toast.error('Lỗi máy chủ. Vui lòng thử lại sau.');
          break;
        
        default:
          toast.error(data?.message || 'Đã có lỗi xảy ra.');
      }
    } else if (error.request) {
      // Request made but no response
      toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } else {
      // Something else happened
      toast.error('Đã có lỗi xảy ra: ' + error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
