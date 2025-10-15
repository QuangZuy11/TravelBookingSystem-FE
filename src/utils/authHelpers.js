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
  localStorage.removeItem('role');
  localStorage.removeItem('provider');
};

/**
 * Get provider ID from localStorage
 * Tries to get from providerId first, then from provider._id
 */
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
 */
export const hasCompletedProviderRegistration = () => {
  const provider = getProvider();
  if (!provider) return false;
  
  const hasType = Array.isArray(provider.type) && provider.type.length > 0;
  const hasLicenses = Array.isArray(provider.licenses) && provider.licenses.length > 0;
  
  return hasType && hasLicenses;
};
