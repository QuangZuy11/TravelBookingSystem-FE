import api from './api';

export const providerService = {
  // Get all pending providers
  getPendingProviders: async () => {
    try {
      const response = await api.get('/admin/service-providers/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending providers:', error);
      throw error;
    }
  },

  // Get provider detail by ID
  getProviderDetail: async (providerId) => {
    try {
      const response = await api.get(`/admin/service-providers/${providerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching provider detail:', error);
      throw error;
    }
  },

  // Verify a license
  verifyLicense: async (providerId, licenseId, status, rejectionReason = null) => {
    try {
      const response = await api.put(`/admin/service-providers/${providerId}/verify-license`, {
        license_id: licenseId,
        status,
        rejection_reason: rejectionReason
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying license:', error);
      throw error;
    }
  },

  // Admin approve/reject provider
  adminApproval: async (providerId, approved, rejectionReason = null) => {
    try {
      const response = await api.put(`/admin/service-providers/${providerId}/verify-admin`, {
        approved,
        rejection_reason: rejectionReason
      });
      return response.data;
    } catch (error) {
      console.error('Error with admin approval:', error);
      throw error;
    }
  },

  // Get all providers (with optional filters)
  getAllProviders: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/admin/service-providers${queryParams ? '?' + queryParams : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all providers:', error);
      throw error;
    }
  }
};

export default providerService;
