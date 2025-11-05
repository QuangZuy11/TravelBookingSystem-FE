// Helper function to format opening hours
export const formatOpeningHours = (openingHours) => {
    if (!openingHours) return null;
    if (typeof openingHours === 'string') return openingHours;

    // Handle if hours is an object with open/close times
    if (openingHours.open && openingHours.close) {
        return `${openingHours.open} - ${openingHours.close}`;
    }

    return null;
};