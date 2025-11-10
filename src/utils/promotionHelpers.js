/**
 * Promotion Helper Utilities
 * Utilities for handling hotel promotions, price calculations, and validation
 */

/**
 * Calculate discounted price based on promotion
 * @param {number} originalPrice - Original price
 * @param {Object} promotion - Promotion object from backend
 * @returns {number} Discounted price
 */
export const calculateDiscountedPrice = (originalPrice, promotion) => {
    if (!promotion || !originalPrice) return originalPrice;

    if (promotion.discountType === 'percent') {
        return Math.round(originalPrice * (1 - promotion.discountValue / 100));
    }

    if (promotion.discountType === 'amount' || promotion.discountType === 'fixed') {
        // Support both 'amount' and 'fixed' for backward compatibility
        return Math.max(0, originalPrice - promotion.discountValue);
    }

    return originalPrice;
};

/**
 * Calculate savings amount
 * @param {number} originalPrice - Original price
 * @param {Object} promotion - Promotion object
 * @returns {number} Amount saved
 */
export const calculateSavings = (originalPrice, promotion) => {
    if (!promotion || !originalPrice) return 0;

    const discountedPrice = calculateDiscountedPrice(originalPrice, promotion);
    return originalPrice - discountedPrice;
};

/**
 * Format promotion discount for display
 * @param {Object} promotion - Promotion object
 * @returns {string} Formatted discount string (e.g., "-15%" or "-50,000đ")
 */
export const formatPromotionDiscount = (promotion) => {
    if (!promotion) return '';

    if (promotion.discountType === 'percent') {
        return `-${promotion.discountValue}%`;
    }

    if (promotion.discountType === 'amount' || promotion.discountType === 'fixed') {
        // Support both 'amount' and 'fixed' for backward compatibility
        return `-${new Intl.NumberFormat('vi-VN').format(promotion.discountValue)}đ`;
    }

    return '';
};

/**
 * Check if promotion is currently valid
 * @param {Object} promotion - Promotion object
 * @returns {boolean} True if promotion is valid
 */
export const isPromotionValid = (promotion) => {
    if (!promotion) return false;

    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    return now >= startDate && now <= endDate;
};

/**
 * Get the best promotion from a list of promotions
 * @param {Array} promotions - Array of promotion objects
 * @param {number} originalPrice - Original price to calculate against
 * @returns {Object|null} Best promotion or null
 */
export const getBestPromotion = (promotions, originalPrice) => {
    if (!Array.isArray(promotions) || promotions.length === 0) return null;

    // Filter valid promotions and calculate savings for each
    const validPromotions = promotions
        .filter(isPromotionValid)
        .map(promotion => ({
            ...promotion,
            savings: calculateSavings(originalPrice, promotion)
        }))
        .sort((a, b) => b.savings - a.savings); // Sort by highest savings first

    return validPromotions.length > 0 ? validPromotions[0] : null;
};

/**
 * Format promotion period for display
 * @param {Object} promotion - Promotion object
 * @returns {string} Formatted date range
 */
export const formatPromotionPeriod = (promotion) => {
    if (!promotion) return '';

    const startDate = new Date(promotion.startDate).toLocaleDateString('vi-VN');
    const endDate = new Date(promotion.endDate).toLocaleDateString('vi-VN');

    return `${startDate} - ${endDate}`;
};

/**
 * Get promotion status for display
 * @param {Object} promotion - Promotion object
 * @returns {Object} Status object with label and color
 */
export const getPromotionStatus = (promotion) => {
    if (!promotion) return { label: 'Không có', color: 'default' };

    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (now < startDate) {
        return { label: 'Sắp diễn ra', color: 'info' };
    }

    if (now > endDate) {
        return { label: 'Đã hết hạn', color: 'error' };
    }

    // Check if promotion is ending soon (within 3 days)
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    if (endDate <= threeDaysFromNow) {
        return { label: 'Sắp hết hạn', color: 'warning' };
    }

    return { label: 'Đang áp dụng', color: 'success' };
};

/**
 * Validate promotion code format
 * @param {string} code - Promotion code
 * @returns {boolean} True if code format is valid
 */
export const validatePromotionCode = (code) => {
    if (!code || typeof code !== 'string') return false;

    // Basic validation: 3-20 characters, alphanumeric and underscore only
    const codeRegex = /^[A-Z0-9_]{3,20}$/;
    return codeRegex.test(code.toUpperCase());
};

/**
 * Generate promotion description for display
 * @param {Object} promotion - Promotion object
 * @returns {string} Generated description
 */
export const generatePromotionDescription = (promotion) => {
    if (!promotion) return '';

    if (promotion.description) {
        return promotion.description;
    }

    // Generate default description based on discount type
    if (promotion.discountType === 'percent') {
        return `Giảm ${promotion.discountValue}% cho đặt phòng`;
    }

    if (promotion.discountType === 'amount' || promotion.discountType === 'fixed') {
        // Support both 'amount' and 'fixed' for backward compatibility
        const formattedAmount = new Intl.NumberFormat('vi-VN').format(promotion.discountValue);
        return `Giảm ${formattedAmount}đ cho đặt phòng`;
    }

    return 'Khuyến mãi đặc biệt';
};