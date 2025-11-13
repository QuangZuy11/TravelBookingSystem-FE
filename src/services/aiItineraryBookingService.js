/**
 * AI ITINERARY BOOKING SERVICE
 * Xử lý booking cho AI-generated itineraries
 * 
 * 🎯 Flow:
 * 1. Traveler tạo booking request từ AI itinerary
 * 2. Provider nhận và xử lý booking request
 * 3. Admin monitor và quản lý toàn bộ bookings
 * 
 * 📊 Booking Status Flow:
 * pending → approved/rejected (by provider)
 * approved → confirmed (payment completed)
 * confirmed → completed (trip finished)
 */

import apiClient from '../config/apiClient';

const AI_ITINERARY_BOOKING_BASE = '/ai-itinerary-bookings';

// Get token from localStorage
const getAuthToken = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('Authentication required. Please login first.');
    }
    return token;
};

// ========================================
// 👤 TRAVELER APIs
// ========================================

/**
 * 1. Tạo booking request từ AI itinerary
 * POST /api/ai-itinerary-bookings/create
 * 
 * @param {Object} bookingData
 * @param {string} bookingData.ai_itinerary_id - ID của AI itinerary
 * @param {string} bookingData.user_id - ID của traveler
 * @param {string} bookingData.destination - Điểm đến
 * @param {number} bookingData.duration_days - Số ngày
 * @param {number} bookingData.participant_number - Số người tham gia
 * @param {Date} bookingData.start_date - Ngày bắt đầu mong muốn
 * @param {number} bookingData.total_budget - Tổng ngân sách
 * @param {Array} bookingData.selected_activities - Danh sách activities muốn book
 * @param {string} bookingData.special_requests - Yêu cầu đặc biệt
 * @param {Object} bookingData.contact_info - Thông tin liên hệ
 * @returns {Promise}
 */
export const createBookingRequest = async (bookingData) => {
    try {
        const token = getAuthToken();

        console.log('📤 Creating booking request:', bookingData);

        const response = await apiClient.post(`${AI_ITINERARY_BOOKING_BASE}/create`, bookingData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            success: true,
            data: response.data.data,
            message: 'Booking request created successfully'
        };
    } catch (error) {
        console.error('❌ Create Booking Request Error:', error);
        throw {
            message: error.response?.data?.message || 'Failed to create booking request',
            error: error.response?.data?.error || error.message,
            status: error.response?.status
        };
    }
};

/**
 * 2. Lấy danh sách bookings của traveler
 * GET /api/ai-itinerary-bookings/traveler/:userId
 * 
 * @param {string} userId
 * @param {Object} filters - { status, start_date, end_date }
 * @returns {Promise}
 */
export const getTravelerBookings = async (userId, filters = {}) => {
    try {
        const token = getAuthToken();

        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.start_date) queryParams.append('start_date', filters.start_date);
        if (filters.end_date) queryParams.append('end_date', filters.end_date);

        const queryString = queryParams.toString();
        const url = `${AI_ITINERARY_BOOKING_BASE}/traveler/${userId}${queryString ? `?${queryString}` : ''}`;

        const response = await apiClient.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return {
            success: true,
            data: response.data.data || response.data
        };
    } catch (error) {
        console.error('❌ Get Traveler Bookings Error:', error);
        throw {
            message: error.response?.data?.message || 'Failed to fetch bookings',
            error: error.response?.data?.error || error.message
        };
    }
};

/**
 * 3. Lấy chi tiết booking
 * GET /api/ai-itinerary-bookings/:bookingId
 * 
 * @param {string} bookingId
 * @returns {Promise}
 */
