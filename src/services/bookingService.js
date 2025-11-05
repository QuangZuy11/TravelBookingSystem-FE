import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Get token from localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

/**
 * Lấy thống kê tổng quan (4 Cards)
 * @param {Object} params - Query parameters { start_date, end_date, hotel_id }
 * @returns {Promise} Statistics data
 */
export const getBookingStatistics = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
        if (params.hotel_id) queryParams.append('hotel_id', params.hotel_id);

        const queryString = queryParams.toString();
        const url = `${API_URL}/provider/hotel-bookings/statistics${queryString ? `?${queryString}` : ''}`;

        const response = await axios.get(url, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error fetching booking statistics:', error);
        throw error.response?.data || error;
    }
};

/**
 * Lấy thống kê doanh thu theo ngày (Daily Revenue Chart)
 * @param {Object} params - { year, month, start_date, end_date }
 * @returns {Promise} Daily statistics array
 */
export const getDailyStatistics = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (params.year) queryParams.append('year', params.year);
        if (params.month) queryParams.append('month', params.month);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const queryString = queryParams.toString();
        const url = `${API_URL}/provider/hotel-bookings/statistics/daily${queryString ? `?${queryString}` : ''}`;

        const response = await axios.get(url, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error fetching daily statistics:', error);
        throw error.response?.data || error;
    }
};

/**
 * Lấy thống kê doanh thu theo tháng (Monthly Revenue Chart)
 * @param {Object} params - { year, start_date, end_date }
 * @returns {Promise} Monthly statistics array
 */
export const getMonthlyStatistics = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (params.year) queryParams.append('year', params.year);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const queryString = queryParams.toString();
        const url = `${API_URL}/provider/hotel-bookings/statistics/monthly${queryString ? `?${queryString}` : ''}`;

        const response = await axios.get(url, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error fetching monthly statistics:', error);
        throw error.response?.data || error;
    }
};

/**
 * Lấy thống kê doanh thu theo năm (Yearly Revenue Chart)
 * @param {Object} params - { start_year, end_year }
 * @returns {Promise} Yearly statistics array
 */
export const getYearlyStatistics = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (params.start_year) queryParams.append('start_year', params.start_year);
        if (params.end_year) queryParams.append('end_year', params.end_year);

        const queryString = queryParams.toString();
        const url = `${API_URL}/provider/hotel-bookings/statistics/yearly${queryString ? `?${queryString}` : ''}`;

        const response = await axios.get(url, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error fetching yearly statistics:', error);
        throw error.response?.data || error;
    }
};

/**
 * Lấy danh sách bookings (Table with pagination)
 * @param {Object} params - Query parameters
 * @returns {Promise} Bookings list with pagination
 */
export const getBookings = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        // Pagination
        queryParams.append('page', params.page || 1);
        queryParams.append('limit', params.limit || 10);

        // Filters
        if (params.search) queryParams.append('search', params.search);
        if (params.booking_date) queryParams.append('booking_date', params.booking_date);
        if (params.payment_status) queryParams.append('payment_status', params.payment_status);
        if (params.booking_status) queryParams.append('booking_status', params.booking_status);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        // Sorting
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.order) queryParams.append('order', params.order);

        const response = await axios.get(
            `${API_URL}/provider/hotel-bookings?${queryParams.toString()}`,
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error.response?.data || error;
    }
};

/**
 * Lấy chi tiết 1 booking (Modal)
 * @param {String} bookingId - Booking ID
 * @returns {Promise} Booking detail
 */
export const getBookingDetail = async (bookingId) => {
    try {
        const response = await axios.get(
            `${API_URL}/provider/hotel-bookings/${bookingId}`,
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching booking detail:', error);
        throw error.response?.data || error;
    }
};

/**
 * Helper: Format date to YYYY-MM-DD
 */
export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Helper: Format currency VND
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

/**
 * Helper: Get payment status label
 */
export const getPaymentStatusLabel = (status) => {
    const labels = {
        'pending': 'Chờ thanh toán',
        'paid': 'Đã thanh toán',
        'failed': 'Thất bại',
        'refunded': 'Đã hoàn tiền'
    };
    return labels[status] || status;
};

/**
 * Helper: Get booking status label
 */
export const getBookingStatusLabel = (status) => {
    const labels = {
        'reserved': 'Đã đặt',
        'confirmed': 'Đã xác nhận',
        'cancelled': 'Đã hủy',
        'completed': 'Hoàn thành'
    };
    return labels[status] || status;
};

/**
 * Helper: Get payment status color
 */
export const getPaymentStatusColor = (status) => {
    const colors = {
        'paid': { bg: '#d1fae5', color: '#065f46' },
        'pending': { bg: '#fef3c7', color: '#92400e' },
        'failed': { bg: '#fed7d7', color: '#991b1b' },
        'refunded': { bg: '#e0e7ff', color: '#3730a3' }
    };
    return colors[status] || { bg: '#f3f4f6', color: '#6b7280' };
};

/**
 * Helper: Get booking status color
 */
export const getBookingStatusColor = (status) => {
    const colors = {
        'confirmed': { bg: '#d1fae5', color: '#065f46' },
        'reserved': { bg: '#e0e7ff', color: '#3730a3' },
        'cancelled': { bg: '#fed7d7', color: '#991b1b' },
        'completed': { bg: '#d1fae5', color: '#065f46' }
    };
    return colors[status] || { bg: '#f3f4f6', color: '#6b7280' };
};

export default {
    getBookingStatistics,
    getBookings,
    getBookingDetail,
    formatDate,
    formatCurrency,
    getPaymentStatusLabel,
    getBookingStatusLabel,
    getPaymentStatusColor,
    getBookingStatusColor
};
