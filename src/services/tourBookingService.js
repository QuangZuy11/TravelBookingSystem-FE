import axios from "axios";

const API_URL = "http://localhost:3000/api";

// Get token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

/**
 * Lấy thống kê tổng quan (4 Cards)
 * @param {Object} params - Query parameters { booking_date, start_date, end_date }
 * @returns {Promise} Statistics data
 */
export const getTourBookingStatistics = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Ưu tiên booking_date (filter theo ngày đặt tour cụ thể)
    if (params.booking_date) {
      queryParams.append("booking_date", params.booking_date);
    } else {
      // Nếu không có booking_date, dùng start_date và end_date
      if (params.start_date)
        queryParams.append("start_date", params.start_date);
      if (params.end_date) queryParams.append("end_date", params.end_date);
    }

    const queryString = queryParams.toString();
    const url = `${API_URL}/tour/bookings/stats/summary${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await axios.get(url, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching tour booking statistics:", error);
    throw error.response?.data || error;
  }
};

/**
 * Lấy danh sách bookings (Table with pagination)
 * @param {Object} params - Query parameters
 * @returns {Promise} Bookings list with pagination
 */
export const getTourBookings = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Pagination
    queryParams.append("page", params.page || 1);
    queryParams.append("limit", params.limit || 10);

    // Filters
    if (params.search) queryParams.append("search", params.search);
    if (params.booking_date)
      queryParams.append("booking_date", params.booking_date);
    if (params.payment_status)
      queryParams.append("payment_status", params.payment_status);
    if (params.booking_status)
      queryParams.append("booking_status", params.booking_status);
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);

    // Sorting
    if (params.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params.order) queryParams.append("order", params.order);

    const response = await axios.get(
      `${API_URL}/tour/bookings/provider/all?${queryParams.toString()}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching tour bookings:", error);
    throw error.response?.data || error;
  }
};

/**
 * Lấy chi tiết 1 booking (Modal)
 * @param {String} bookingId - Booking ID
 * @returns {Promise} Booking detail
 */
export const getTourBookingDetail = async (bookingId) => {
  try {
    const response = await axios.get(
      `${API_URL}/tour/bookings/${bookingId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching tour booking detail:", error);
    throw error.response?.data || error;
  }
};

/**
 * Helper: Format date to YYYY-MM-DD
 */
export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Helper: Format currency VND
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Helper: Get payment status label
 */
export const getPaymentStatusLabel = (status) => {
  const labels = {
    pending: "Chờ thanh toán",
    completed: "Đã thanh toán",
    failed: "Thất bại",
    refunded: "Đã hoàn tiền",
    partially_refunded: "Hoàn tiền một phần",
  };
  return labels[status] || status;
};

/**
 * Helper: Get booking status label
 */
export const getBookingStatusLabel = (status) => {
  const labels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    paid: "Đã thanh toán",
    in_progress: "Đang diễn ra",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    refunded: "Đã hoàn tiền",
    "no-show": "Không đến",
  };
  return labels[status] || status;
};

/**
 * Helper: Get payment status color
 */
export const getPaymentStatusColor = (status) => {
  const colors = {
    completed: { bg: "#d1fae5", color: "#065f46" },
    pending: { bg: "#fef3c7", color: "#92400e" },
    failed: { bg: "#fed7d7", color: "#991b1b" },
    refunded: { bg: "#e0e7ff", color: "#3730a3" },
    partially_refunded: { bg: "#e0e7ff", color: "#3730a3" },
  };
  return colors[status] || { bg: "#f3f4f6", color: "#6b7280" };
};

/**
 * Helper: Get booking status color
 */
export const getBookingStatusColor = (status) => {
  const colors = {
    confirmed: { bg: "#d1fae5", color: "#065f46" },
    paid: { bg: "#dbeafe", color: "#1e40af" },
    in_progress: { bg: "#fef3c7", color: "#92400e" },
    completed: { bg: "#d1fae5", color: "#065f46" },
    pending: { bg: "#f3f4f6", color: "#6b7280" },
    cancelled: { bg: "#fed7d7", color: "#991b1b" },
    refunded: { bg: "#e0e7ff", color: "#3730a3" },
    "no-show": { bg: "#fed7d7", color: "#991b1b" },
  };
  return colors[status] || { bg: "#f3f4f6", color: "#6b7280" };
};

export default {
  getTourBookingStatistics,
  getTourBookings,
  getTourBookingDetail,
  formatDate,
  formatCurrency,
  getPaymentStatusLabel,
  getBookingStatusLabel,
  getPaymentStatusColor,
  getBookingStatusColor,
};
