import { useState, useCallback } from 'react';
import { tourApi } from '@api/tourApi';
import toast from 'react-hot-toast';

/**
 * Custom Hook for Itinerary Management
 * Handles itinerary, activities, and budget operations
 * 
 * @param {string} tourId - Tour ID
 * @returns {object} Itinerary state and operations
 */
const useItinerary = (tourId) => {
  const [itineraries, setItineraries] = useState([]);
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [budgetBreakdown, setBudgetBreakdown] = useState([]);

  /**
   * Fetch all itineraries for a tour
   */
  const fetchItineraries = useCallback(async () => {
    if (!tourId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.getItineraries(tourId);
      setItineraries(response.itineraries || response || []);
      
      // Set first itinerary as current if available
      if (response.itineraries?.length > 0 && !currentItinerary) {
        setCurrentItinerary(response.itineraries[0]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể tải itinerary';
      setError(errorMessage);
      console.error('Error fetching itineraries:', err);
    } finally {
      setLoading(false);
    }
  }, [tourId, currentItinerary]);

  /**
   * Fetch single itinerary details
   */
  const fetchItineraryById = useCallback(async (itineraryId) => {
    if (!itineraryId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.getItineraryDetails(itineraryId);
      setCurrentItinerary(response.itinerary || response);
      return response.itinerary || response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể tải chi tiết itinerary';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new itinerary
   */
  const createItinerary = useCallback(async (itineraryData) => {
    if (!tourId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.createItinerary(tourId, itineraryData);
      toast.success('Tạo itinerary thành công!');
      
      const newItinerary = response.itinerary || response;
      setItineraries((prev) => [...prev, newItinerary]);
      setCurrentItinerary(newItinerary);
      
      return newItinerary;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể tạo itinerary';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tourId]);

  /**
   * Update itinerary
   */
  const updateItinerary = useCallback(async (itineraryId, itineraryData) => {
    if (!itineraryId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.updateItinerary(itineraryId, itineraryData);
      toast.success('Cập nhật itinerary thành công!');
      
      const updatedItinerary = response.itinerary || response;
      
      // Update in list
      setItineraries((prev) =>
        prev.map((it) => (it._id === itineraryId ? updatedItinerary : it))
      );
      
      // Update current if it's the one being edited
      if (currentItinerary?._id === itineraryId) {
        setCurrentItinerary(updatedItinerary);
      }
      
      return updatedItinerary;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể cập nhật itinerary';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentItinerary]);

  /**
   * Delete itinerary
   */
  const deleteItinerary = useCallback(async (itineraryId) => {
    if (!itineraryId) return;

    try {
      setLoading(true);
      setError(null);
      await tourApi.deleteItinerary(itineraryId);
      toast.success('Xóa itinerary thành công!');
      
      // Remove from list
      setItineraries((prev) => prev.filter((it) => it._id !== itineraryId));
      
      // Clear current if it was deleted
      if (currentItinerary?._id === itineraryId) {
        setCurrentItinerary(null);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể xóa itinerary';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentItinerary]);

  // ========== ACTIVITY OPERATIONS ==========

  /**
   * Add activity to itinerary
   */
  const addActivity = useCallback(async (itineraryId, activityData) => {
    if (!itineraryId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.addActivity(itineraryId, activityData);
      toast.success('Thêm hoạt động thành công!');
      
      // Refresh current itinerary
      await fetchItineraryById(itineraryId);
      
      return response.activity || response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể thêm hoạt động';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchItineraryById]);

  /**
   * Update activity
   */
  const updateActivity = useCallback(async (itineraryId, activityId, activityData) => {
    if (!itineraryId || !activityId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.updateActivity(itineraryId, activityId, activityData);
      toast.success('Cập nhật hoạt động thành công!');
      
      // Update activity in current itinerary
      if (currentItinerary?._id === itineraryId) {
        setCurrentItinerary({
          ...currentItinerary,
          activities: currentItinerary.activities.map((act) =>
            act._id === activityId ? { ...act, ...activityData } : act
          ),
        });
      }
      
      return response.activity || response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể cập nhật hoạt động';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentItinerary]);

  /**
   * Delete activity
   */
  const deleteActivity = useCallback(async (itineraryId, activityId) => {
    if (!itineraryId || !activityId) return;

    try {
      setLoading(true);
      setError(null);
      await tourApi.deleteActivity(itineraryId, activityId);
      toast.success('Xóa hoạt động thành công!');
      
      // Remove activity from current itinerary
      if (currentItinerary?._id === itineraryId) {
        setCurrentItinerary({
          ...currentItinerary,
          activities: currentItinerary.activities.filter((act) => act._id !== activityId),
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể xóa hoạt động';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentItinerary]);

  /**
   * Reorder activities (for drag-drop)
   */
  const reorderActivities = useCallback((itineraryId, reorderedActivities) => {
    if (currentItinerary?._id === itineraryId) {
      setCurrentItinerary({
        ...currentItinerary,
        activities: reorderedActivities,
      });
    }
  }, [currentItinerary]);

  // ========== BUDGET OPERATIONS ==========

  /**
   * Fetch budget breakdown
   */
  const fetchBudgetBreakdown = useCallback(async (itineraryId) => {
    if (!itineraryId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.getBudgetBreakdown(itineraryId);
      setBudgetBreakdown(response.budget || response || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể tải budget';
      setError(errorMessage);
      console.error('Error fetching budget:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add budget item
   */
  const addBudgetItem = useCallback(async (itineraryId, budgetData) => {
    if (!itineraryId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.addBudgetItem(itineraryId, budgetData);
      toast.success('Thêm mục chi phí thành công!');
      
      // Add to budget list
      setBudgetBreakdown((prev) => [...prev, response.budgetItem || response]);
      
      return response.budgetItem || response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể thêm budget item';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update budget item
   */
  const updateBudgetItem = useCallback(async (itineraryId, budgetId, budgetData) => {
    if (!itineraryId || !budgetId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.updateBudgetItem(itineraryId, budgetId, budgetData);
      toast.success('Cập nhật chi phí thành công!');
      
      // Update in budget list
      setBudgetBreakdown((prev) =>
        prev.map((item) => (item._id === budgetId ? { ...item, ...budgetData } : item))
      );
      
      return response.budgetItem || response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể cập nhật budget item';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete budget item
   */
  const deleteBudgetItem = useCallback(async (itineraryId, budgetId) => {
    if (!itineraryId || !budgetId) return;

    try {
      setLoading(true);
      setError(null);
      await tourApi.deleteBudgetItem(itineraryId, budgetId);
      toast.success('Xóa mục chi phí thành công!');
      
      // Remove from budget list
      setBudgetBreakdown((prev) => prev.filter((item) => item._id !== budgetId));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể xóa budget item';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calculate total budget
   */
  const calculateTotalBudget = useCallback(() => {
    return budgetBreakdown.reduce((total, item) => total + (item.total_price || 0), 0);
  }, [budgetBreakdown]);

  /**
   * Group budget by category
   */
  const groupBudgetByCategory = useCallback(() => {
    const grouped = {};
    budgetBreakdown.forEach((item) => {
      const category = item.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  }, [budgetBreakdown]);

  // ========== AI GENERATION ==========

  /**
   * Generate an itinerary using AI (server-side) and set as current
   * @param {object} aiInput - payload describing preferences (days, budget, travelers, interests...)
   * @returns {object} generated itinerary
   */
  const generateItineraryFromAI = useCallback(async (aiInput = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tourApi.generateItineraryAI(tourId, aiInput);

      // server returns itinerary in response.itinerary or raw
      const generated = response.itinerary || response;

      if (generated) {
        // Add into itineraries list and set as current
        setItineraries((prev) => [...prev, generated]);
        setCurrentItinerary(generated);
      }

      return generated;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể tạo itinerary bằng AI';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tourId]);

  return {
    // State
    itineraries,
    currentItinerary,
    loading,
    error,
    budgetBreakdown,

    // Itinerary operations
    fetchItineraries,
    fetchItineraryById,
    createItinerary,
    updateItinerary,
    deleteItinerary,
  generateItineraryFromAI,
    setCurrentItinerary,

    // Activity operations
    addActivity,
    updateActivity,
    deleteActivity,
    reorderActivities,

    // Budget operations
    fetchBudgetBreakdown,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    calculateTotalBudget,
    groupBudgetByCategory,

    // Computed
    totalItineraries: itineraries.length,
    totalActivities: currentItinerary?.activities?.length || 0,
    totalBudget: calculateTotalBudget(),
  };
};

export { useItinerary };
export default useItinerary;
