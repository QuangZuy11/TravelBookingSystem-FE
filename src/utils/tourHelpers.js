/**
 * Utility functions for the Tour Module
 */

import { format, parseISO, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format currency to VND
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'dd/MM/yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: vi });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format datetime to readable string
 * @param {string|Date} datetime - Datetime to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (datetime) => {
  return formatDate(datetime, 'dd/MM/yyyy HH:mm');
};

/**
 * Check if date is in the past
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(dateObj, new Date());
};

/**
 * Check if date is in the future
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isAfter(dateObj, new Date());
};

/**
 * Calculate days until a date
 * @param {string|Date} date - Target date
 * @returns {number} Number of days until date
 */
export const daysUntil = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(dateObj, new Date());
};

/**
 * Calculate total booking amount
 * @param {Object} participants - Participants count
 * @param {Object} pricing - Tour pricing
 * @param {number} discount - Discount percentage
 * @returns {Object} Pricing breakdown
 */
export const calculateBookingAmount = (participants, pricing, discount = 0) => {
  const { adults = 0, children = 0, infants = 0 } = participants;
  const { adult_price = 0, child_price = 0, infant_price = 0 } = pricing;

  const adultTotal = adults * adult_price;
  const childTotal = children * child_price;
  const infantTotal = infants * infant_price;
  
  const subtotal = adultTotal + childTotal + infantTotal;
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  return {
    adult_price,
    child_price,
    infant_price,
    subtotal,
    discount: discountAmount,
    total_amount: total,
  };
};

/**
 * Get status badge color
 * @param {string} status - Status string
 * @returns {string} Tailwind color class
 */
export const getStatusColor = (status) => {
  const colors = {
    // Tour status
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    archived: 'bg-gray-100 text-gray-600',
    
    // Booking status
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
    
    // Payment status
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-800',
    
    // Date status
    available: 'bg-green-100 text-green-800',
    full: 'bg-red-100 text-red-800',
  };

  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

/**
 * Get status text in Vietnamese
 * @param {string} status - Status string
 * @param {string} type - Type of status (tour, booking, payment)
 * @returns {string} Vietnamese status text
 */
export const getStatusText = (status, type = 'tour') => {
  const statusTexts = {
    tour: {
      draft: 'Bản nháp',
      active: 'Đang hoạt động',
      inactive: 'Tạm dừng',
      archived: 'Đã lưu trữ',
    },
    booking: {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      cancelled: 'Đã hủy',
      completed: 'Hoàn thành',
    },
    payment: {
      pending: 'Chờ thanh toán',
      paid: 'Đã thanh toán',
      failed: 'Thanh toán thất bại',
      refunded: 'Đã hoàn tiền',
    },
    date: {
      available: 'Còn chỗ',
      full: 'Đã đầy',
      cancelled: 'Đã hủy',
    },
  };

  return statusTexts[type]?.[status?.toLowerCase()] || status;
};

/**
 * Get difficulty badge color
 * @param {string} difficulty - Difficulty level
 * @returns {string} Tailwind color class
 */
export const getDifficultyColor = (difficulty) => {
  const colors = {
    easy: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    challenging: 'bg-orange-100 text-orange-800',
    expert: 'bg-red-100 text-red-800',
  };

  return colors[difficulty?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

/**
 * Get difficulty text in Vietnamese
 * @param {string} difficulty - Difficulty level
 * @returns {string} Vietnamese difficulty text
 */
export const getDifficultyText = (difficulty) => {
  const texts = {
    easy: 'Dễ',
    moderate: 'Trung bình',
    challenging: 'Khó',
    expert: 'Chuyên gia',
  };

  return texts[difficulty?.toLowerCase()] || difficulty;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Generate unique booking number
 * @returns {string} Booking number
 */
export const generateBookingNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK${timestamp}${random}`;
};

/**
 * Calculate refund amount based on cancellation policy
 * @param {number} totalAmount - Total booking amount
 * @param {number} daysUntilTour - Days until tour date
 * @returns {number} Refund amount
 */
export const calculateRefund = (totalAmount, daysUntilTour) => {
  if (daysUntilTour >= 7) return totalAmount; // Full refund
  if (daysUntilTour >= 3) return totalAmount * 0.5; // 50% refund
  if (daysUntilTour >= 1) return totalAmount * 0.25; // 25% refund
  return 0; // No refund
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate phone number (Vietnamese format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone
 */
export const isValidPhone = (phone) => {
  const regex = /^(0|\+84)[0-9]{9,10}$/;
  return regex.test(phone);
};

/**
 * Parse duration string to object
 * @param {string} durationStr - Duration string (e.g., "3 days 2 nights")
 * @returns {Object} Duration object
 */
export const parseDuration = (durationStr) => {
  const daysMatch = durationStr.match(/(\d+)\s*ngày|(\d+)\s*days?/i);
  const nightsMatch = durationStr.match(/(\d+)\s*đêm|(\d+)\s*nights?/i);
  
  return {
    days: daysMatch ? parseInt(daysMatch[1] || daysMatch[2]) : 0,
    nights: nightsMatch ? parseInt(nightsMatch[1] || nightsMatch[2]) : 0,
  };
};

/**
 * Format duration object to string
 * @param {Object} duration - Duration object
 * @returns {string} Formatted duration string
 */
export const formatDuration = (duration) => {
  const { days = 0, nights = 0 } = duration;
  const parts = [];
  
  if (days > 0) parts.push(`${days} ngày`);
  if (nights > 0) parts.push(`${nights} đêm`);
  
  return parts.join(' ');
};

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Calculate average rating
 * @param {Array} reviews - Array of reviews
 * @returns {number} Average rating
 */
export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
};

/**
 * Get image URL with fallback
 * @param {string} imageUrl - Image URL
 * @param {string} fallback - Fallback URL
 * @returns {string} Image URL
 */
export const getImageUrl = (imageUrl, fallback = '/placeholder-tour.jpg') => {
  if (!imageUrl) return fallback;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${import.meta.env.VITE_API_BASE_URL}/${imageUrl}`;
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Merge class names
 * @param {...string} classes - Class names to merge
 * @returns {string} Merged class names
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
