import { useState, useEffect, useCallback } from 'react';
import { tourApi } from '@api/tourApi';
import toast from 'react-hot-toast';

/**
 * Custom Hook for Booking Management
 * Handles all booking-related operations and state
 * 
 * @param {object} options - Hook options
 * @param {string} options.providerId - Provider ID (for provider bookings)
 * @param {string} options.customerId - Customer ID (for customer bookings)
 * @param {object} options.initialFilters - Initial filter values
 * @returns {object} Booking state and operations
 */
const useBookings = ({ providerId, customerId, initialFilters = {} } = {}) => {
  const [bookings, setBookings] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [stats, setStats] = useState(null);

  /**
   * Fetch provider bookings
   */
  const fetchProviderBookings = useCallback(async () => {
    if (!providerId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.getProviderBookings(filters);
      setBookings(response.bookings || response || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể tải danh sách bookings';
      setError(errorMessage);
      console.error('Error fetching provider bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [providerId, filters]);

  /**
   * Fetch customer bookings
   */
  const fetchMyBookings = useCallback(async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.getMyBookings();
      setBookings(response.bookings || response || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể tải danh sách đặt chỗ';
      setError(errorMessage);
      console.error('Error fetching customer bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  /**
   * Fetch booking details
   */
  const fetchBookingById = useCallback(async (bookingId) => {
    if (!bookingId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.getBookingDetails(bookingId);
      setCurrentBooking(response.booking || response);
      return response.booking || response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể tải thông tin booking';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new booking
   */
  const createBooking = useCallback(async (bookingData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.createBooking(bookingData);
      toast.success('Đặt chỗ thành công!');
      return response.booking || response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể tạo booking';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Confirm booking (Provider only)
   */
  const confirmBooking = useCallback(async (bookingId) => {
    if (!bookingId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.confirmBooking(bookingId);
      toast.success('Xác nhận booking thành công!');
      
      // Update current booking if it's the one being confirmed
      if (currentBooking?._id === bookingId) {
        setCurrentBooking({ ...currentBooking, status: 'confirmed' });
      }
      
      // Refresh bookings list
      if (providerId) {
        await fetchProviderBookings();
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể xác nhận booking';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bookingId, currentBooking, providerId, fetchProviderBookings]);

  /**
   * Cancel booking
   */
  const cancelBooking = useCallback(async (bookingId, cancellationData) => {
    if (!bookingId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.cancelBooking(bookingId, cancellationData);
      toast.success('Hủy booking thành công!');
      
      // Update current booking if it's the one being cancelled
      if (currentBooking?._id === bookingId) {
        setCurrentBooking({ ...currentBooking, status: 'cancelled' });
      }
      
      // Refresh bookings list
      if (providerId) {
        await fetchProviderBookings();
      } else if (customerId) {
        await fetchMyBookings();
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể hủy booking';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bookingId, currentBooking, providerId, customerId, fetchProviderBookings, fetchMyBookings]);

  /**
   * Complete booking (Provider only)
   */
  const completeBooking = useCallback(async (bookingId) => {
    if (!bookingId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.completeBooking(bookingId);
      toast.success('Hoàn thành booking thành công!');
      
      // Update current booking if it's the one being completed
      if (currentBooking?._id === bookingId) {
        setCurrentBooking({ ...currentBooking, status: 'completed' });
      }
      
      // Refresh bookings list
      if (providerId) {
        await fetchProviderBookings();
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể hoàn thành booking';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bookingId, currentBooking, providerId, fetchProviderBookings]);

  /**
   * Update payment status
   */
  const updatePayment = useCallback(async (bookingId, paymentData) => {
    if (!bookingId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.updatePayment(bookingId, paymentData);
      toast.success('Cập nhật thanh toán thành công!');
      
      // Update current booking payment info
      if (currentBooking?._id === bookingId) {
        setCurrentBooking({
          ...currentBooking,
          payment: { ...currentBooking.payment, ...paymentData },
        });
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể cập nhật thanh toán';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bookingId, currentBooking]);

  /**
   * Fetch booking statistics (Provider only)
   */
  const fetchBookingStats = useCallback(async () => {
    if (!providerId) return;

    try {
      const response = await tourApi.getBookingStats();
      setStats(response.stats || response);
    } catch (err) {
      console.error('Error fetching booking stats:', err);
    }
  }, [providerId]);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Clear filters
   */
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  /**
   * Refresh bookings
   */
  const refresh = useCallback(() => {
    if (providerId) {
      fetchProviderBookings();
      fetchBookingStats();
    } else if (customerId) {
      fetchMyBookings();
    }
  }, [providerId, customerId, fetchProviderBookings, fetchMyBookings, fetchBookingStats]);

  // Auto-fetch on mount
  useEffect(() => {
    refresh();
  }, []);

  // Computed values
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;
  const completedBookings = bookings.filter((b) => b.status === 'completed').length;

  return {
    // State
    bookings,
    currentBooking,
    loading,
    error,
    filters,
    stats,

    // Operations
    fetchProviderBookings,
    fetchMyBookings,
    fetchBookingById,
    createBooking,
    confirmBooking,
    cancelBooking,
    completeBooking,
    updatePayment,
    fetchBookingStats,
    updateFilters,
    clearFilters,
    refresh,

    // Computed
    totalBookings: bookings.length,
    pendingBookings,
    confirmedBookings,
    cancelledBookings,
    completedBookings,
  };
};

export { useBookings };
export default useBookings;
