/**
 * Format an address object into a readable string
 * @param {Object|string} address - Address object or string
 * @returns {string} Formatted address string
 */
export const formatAddress = (address) => {
    if (!address) {
        return 'Chưa cập nhật';
    }

    // If it's already a string, return it
    if (typeof address === 'string') {
        return address;
    }

    // If it's an object, format it
    if (typeof address === 'object') {
        const parts = [
            address.street,
            address.city,
            address.state,
            address.country,
            address.zipCode
        ].filter(Boolean); // Remove empty/null/undefined values

        return parts.length > 0 ? parts.join(', ') : 'Chưa cập nhật';
    }

    return 'Chưa cập nhật';
};

/**
 * Format location object (similar to address)
 * @param {Object|string} location - Location object or string
 * @returns {string} Formatted location string
 */
export const formatLocation = (location) => {
    return formatAddress(location);
};

/**
 * Get full address with all details
 * @param {Object} address - Address object
 * @returns {Object} Formatted address parts
 */
export const getAddressParts = (address) => {
    if (!address || typeof address !== 'object') {
        return {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
            full: formatAddress(address)
        };
    }

    return {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        country: address.country || '',
        zipCode: address.zipCode || '',
        full: formatAddress(address)
    };
};
