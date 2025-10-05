import React, { useState, useEffect } from 'react';

const PricingRuleForm = ({ initialData, onSubmit }) => {
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        newPrice: 0,
        discountPercentage: 0,
        reason: '' // Optional field to document why this pricing rule exists
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
                endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
                newPrice: initialData.newPrice || 0,
                discountPercentage: initialData.discountPercentage || 0,
                reason: initialData.reason || ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                        min={formData.startDate}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">New Price</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            name="newPrice"
                            value={formData.newPrice}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                            className="block w-full pl-7 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Discount Percentage</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                            type="number"
                            name="discountPercentage"
                            value={formData.discountPercentage}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
                <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows="3"
                    placeholder="e.g., Holiday season, Off-peak discount, Special event"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {initialData ? 'Update Pricing Rule' : 'Create Pricing Rule'}
                </button>
            </div>
        </form>
    );
};

export default PricingRuleForm;