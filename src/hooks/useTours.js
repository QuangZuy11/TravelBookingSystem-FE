import { useState, useEffect, useCallback } from 'react';
import { tourApi } from '@api/tourApi';
import toast from 'react-hot-toast';

/**
 * Custom Hook for Tour Management
 * Handles all tour-related operations and state
 * 
 * @param {string} providerId - Provider ID
 * @param {object} initialFilters - Initial filter values
 * @returns {object} Tour state and operations
 */
const useTours = (providerId, initialFilters = {}) => {
  const [tours, setTours] = useState([]);
  const [currentTour, setCurrentTour] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  /**
   * Fetch all tours for provider
   */
  const fetchTours = useCallback(async () => {
    if (!providerId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.getProviderTours(providerId, filters);
      const toursData = response.tours || response || [];
      // Ensure it's always an array
      setTours(Array.isArray(toursData) ? toursData : []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể tải danh sách tours';
      setError(errorMessage);
      console.error('Error fetching tours:', err);
      setTours([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [providerId, filters]);

  /**
   * Fetch single tour details
   */
  const fetchTourById = useCallback(async (tourId) => {
    if (!providerId || !tourId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.getTourDetails(providerId, tourId);
      setCurrentTour(response.tour || response);
      return response.tour || response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể tải thông tin tour';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  /**
   * Create new tour
   */
  const createTour = useCallback(async (tourData) => {
    if (!providerId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.createTour(providerId, tourData);
      toast.success('Tạo tour thành công!');
      await fetchTours(); // Refresh list
      return response.tour || response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể tạo tour';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [providerId, fetchTours]);

  /**
   * Update existing tour
   */
  const updateTour = useCallback(async (tourId, tourData) => {
    if (!providerId || !tourId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.updateTour(providerId, tourId, tourData);
      toast.success('Cập nhật tour thành công!');
      
      // Update current tour if it's the one being edited
      if (currentTour?._id === tourId) {
        setCurrentTour(response.tour || response);
      }
      
      await fetchTours(); // Refresh list
      return response.tour || response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể cập nhật tour';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [providerId, currentTour, fetchTours]);

  /**
   * Delete tour
   */
  const deleteTour = useCallback(async (tourId) => {
    if (!providerId || !tourId) return;

    try {
      setLoading(true);
      setError(null);
      await tourApi.deleteTour(providerId, tourId);
      toast.success('Xóa tour thành công!');
      
      // Clear current tour if it was deleted
      if (currentTour?._id === tourId) {
        setCurrentTour(null);
      }
      
      await fetchTours(); // Refresh list
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể xóa tour';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [providerId, currentTour, fetchTours]);

  /**
   * Update tour status
   */
  const updateTourStatus = useCallback(async (tourId, status) => {
    if (!providerId || !tourId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.updateTourStatus(providerId, tourId, status);
      toast.success(`Cập nhật trạng thái thành "${status}" thành công!`);
      
      // Update current tour status
      if (currentTour?._id === tourId) {
        setCurrentTour({ ...currentTour, status });
      }
      
      await fetchTours(); // Refresh list
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể cập nhật trạng thái';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [providerId, currentTour, fetchTours]);

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
   * Refresh tours list
   */
  const refresh = useCallback(() => {
    fetchTours();
  }, [fetchTours]);

  // Auto-fetch on mount and filter changes
  useEffect(() => {
    if (providerId) {
      fetchTours();
    }
  }, [fetchTours]);

  return {
    // State
    tours,
    currentTour,
    loading,
    error,
    filters,

    // Operations
    fetchTours,
    fetchTourById,
    createTour,
    updateTour,
    deleteTour,
    updateTourStatus,
    updateFilters,
    clearFilters,
    refresh,

    // Computed
    totalTours: Array.isArray(tours) ? tours.length : 0,
    activeTours: Array.isArray(tours) ? tours.filter((t) => t.status === 'active').length : 0,
    draftTours: Array.isArray(tours) ? tours.filter((t) => t.status === 'draft').length : 0,
  };
};

export { useTours };
export default useTours;