export const getBookingDetail = async (bookingId) => {
    try {
        const token = getAuthToken();

        const response = await apiClient.get(`${AI_ITINERARY_BOOKING_BASE}/${bookingId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return {
            success: true,
            data: response.data.data || response.data
        };
    } catch (error) {
        console.error('❌ Get Booking Detail Error:', error);
        throw {
            message: error.response?.data?.message || 'Failed to fetch booking details',
            error: error.response?.data?.error || error.message
        };
    }
};

/**
 * 4. Hủy booking (chỉ khi status = pending)
 * PUT /api/ai-itinerary-bookings/:bookingId/cancel
 * 
 * @param {string} bookingId
 * @param {string} reason - Lý do hủy
 * @returns {Promise}
 */
export const cancelBooking = async (bookingId, reason) => {
    try {
        const token = getAuthToken();

        const response = await apiClient.put(`${AI_ITINERARY_BOOKING_BASE}/${bookingId}/cancel`,
            { reason },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            message: 'Booking cancelled successfully'
        };
    } catch (error) {
        console.error('❌ Cancel Booking Error:', error);
        throw {
            message: error.response?.data?.message || 'Failed to cancel booking',
            error: error.response?.data?.error || error.message
        };
    }
};

// ========================================
// 🏢 TOUR PROVIDER APIs
// ========================================

/**
 * 5. Lấy danh sách booking requests cho provider
 * GET /api/ai-itinerary-bookings/provider/:providerId
 * 
 * @param {string} providerId
 * @param {Object} filters - { status, destination, start_date, end_date, page, limit }
 * @returns {Promise}
 */
export const getProviderBookings = async (providerId, filters = {}) => {
    try {
        const token = getAuthToken();

        const queryParams = new URLSearchParams();

        // Filters
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.destination) queryParams.append('destination', filters.destination);
        if (filters.start_date) queryParams.append('start_date', filters.start_date);
        if (filters.end_date) queryParams.append('end_date', filters.end_date);

        // Pagination
        queryParams.append('page', filters.page || 1);
        queryParams.append('limit', filters.limit || 10);

        const queryString = queryParams.toString();
        const url = `${AI_ITINERARY_BOOKING_BASE}/provider/${providerId}${queryString ? `?${queryString}` : ''}`;

        const response = await apiClient.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return {
            success: true,
            data: response.data.data || response.data,
            pagination: response.data.pagination
        };
    } catch (error) {
        console.error('❌ Get Provider Bookings Error:', error);
        throw {
            message: error.response?.data?.message || 'Failed to fetch provider bookings',
            error: error.response?.data?.error || error.message
        };
    }
};

/**
 * 6. Provider approve booking
 * PUT /api/ai-itinerary-bookings/:bookingId/approve
 * 
 * @param {string} bookingId
 * @param {Object} approvalData
 * @param {number} approvalData.quoted_price - Giá báo
 * @param {string} approvalData.provider_notes - Ghi chú của provider
 * @param {Array} approvalData.included_services - Dịch vụ bao gồm
 * @param {Array} approvalData.excluded_services - Dịch vụ không bao gồm
 * @returns {Promise}
 */
export const approveBooking = async (bookingId, approvalData) => {
    try {
        const token = getAuthToken();

        const response = await apiClient.put(`${AI_ITINERARY_BOOKING_BASE}/${bookingId}/approve`,
            approvalData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            data: response.data.data,
            message: 'Booking approved successfully'
        };
    } catch (error) {
        console.error('❌ Approve Booking Error:', error);
        throw {
            message: error.response?.data?.message || 'Failed to approve booking',
            error: error.response?.data?.error || error.message
        };
    }
};

/**
 * 7. Provider reject booking
 * PUT /api/ai-itinerary-bookings/:bookingId/reject
 * 
 * @param {string} bookingId
 * @param {string} reason - Lý do từ chối
 * @returns {Promise}
 */
export const rejectBooking = async (bookingId, reason) => {
    try {
        const token = getAuthToken();

        const response = await apiClient.put(`${AI_ITINERARY_BOOKING_BASE}/${bookingId}/reject`,
            { reason },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            message: 'Booking rejected successfully'
        };
    } catch (error) {
        console.error('❌ Reject Booking Error:', error);
        throw {
            message: error.response?.data?.message || 'Failed to reject booking',
            error: error.response?.data?.error || error.message
        };
    }
};

/**
 * 8. Provider cập nhật thông tin booking
 * PUT /api/ai-itinerary-bookings/:bookingId/update
 * 
 * @param {string} bookingId
 * @param {Object} updateData
 * @returns {Promise}
 */
export const updateBookingByProvider = async (bookingId, updateData) => {
    try {
        const token = getAuthToken();

        const response = await apiClient.put(`${AI_ITINERARY_BOOKING_BASE}/${bookingId}/update`,
            updateData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            data: response.data.data,
            message: 'Booking updated successfully'
        };
    } catch (error) {
        console.error('❌ Update Booking Error:', error);
        throw {
            message: error.response?.data?.message || 'Failed to update booking',
            error: error.response?.data?.error || error.message
        };
    }
};

/**
 * 9. Provider đánh dấu hoàn thành
 * PUT /api/ai-itinerary-bookings/:bookingId/complete
 * 
 * @param {string} bookingId
 * @param {Object} completionData - Feedback và rating từ provider
 * @returns {Promise}
 */
export const completeBooking = async (bookingId, completionData = {}) => {
    try {
        const token = getAuthToken();

        const response = await apiClient.put(`${AI_ITINERARY_BOOKING_BASE}/${bookingId}/complete`,
            completionData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            message: 'Booking marked as completed'
        };
    } catch (error) {
        console.error('❌ Complete Booking Error:', error);
        throw {
            message: error.response?.data?.message || 'Failed to complete booking',
            error: error.response?.data?.error || error.message
        };
    }
};

// ========================================
// 👨‍💼 ADMIN APIs
// ========================================

/**
 * 10. Admin lấy tất cả bookings
 * GET /api/ai-itinerary-bookings/admin/all
 * 
 * @param {Object} filters - { status, provider_id, destination, page, limit }
 * @returns {Promise}
 */
export const getAllBookingsAdmin = async (filters = {}) => {
    try {
        const token = getAuthToken();

        const queryParams = new URLSearchParams();

        // Filters
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.provider_id) queryParams.append('provider_id', filters.provider_id);
        if (filters.destination) queryParams.append('destination', filters.destination);
        if (filters.start_date) queryParams.append('start_date', filters.start_date);
        if (filters.end_date) queryParams.append('end_date', filters.end_date);
        if (filters.search) queryParams.append('search', filters.search);

        // Pagination
        queryParams.append('page', filters.page || 1);
        queryParams.append('limit', filters.limit || 20);

        // Sorting
        if (filters.sort_by) queryParams.append('sort_by', filters.sort_by);
        if (filters.order) queryParams.append('order', filters.order);

        const queryString = queryParams.toString();
        const url = `${AI_ITINERARY_BOOKING_BASE}/admin/all${queryString ? `?${queryString}` : ''}`;

        const response = await apiClient.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return {
            success: true,
            data: response.data.data || response.data,
            pagination: response.data.pagination,
            statistics: response.data.statistics
        };
    } catch (error) {
        console.error('❌ Get All Bookings Admin Error:', error);
        throw {
            message: error.response?.data?.message || 'Failed to fetch bookings',
            error: error.response?.data?.error || error.message
        };
    }
};

/**
 * 11. Admin lấy thống kê booking
 * GET /api/ai-itinerary-bookings/admin/statistics
 * 
 * @param {Object} params - { start_date, end_date, provider_id }
 * @returns {Promise}
 */
export const getBookingStatistics = async (params = {}) => {
    try {
        const token = getAuthToken();

        const queryParams = new URLSearchParams();
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
        if (params.provider_id) queryParams.append('provider_id', params.provider_id);

        const queryString = queryParams.toString();
        const url = `${AI_ITINERARY_BOOKING_BASE}/admin/statistics${queryString ? `?${queryString}` : ''}`;

        const response = await apiClient.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return {
            success: true,
            data: response.data.data || response.data
        };
    } catch (error) {
        console.error('❌ Get Booking Statistics Error:', error);
        throw {
            message: error.response?.data?.message || 'Failed to fetch statistics',
            error: error.response?.data?.error || error.message
        };
    }
};

/**
 * 12. Admin can thiệp vào booking (resolve issues)
 * PUT /api/ai-itinerary-bookings/:bookingId/admin-action
 * 
 * @param {string} bookingId
 * @param {Object} actionData
 * @param {string} actionData.action - 'approve' | 'reject' | 'refund' | 'resolve'
 * @param {string} actionData.admin_notes - Ghi chú của admin
 * @returns {Promise}
 */
export const adminBookingAction = async (bookingId, actionData) => {
    try {
        const token = getAuthToken();

        const response = await apiClient.put(`${AI_ITINERARY_BOOKING_BASE}/${bookingId}/admin-action`,
            actionData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            message: 'Admin action executed successfully'
        };
    } catch (error) {
        console.error('❌ Admin Booking Action Error:', error);
        throw {
            message: error.response?.data?.message || 'Failed to execute admin action',
            error: error.response?.data?.error || error.message
        };
    }
};

// ========================================
// 🔧 UTILITY FUNCTIONS
// ========================================

/**
 * Format currency VND
 */
export const formatVND = (amount) => {
    try {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    } catch (error) {
        return `${(amount || 0).toLocaleString()} VND`;
    }
};

/**
 * Get booking status label
 */
export const getBookingStatusLabel = (status) => {
    const labels = {
        'pending': 'Đang chờ xử lý',
        'approved': 'Đã duyệt',
        'rejected': 'Đã từ chối',
        'confirmed': 'Đã xác nhận',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy',
        'refunded': 'Đã hoàn tiền'
    };
    return labels[status] || status;
};

/**
 * Get booking status color
 */
export const getBookingStatusColor = (status) => {
    const colors = {
        'pending': { bg: '#fef3c7', color: '#92400e', border: '#fbbf24' },
        'approved': { bg: '#d1fae5', color: '#065f46', border: '#10b981' },
        'rejected': { bg: '#fed7d7', color: '#991b1b', border: '#f87171' },
        'confirmed': { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' },
        'completed': { bg: '#d1fae5', color: '#065f46', border: '#10b981' },
        'cancelled': { bg: '#f3f4f6', color: '#6b7280', border: '#9ca3af' },
        'refunded': { bg: '#e0e7ff', color: '#3730a3', border: '#818cf8' }
    };
    return colors[status] || { bg: '#f3f4f6', color: '#6b7280', border: '#9ca3af' };
};

/**
 * Validate booking data
 */
export const validateBookingData = (bookingData) => {
    const errors = [];

    if (!bookingData.ai_itinerary_id) {
        errors.push('AI Itinerary ID is required');
    }

    if (!bookingData.start_date) {
        errors.push('Start date is required');
    } else {
        const startDate = new Date(bookingData.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
            errors.push('Start date must be in the future');
        }
    }

    if (!bookingData.participant_number || bookingData.participant_number < 1) {
        errors.push('Number of participants must be at least 1');
    }

    if (!bookingData.contact_info?.phone) {
        errors.push('Contact phone number is required');
    }

    if (!bookingData.contact_info?.email) {
        errors.push('Contact email is required');
    }

    return errors;
};

/**
 * Format date to YYYY-MM-DD
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
 * Calculate days between dates
 */
export const calculateDaysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// ========================================
// 📊 EXPORT
// ========================================

export default {
    // Traveler APIs
    createBookingRequest,
    getTravelerBookings,
    getBookingDetail,
    cancelBooking,

    // Provider APIs
    getProviderBookings,
    approveBooking,
    rejectBooking,
    updateBookingByProvider,
    completeBooking,

    // Admin APIs
    getAllBookingsAdmin,
    getBookingStatistics,
    adminBookingAction,

    // Utilities
    formatVND,
    getBookingStatusLabel,
    getBookingStatusColor,
    validateBookingData,
    formatDate,
    calculateDaysBetween
};
