/**
 * License Validation Utilities
 * Validates service provider licenses according to business rules
 */

/**
 * Validate service provider licenses before submission
 * @param {Array<string>} serviceTypes - Selected service types
 * @param {Array<Object>} licenses - License objects to validate
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export const validateServiceProviderLicenses = (serviceTypes, licenses) => {
  const errors = [];
  
  // 1. Check tour licenses count - MUST BE EXACTLY 1
  const tourLicenses = licenses.filter(l => l.service_type === 'tour');
  if (tourLicenses.length > 1) {
    errors.push('🗺️ Tour chỉ được có 1 giấy phép duy nhất. Vui lòng xóa các giấy phép thừa.');
  }
  if (serviceTypes.includes('tour') && tourLicenses.length === 0) {
    errors.push('🗺️ Tour phải có ít nhất 1 giấy phép.');
  }
  
  // 2. Check flight licenses count - MUST BE EXACTLY 1
  const flightLicenses = licenses.filter(l => l.service_type === 'flight');
  if (flightLicenses.length > 1) {
    errors.push('✈️ Flight chỉ được có 1 giấy phép duy nhất. Vui lòng xóa các giấy phép thừa.');
  }
  if (serviceTypes.includes('flight') && flightLicenses.length === 0) {
    errors.push('✈️ Flight phải có ít nhất 1 giấy phép.');
  }
  
  // 3. Check hotel licenses - can be multiple
  const hotelLicenses = licenses.filter(l => l.service_type === 'hotel');
  if (serviceTypes.includes('hotel') && hotelLicenses.length === 0) {
    errors.push('🏨 Hotel phải có ít nhất 1 giấy phép.');
  }
  
  // 4. Check duplicate license_number
  const licenseNumbers = licenses.map(l => l.license_number.trim()).filter(n => n);
  const uniqueNumbers = [...new Set(licenseNumbers)];
  if (licenseNumbers.length !== uniqueNumbers.length) {
    errors.push('🔒 Các license number phải khác nhau. Vui lòng kiểm tra lại.');
  }
  
  // 5. Check empty license_number
  if (licenses.some(l => !l.license_number || !l.license_number.trim())) {
    errors.push('📝 Vui lòng nhập đầy đủ license number cho tất cả các giấy phép.');
  }
  
  // 6. Check license format (XXX-YYYY-NNN)
  const licensePattern = /^[A-Z]{3}-\d{4}-\d{3}$/;
  const invalidLicenses = licenses.filter(l => {
    const trimmed = l.license_number.trim();
    return trimmed && !licensePattern.test(trimmed);
  });
  if (invalidLicenses.length > 0) {
    errors.push('📋 License number phải có format: XXX-YYYY-NNN (VD: HTL-2024-001)');
  }
  
  // 7. Check if licenses match service types
  const licensesServiceTypes = [...new Set(licenses.map(l => l.service_type))];
  const missingTypes = licensesServiceTypes.filter(t => !serviceTypes.includes(t));
  if (missingTypes.length > 0) {
    errors.push(`⚠️ Service types không khớp: ${missingTypes.join(', ')}`);
  }
  
  // 8. Check if all service types have at least one license
  const missingLicenses = serviceTypes.filter(type => 
    !licenses.some(l => l.service_type === type)
  );
  if (missingLicenses.length > 0) {
    errors.push(`⚠️ Thiếu license cho: ${missingLicenses.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Check if can add license for a service type
 * ONLY HOTEL can add multiple licenses
 * @param {string} serviceType - Service type to check
 * @returns {boolean} True if can add license
 */
export const canAddLicense = (serviceType) => {
  return serviceType === 'hotel';
};

/**
 * Check if can remove license for a service type
 * Tour and Flight MUST have at least 1 license
 * @param {string} serviceType - Service type to check
 * @param {number} currentCount - Current number of licenses
 * @returns {boolean} True if can remove license
 */
export const canRemoveLicense = (serviceType, currentCount) => {
  if (serviceType === 'tour' || serviceType === 'flight') {
    return currentCount > 1; // Must keep at least 1
  }
  return true; // Hotel can remove any
};

