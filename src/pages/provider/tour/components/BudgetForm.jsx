import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './BudgetForm.css';

const BudgetForm = ({ tourId, itineraries, existingBudgetItems = [], isEditMode, onComplete, onBack }) => {
    const [budgetItems, setBudgetItems] = useState(existingBudgetItems);
    const [loadedItineraries, setLoadedItineraries] = useState([]);
    const [loadingItineraries, setLoadingItineraries] = useState(true);
    const token = localStorage.getItem('token');
    const [formData, setFormData] = useState({
        itinerary_id: '',
        day_number: 1,
        category: 'accommodation',
        item_name: '',
        unit_price: 0,
        quantity: 1,
        description: '',
        is_included: true,
        is_optional: false,
        currency: 'VND'
    });
    const [loading, setLoading] = useState(false);

    // Load existing budget items in edit mode
    useEffect(() => {
        if (isEditMode && existingBudgetItems.length > 0) {
            setBudgetItems(existingBudgetItems);
        }
    }, [isEditMode, existingBudgetItems]);

    // Load itineraries và activities từ backend
    useEffect(() => {
        const fetchItineraries = async () => {
            if (!tourId) {
                setLoadingItineraries(false);
                return;
            }

            try {
                setLoadingItineraries(true);

                // Fetch itineraries cho tour này
                const itinerariesResponse = await axios.get(
                    `http://localhost:3000/api/itineraries/tour/${tourId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }
                );

                const itinerariesData = itinerariesResponse.data.data || [];

                // Fetch activities cho từng itinerary
                const itinerariesWithActivities = await Promise.all(
                    itinerariesData.map(async (itinerary) => {
                        try {
                            const activitiesResponse = await axios.get(
                                `http://localhost:3000/api/itineraries/${itinerary._id}/activities`, {
                headers: { Authorization: `Bearer ${token}` }
            }
                            );
                            return {
                                ...itinerary,
                                activities: activitiesResponse.data.data || []
                            };
                        } catch (error) {
                            console.error(`Error loading activities for itinerary ${itinerary._id}:`, error);
                            return {
                                ...itinerary,
                                activities: []
                            };
                        }
                    })
                );

                setLoadedItineraries(itinerariesWithActivities);
            } catch (error) {
                console.error('Error loading itineraries:', error);
                toast.error('Không thể tải lịch trình. Vui lòng thử lại!');
            } finally {
                setLoadingItineraries(false);
            }
        };

        fetchItineraries();
    }, [tourId]);

    const categories = [
        { value: 'accommodation', label: '🏨 Chỗ ở', icon: '🏨' },
        { value: 'transportation', label: '🚗 Di chuyển', icon: '🚗' },
        { value: 'meals', label: '🍽️ Ăn uống', icon: '🍽️' },
        { value: 'activities', label: '🎯 Hoạt động', icon: '🎯' },
        { value: 'guide', label: '👨‍🏫 Hướng dẫn viên', icon: '👨‍🏫' },
        { value: 'insurance', label: '🛡️ Bảo hiểm', icon: '🛡️' },
        { value: 'entrance_fees', label: '🎫 Vé tham quan', icon: '🎫' },
        { value: 'other', label: '📦 Khác', icon: '📦' }
    ];

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddItem = () => {
        console.log('🔍 Adding item with formData:', formData);

        if (!formData.itinerary_id) {
            toast.error('Vui lòng chọn ngày trong lịch trình');
            return;
        }

        if (!formData.category || formData.category.trim() === '') {
            toast.error('Vui lòng chọn danh mục');
            return;
        }

        if (!formData.item_name.trim()) {
            toast.error('Vui lòng nhập tên khoản mục');
            return;
        }

        if (formData.unit_price <= 0) {
            toast.error('Chi phí phải lớn hơn 0');
            return;
        }

        const newItem = {
            itinerary_id: formData.itinerary_id,
            day_number: formData.day_number,
            category: formData.category,
            item_name: formData.item_name,
            unit_price: formData.unit_price,
            quantity: formData.quantity,
            description: formData.description || '',
            is_included: formData.is_included,
            is_optional: formData.is_optional,
            currency: 'VND'
        };

        console.log('✅ New budget item:', newItem);

        setBudgetItems(prev => [...(Array.isArray(prev) ? prev : []), newItem]);

        // Reset form (keep itinerary_id and day_number)
        setFormData(prev => ({
            itinerary_id: prev.itinerary_id,
            day_number: prev.day_number,
            category: 'accommodation',
            item_name: '',
            unit_price: 0,
            quantity: 1,
            description: '',
            is_included: true,
            is_optional: false,
            currency: 'VND'
        }));

        toast.success('Đã thêm khoản mục');
    };

    const handleRemoveItem = (index) => {
        setBudgetItems(prev => (Array.isArray(prev) ? prev : []).filter((_, i) => i !== index));
        toast.success('Đã xóa khoản mục');
    };

    const calculateTotal = () => {
        if (!Array.isArray(budgetItems)) return 0;
        return budgetItems.reduce((sum, item) => sum + ((item.unit_price || 0) * (item.quantity || 1)), 0);
    };

    const handleSubmit = async () => {
        console.log('🚀 Submitting budget items:', budgetItems);

        if (!Array.isArray(budgetItems) || budgetItems.length === 0) {
            toast.error('Vui lòng thêm ít nhất 1 khoản ngân sách');
            return;
        }

        setLoading(true);

        try {
            if (isEditMode) {
                // In edit mode: Delete old budget items by itinerary
                for (const item of budgetItems) {
                    if (item.itinerary_id) {
                        try {
                            // Delete by itinerary_id instead of tour_id
                            await axios.delete(`http://localhost:3000/api/budget-breakdowns/itinerary/${item.itinerary_id}`);
                        } catch (error) {
                            console.log('No existing budget to delete or delete failed');
                        }
                    }
                }
            }

            // Create all budget items (both create and edit mode)
            for (const item of budgetItems) {
                // Skip items that already have _id (already in database) unless in edit mode
                if (!item._id || isEditMode) {
                    const payload = {
                        itinerary_id: item.itinerary_id,
                        day_number: item.day_number,
                        category: item.category,
                        item_name: item.item_name,
                        unit_price: item.unit_price,
                        quantity: item.quantity || 1,
                        description: item.description || '',
                        is_included: item.is_included !== undefined ? item.is_included : true,
                        is_optional: item.is_optional || false,
                        currency: item.currency || 'VND'
                    };

                    console.log('📤 Sending budget item:', payload);

                    await axios.post('http://localhost:3000/api/budget-breakdowns', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
                }
            }

            toast.success(isEditMode ? 'Cập nhật tour thành công! 🎉' : 'Tạo tour thành công! 🎉');
            onComplete({ budgetItems });
        } catch (error) {
            console.error('Error saving budget:', error);
            toast.error(error.response?.data?.message || 'Không thể lưu ngân sách. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        toast.success(isEditMode ? 'Cập nhật tour thành công! 🎉' : 'Tạo tour thành công! 🎉');
        onComplete({ budgetItems: [] });
    };

    return (
        <div className="budget-form">
            <div className="form-header">
                <h2 className="form-section-title">Ngân sách Tour</h2>
                <span className="optional-badge">Tùy chọn</span>
            </div>

            {loadingItineraries ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải lịch trình...</p>
                </div>
            ) : loadedItineraries.length === 0 ? (
                <div className="empty-state">
                    <p>⚠️ Không có lịch trình nào. Vui lòng quay lại bước 2 để thêm lịch trình.</p>
                    <div className="form-actions">
                        <button type="button" onClick={onBack} className="btn-secondary">
                            ← Quay lại
                        </button>
                    </div>
                </div>
            ) : (
                <div className="budget-container">
                    {/* Add Budget Item Form */}
                    <div className="add-budget-section">
                        <h3 className="subsection-title">Thêm khoản ngân sách</h3>

                        <div className="form-grid">
                            {/* Select Day/Itinerary */}
                            <div className="form-group full-width">
                                <label className="form-label">
                                    Chọn ngày trong lịch trình <span className="required">*</span>
                                </label>
                                <select
                                    value={formData.itinerary_id}
                                    onChange={(e) => {
                                        const selectedItinerary = loadedItineraries.find(it => it._id === e.target.value);
                                        handleChange('itinerary_id', e.target.value);
                                        if (selectedItinerary) {
                                            handleChange('day_number', selectedItinerary.day_number);
                                        }
                                    }}
                                    className="form-input"
                                >
                                    <option value="">-- Chọn ngày --</option>
                                    {loadedItineraries && loadedItineraries.map((itinerary) => (
                                        <option key={itinerary._id} value={itinerary._id}>
                                            Ngày {itinerary.day_number}: {itinerary.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Hiển thị hoạt động của ngày đã chọn */}
                            {formData.itinerary_id && (
                                <div className="form-group full-width">
                                    <label className="form-label">Hoạt động trong ngày</label>
                                    <div className="activities-preview">
                                        {(() => {
                                            const selectedItinerary = loadedItineraries.find(
                                                it => it._id === formData.itinerary_id
                                            );
                                            const activities = selectedItinerary?.activities || [];

                                            if (activities.length === 0) {
                                                return <p className="no-activities">Chưa có hoạt động nào</p>;
                                            }

                                            return (
                                                <ul className="activities-list">
                                                    {activities.map((activity, index) => (
                                                        <li key={index} className="activity-item">
                                                            <span className="activity-time">
                                                                {activity.start_time} - {activity.end_time}
                                                            </span>
                                                            <span className="activity-name">
                                                                {activity.activity_name}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Category */}
                            <div className="form-group full-width">
                                <label className="form-label">Danh mục</label>
                                <div className="category-grid">
                                    {categories.map(cat => (
                                        <label
                                            key={cat.value}
                                            className={`category-option ${formData.category === cat.value ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat.value}
                                                checked={formData.category === cat.value}
                                                onChange={(e) => handleChange('category', e.target.value)}
                                            />
                                            <span className="category-icon">{cat.icon}</span>
                                            <span className="category-label">{cat.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Item Name */}
                            <div className="form-group full-width">
                                <label className="form-label">
                                    Tên khoản mục <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.item_name}
                                    onChange={(e) => handleChange('item_name', e.target.value)}
                                    className="form-input"
                                    placeholder="VD: Khách sạn 4 sao"
                                />
                            </div>

                            {/* Cost and Quantity */}
                            <div className="form-group">
                                <label className="form-label">
                                    Đơn giá (VNĐ) <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.unit_price}
                                    onChange={(e) => handleChange('unit_price', Number(e.target.value))}
                                    className="form-input"
                                    min="0"
                                    step="1000"
                                    placeholder="Nhập đơn giá"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Số lượng <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => handleChange('quantity', Number(e.target.value))}
                                    className="form-input"
                                    min="1"
                                    placeholder="Số lượng"
                                />
                            </div>

                            {/* Total Display */}
                            <div className="form-group full-width">
                                <div className="total-cost-display">
                                    <span className="total-label">Tổng chi phí:</span>
                                    <span className="total-value">
                                        {(formData.unit_price * formData.quantity).toLocaleString('vi-VN')} VNĐ
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="form-group full-width">
                                <label className="form-label">Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    rows={2}
                                    className="form-textarea"
                                    placeholder="Ghi chú thêm về khoản mục này..."
                                />
                            </div>

                            {/* Included in Price */}
                            <div className="form-group full-width">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_included}
                                        onChange={(e) => handleChange('is_included', e.target.checked)}
                                    />
                                    <span>Bao gồm trong giá tour</span>
                                </label>
                            </div>

                            {/* Add Button */}
                            <div className="form-group full-width">
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="btn-add-item"
                                >
                                    + Thêm vào danh sách
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Budget Items List */}
                    <div className="budget-items-section">
                        <div className="section-header">
                            <h3 className="subsection-title">
                                Danh sách ngân sách ({Array.isArray(budgetItems) ? budgetItems.length : 0} khoản)
                            </h3>
                            <div className="grand-total">
                                <span className="grand-total-label">Tổng cộng:</span>
                                <span className="grand-total-value">
                                    {calculateTotal().toLocaleString('vi-VN')} VNĐ
                                </span>
                            </div>
                        </div>

                        {!Array.isArray(budgetItems) || budgetItems.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">💰</span>
                                <p>Chưa có khoản ngân sách nào.</p>
                                <p className="empty-hint">Thêm khoản mục ở trên để bắt đầu.</p>
                            </div>
                        ) : (
                            <div className="budget-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Ngày</th>
                                            <th>Danh mục</th>
                                            <th>Tên khoản mục</th>
                                            <th>Đơn giá</th>
                                            <th>Số lượng</th>
                                            <th>Tổng</th>
                                            <th>Trạng thái</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(Array.isArray(budgetItems) ? budgetItems : []).map((item, index) => {
                                            const category = categories.find(c => c.value === item.category);
                                            const itinerary = loadedItineraries.find(it => it._id === item.itinerary_id);
                                            const totalPrice = (item.unit_price || 0) * (item.quantity || 1);
                                            return (
                                                <tr key={index}>
                                                    <td className="item-day">
                                                        Ngày {item.day_number}
                                                    </td>
                                                    <td>
                                                        <span className="table-category">
                                                            {category?.icon} {category?.label}
                                                        </span>
                                                    </td>
                                                    <td className="item-name">{item.item_name}</td>
                                                    <td className="item-cost">
                                                        {(item.unit_price || 0).toLocaleString('vi-VN')} VNĐ
                                                    </td>
                                                    <td className="item-quantity">
                                                        {item.quantity || 1}
                                                    </td>
                                                    <td className="item-total">
                                                        <strong>{totalPrice.toLocaleString('vi-VN')} VNĐ</strong>
                                                    </td>
                                                    <td>
                                                        {item.is_included ? (
                                                            <span className="badge-included">Bao gồm</span>
                                                        ) : (
                                                            <span className="badge-extra">Phụ thu</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="btn-remove"
                                                            title="Xóa"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button type="button" onClick={onBack} className="btn-cancel">
                            ← Quay lại
                        </button>

                        <div className="right-actions">
                            <button
                                type="button"
                                onClick={handleSkip}
                                className="btn-skip"
                                disabled={loading}
                            >
                                Bỏ qua bước này
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || !Array.isArray(budgetItems) || budgetItems.length === 0}
                                className="btn-submit"
                            >
                                {loading ? 'Đang xử lý...' : (isEditMode ? '✓ Hoàn tất cập nhật' : '✓ Hoàn tất tạo tour')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetForm;
