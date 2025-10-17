import axiosInstance from '../api/axiosConfig';

/**
 * Service Provider API Service
 * Handles all API calls for Service Provider management
 */

// ==================== AUTHENTICATION ====================

/**
 * Register a new service provider
 * @param {Object} data - Registration data
 * @param {string} data.email - Email
 * @param {string} data.password - Password
 * @param {string} data.first_name - First name
 * @param {string} data.last_name - Last name
 * @param {string} data.company_name - Company name
 * @param {string} data.contact_person - Contact person name
 * @param {string} data.company_email - Company email
 * @param {string} data.company_phone - Company phone
 * @param {string} data.address - Company address
 * @param {Array<string>} data.service_types - Array of service types ['hotel', 'tour']
 * @param {Array<Object>} data.licenses - Array of license objects
 * @returns {Promise<Object>} Response with token and provider data
 */
export const registerServiceProvider = async (data) => {
  try {
    const response = await axiosInstance.post('/auth/service-provider/register', data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Login service provider
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - Email
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Response with token and provider data
 */
export const loginServiceProvider = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/service-provider/login', credentials);
    return response;
  } catch (error) {
    throw error;
  }
};

// ==================== PROFILE ====================

/**
 * Get service provider profile
 * @returns {Promise<Object>} Provider profile data including licenses
 */
export const getServiceProviderProfile = async () => {
  try {
    const response = await axiosInstance.get('/auth/service-provider/profile');
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Update service provider profile
 * @param {Object} data - Profile data to update
 * @param {string} data.company_name - Company name
 * @param {string} data.contact_person - Contact person
 * @param {string} data.email - Email
 * @param {string} data.phone - Phone
 * @param {string} data.address - Address
 * @returns {Promise<Object>} Updated provider data
 */
export const updateServiceProviderProfile = async (data) => {
  try {
    const response = await axiosInstance.put('/auth/service-provider/profile', data);
    return response;
  } catch (error) {
    throw error;
  }
};

// ==================== ADMIN APIS ====================

/**
 * Get all service providers (Admin only)
 * @param {Object} params - Query parameters
 * @param {string} params.verification_status - Filter by status ('verified', 'pending', 'rejected')
 * @param {string} params.service_type - Filter by service type ('hotel', 'tour')
 * @param {number} params.page - Page number
 * @param {number} params.limit - Results per page
 * @returns {Promise<Object>} List of providers
 */
export const getAllServiceProviders = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/service-providers', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get pending verification providers (Admin only)
 * @returns {Promise<Object>} List of pending providers
 */
export const getPendingVerifications = async () => {
  try {
    const response = await axiosInstance.get('/admin/service-providers/pending-verification');
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get service provider detail (Admin only)
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>} Provider detail with all licenses
 */
export const getServiceProviderDetail = async (providerId) => {
  try {
    const response = await axiosInstance.get(`/admin/service-providers/${providerId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify or reject a license (Admin only)
 * @param {string} providerId - Provider ID
 * @param {Object} data - Verification data
 * @param {string} data.service_type - Service type ('hotel', 'tour')
 * @param {string} data.status - Status ('verified' or 'rejected')
 * @param {string} data.rejection_reason - Reason if rejected
 * @returns {Promise<Object>} Updated provider data
 */
export const verifyLicense = async (providerId, data) => {
  try {
    const response = await axiosInstance.put(
      `/admin/service-providers/${providerId}/verify-license`,
      data
    );
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Add a new license (Admin or Provider - HOTEL ONLY)
 * @param {string} providerId - Provider ID
 * @param {Object} data - License data
 * @param {string} data.service_type - Must be 'hotel'
 * @param {string} data.license_number - License number (format: XXX-YYYY-NNN)
 * @param {Array<string>} data.documents - Array of document URLs
 * @returns {Promise<Object>} Updated provider data
 */
export const addLicense = async (providerId, data) => {
  try {
    // Validation: ONLY hotel can add licenses
    if (data.service_type !== 'hotel') {
      throw new Error('Chỉ có thể thêm license cho service type hotel!');
    }

    const response = await axiosInstance.post(
      `/admin/service-providers/${providerId}/add-license`,
      data
    );
    return response;
  } catch (error) {
    throw error;
  }
};

// ==================== FILE UPLOAD ====================

/**
 * Upload license documents
 * @param {FormData} formData - FormData containing files
 * @returns {Promise<Array<string>>} Array of uploaded file URLs
 */
export const uploadLicenseDocuments = async (formData) => {
  try {
    const response = await axiosInstance.post('/upload/license-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.urls;
  } catch (error) {
    throw error;
  }
};

export default {
  registerServiceProvider,
  loginServiceProvider,
  getServiceProviderProfile,
  updateServiceProviderProfile,
  getAllServiceProviders,
  getPendingVerifications,
  getServiceProviderDetail,
  verifyLicense,
  addLicense,
  uploadLicenseDocuments,
};