/**
 * Get licenses by service type
 * @param {Array<Object>} licenses - All licenses
 * @param {string} serviceType - Service type to filter
 * @returns {Array<Object>} Filtered licenses
 */
export const getLicensesByType = (licenses, serviceType) => {
  return licenses.filter(l => l.service_type === serviceType);
};

/**
 * Validate single license number format
 * @param {string} licenseNumber - License number to validate
 * @returns {boolean} True if valid format
 */
export const isValidLicenseFormat = (licenseNumber) => {
  const pattern = /^[A-Z]{3}-\d{4}-\d{3}$/;
  return pattern.test(licenseNumber.trim());
};

/**
 * Get service type display name with emoji
 * @param {string} serviceType - Service type
 * @returns {string} Display name with emoji
 */
export const getServiceTypeDisplay = (serviceType) => {
  const displays = {
    hotel: '🏨 Khách sạn',
    tour: '🗺️ Tour',
    flight: '✈️ Hàng không'
  };
  return displays[serviceType] || serviceType;
};

/**
 * Get license status display configuration
 * @param {string} status - License status
 * @returns {Object} Display configuration
 */
export const getLicenseStatusConfig = (status) => {
  const configs = {
    verified: {
      text: 'Đã xác minh',
      className: 'badge-verified',
      icon: '✓',
      bgColor: '#f0fdf4',
      borderColor: '#10b981',
      textColor: '#065f46'
    },
    pending: {
      text: 'Chờ xác minh',
      className: 'badge-pending',
      icon: '⏳',
      bgColor: '#fffbeb',
      borderColor: '#f59e0b',
      textColor: '#92400e'
    },
    rejected: {
      text: 'Bị từ chối',
      className: 'badge-rejected',
      icon: '✗',
      bgColor: '#fef2f2',
      borderColor: '#ef4444',
      textColor: '#991b1b'
    }
  };
  return configs[status] || configs.pending;
};

/**
 * Get max licenses allowed for service type
 * @param {string} serviceType - Service type
 * @returns {number} Max licenses (Infinity for hotel, 1 for tour/flight)
 */
export const getMaxLicenses = (serviceType) => {
  if (serviceType === 'hotel') {
    return Infinity;
  }
  return 1; // tour and flight
};

/**
 * Generate error messages mapping for API errors
 */
export const ERROR_MESSAGES = {
  'Tour provider chỉ có thể đăng ký 1 license duy nhất': 
    '🗺️ Tour chỉ được có 1 giấy phép. Vui lòng xóa các giấy phép thừa.',
  
  'Flight provider chỉ có thể đăng ký 1 license duy nhất': 
    '✈️ Flight chỉ được có 1 giấy phép. Vui lòng xóa các giấy phép thừa.',
  
  'License number không được trùng lặp': 
    '🔒 Các license number phải khác nhau. Vui lòng kiểm tra lại.',
  
  'License number đã được đăng ký bởi công ty khác': 
    '⚠️ License number này đã được sử dụng. Vui lòng sử dụng số khác.',
  
  'Chỉ có thể thêm license cho service type hotel': 
    '🏨 Tour và Flight chỉ được có 1 license duy nhất, không thể thêm mới.',
    
  'Provider chưa đăng ký service type hotel':
    '⚠️ Công ty của bạn chưa đăng ký dịch vụ khách sạn.',
    
  'Bạn chưa được xác minh để cung cấp dịch vụ':
    '⏳ Giấy phép của bạn chưa được admin xác minh. Vui lòng chờ.'
};

/**
 * Get user-friendly error message
 * @param {string} apiError - Error message from API
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (apiError) => {
  return ERROR_MESSAGES[apiError] || apiError;
};

export default {
  validateServiceProviderLicenses,
  canAddLicense,
  canRemoveLicense,
  getLicensesByType,
  isValidLicenseFormat,
  getServiceTypeDisplay,
  getLicenseStatusConfig,
  getMaxLicenses,
  getErrorMessage,
  ERROR_MESSAGES
};
