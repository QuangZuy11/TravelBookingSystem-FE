/**
 * Auth Helper Utilities
 * Centralized functions for authentication operations
 */

/**
 * Clear all authentication data from localStorage
 * Use this function whenever you need to logout or clear auth state
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('fullName');
  localStorage.removeItem('providerId');
  localStorage.removeItem('userId');
  localStorage.removeItem('role');
  localStorage.removeItem('provider');
};

/**
 * Get provider ID from localStorage
 * Tries to get from providerId first, then from provider._id
 */
export const getUserId = () => {
  // First try to get userId directly
  let userId = localStorage.getItem('userId');

  // If not found, try to get from provider.user_id
  if (!userId) {
    const providerStr = localStorage.getItem('provider');
    if (providerStr) {
      try {
        const provider = JSON.parse(providerStr);
        userId = provider.user_id;
      } catch (error) {
        console.error('Error parsing provider:', error);
      }
    }
  }

  return userId;
};

export const getProviderId = () => {
  let providerId = localStorage.getItem('providerId');

  if (!providerId) {
    const providerStr = localStorage.getItem('provider');
    if (providerStr) {
      try {
        const provider = JSON.parse(providerStr);
        providerId = provider._id;
      } catch (error) {
        console.error('Error parsing provider:', error);
      }
    }
  }

  return providerId;
};

/**
 * Get provider object from localStorage
 */
export const getProvider = () => {
  const providerStr = localStorage.getItem('provider');
  if (!providerStr) return null;

  try {
    return JSON.parse(providerStr);
  } catch (error) {
    console.error('Error parsing provider:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Check if user is a service provider
 */
export const isServiceProvider = () => {
  const role = localStorage.getItem('role');
  return role === 'ServiceProvider' || role === 'Provider';
};

/**
 * Check if provider has completed registration
 * Updated to check provider._id and licenses instead of type field
 */
export const hasCompletedProviderRegistration = () => {
  const provider = getProvider();
  if (!provider) return false;

  // Simplified check: provider._id and licenses array
  const hasProvider = !!provider._id;
  const hasLicenses = Array.isArray(provider.licenses) && provider.licenses.length > 0;

  return hasProvider && hasLicenses;
};
