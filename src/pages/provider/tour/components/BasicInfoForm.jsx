import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DestinationSelector from '../../../../components/common/DestinationSelector';
import './BasicInfoForm.css';

const BasicInfoForm = ({ providerId, initialData, isEditMode, onNext, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        destination_id: '', // Destination ID instead of location text
        meeting_point: {
            address: '',
            instructions: '' // Optional instructions
        },
        duration: '', // Changed to string "X ngày Y đêm"
        difficulty: 'easy',
        capacity: {
            max_participants: 20,
            min_participants: 5
        },
        price: 0, // Single price field
        image: '',
        highlights: [], // Điểm nổi bật của tour
        services: [],
        available_dates: [],
        status: 'draft'
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [newService, setNewService] = useState('');
    const [newHighlight, setNewHighlight] = useState('');
    const [newDate, setNewDate] = useState('');

    const token = localStorage.getItem('token');

    // Get provider _id from localStorage (current logged in user)
    const provider = localStorage.getItem('provider') ? JSON.parse(localStorage.getItem('provider')) : null;
    const currentProviderId = provider?._id || providerId; // Use provider's _id, fallback to prop

    console.log('🔐 Auth Check:', {
        fromProps: providerId,
        providerFromStorage: provider,
        providerIdUsing: currentProviderId
    });
    // Load initial data in edit mode
    useEffect(() => {
        if (isEditMode && initialData) {
            // Handle destination_id - can be string (ID) or object (populated)
            let destinationId = '';
            if (initialData.destination_id) {
                if (typeof initialData.destination_id === 'string') {
                    // Already an ID
                    destinationId = initialData.destination_id;
                } else if (typeof initialData.destination_id === 'object' && initialData.destination_id._id) {
                    // Populated object from backend
                    destinationId = initialData.destination_id._id;
                }
            }

            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                destination_id: destinationId,
                meeting_point: {
                    address: initialData.meeting_point?.address || '',
                    instructions: initialData.meeting_point?.instructions || ''
                },
                duration: initialData.duration || '',
                difficulty: initialData.difficulty || 'easy',
                capacity: {
                    max_participants: initialData.capacity?.max_participants || 20,
                    min_participants: initialData.capacity?.min_participants || 5
                },
                price: initialData.price || 0,
                image: initialData.image || '',
                highlights: Array.isArray(initialData.highlights) ? initialData.highlights : [],
                services: Array.isArray(initialData.services) ? initialData.services : [],
                available_dates: Array.isArray(initialData.available_dates) ? initialData.available_dates : [],
                status: initialData.status || 'draft'
            });
        }
    }, [isEditMode, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: name.startsWith('capacity.')
                        ? Number(value) || 0
                        : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'price' ? Number(value) || 0 : value
            }));
        }

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const addService = () => {
        if (newService.trim()) {
            setFormData(prev => ({
                ...prev,
                services: [...(Array.isArray(prev.services) ? prev.services : []), newService.trim()]
            }));
            setNewService('');
        }
    };

    const removeService = (index) => {
        setFormData(prev => ({
            ...prev,
            services: (Array.isArray(prev.services) ? prev.services : []).filter((_, i) => i !== index)
        }));
    };

    const addHighlight = () => {
        if (newHighlight.trim()) {
            setFormData(prev => ({
                ...prev,
                highlights: [...(Array.isArray(prev.highlights) ? prev.highlights : []), newHighlight.trim()]
            }));
            setNewHighlight('');
        }
    };

    const removeHighlight = (index) => {
        setFormData(prev => ({
            ...prev,
            highlights: (Array.isArray(prev.highlights) ? prev.highlights : []).filter((_, i) => i !== index)
        }));
    };

    const addAvailableDate = () => {
        if (newDate) {
            const dateObj = new Date(newDate);
            setFormData(prev => ({
                ...prev,
                available_dates: [...(Array.isArray(prev.available_dates) ? prev.available_dates : []), {
                    date: dateObj.toISOString(),
                    available_slots: formData.capacity.max_participants,
                    status: 'available'
                }]
            }));
            setNewDate('');
        }
    };

    const removeDate = (index) => {
        setFormData(prev => ({
            ...prev,
            available_dates: (Array.isArray(prev.available_dates) ? prev.available_dates : []).filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        const title = String(formData.title || '');
        if (!title.trim()) {
            newErrors.title = 'Vui lòng nhập tên tour';
        }

        // Description is optional - no minimum length required
        // Just check if it exists
        const description = String(formData.description || '');
        // No validation needed for description

        const destinationId = String(formData.destination_id || '');
        if (!destinationId.trim()) {
            newErrors.destination_id = 'Vui lòng chọn địa điểm';
        }

        const address = String(formData.meeting_point?.address || '');
        if (!address.trim()) {
            newErrors.meeting_point = 'Vui lòng nhập địa chỉ điểm tập trung';
        }

        const duration = String(formData.duration || '');
        if (!duration.trim()) {
            newErrors.duration = 'Vui lòng nhập thời gian tour (VD: 3 ngày 2 đêm)';
        }

        if (formData.price <= 0) {
            newErrors.price = 'Giá tour phải lớn hơn 0';
        }

        if (formData.capacity.min_participants >= formData.capacity.max_participants) {
            newErrors.participants = 'Số người tối thiểu phải nhỏ hơn số người tối đa';
        }

        if (!Array.isArray(formData.available_dates) || formData.available_dates.length === 0) {
            newErrors.available_dates = 'Phải có ít nhất 1 ngày khởi hành';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        setLoading(true);

        try {
            const tourData = { ...formData };

            console.log('🔍 Debug Info:');
            console.log('- Provider ID (prop):', providerId);
            console.log('- Provider ID (using):', currentProviderId);
            console.log('- Token exists:', !!token);
            console.log('- Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
            console.log('- Tour Data:', tourData);

            let response;
            let tourId;

            if (isEditMode && initialData?._id) {
                // Update existing tour
                console.log('📝 Updating tour:', initialData._id);
                response = await axios.put(
                    `http://localhost:3000/api/tour/provider/${currentProviderId}/tours/${initialData._id}`,
                    tourData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                tourId = initialData._id;
                toast.success('Cập nhật thông tin tour thành công!');
            } else {
                // Create new tour
                console.log('✨ Creating new tour');
                response = await axios.post(
                    `http://localhost:3000/api/tour/provider/${currentProviderId}/tours`,
                    tourData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                tourId = response.data.data._id;
                toast.success('Tạo tour mới thành công!');
            }

            console.log('✅ Response:', response.data);

            if (response.data.success) {
                onNext({ tourId, basicInfo: formData });
            }
        } catch (error) {
            console.error('❌ Error saving tour:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error headers:', error.response?.headers);

            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.response?.status === 403) {
                toast.error('Không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại.');
            } else if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            } else {
                toast.error(`Không thể ${isEditMode ? 'cập nhật' : 'tạo'} tour. Vui lòng thử lại!`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="basic-info-form">
            <h2 className="form-section-title">Thông tin cơ bản</h2>

            {/* Title */}
            <div className="form-group">
                <label className="form-label">
                    Tên Tour <span className="required">*</span>
                </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`form-input ${errors.title ? 'error' : ''}`}
                    placeholder="VD: Khám Phá Đà Nẵng 3N2Đ"
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
                <label className="form-label">
                    Mô tả <span className="optional">(Tùy chọn)</span>
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`form-textarea ${errors.description ? 'error' : ''}`}
                    placeholder="Mô tả chi tiết về tour, các điểm đến, hoạt động..."
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            {/* Destination Selector */}
            <DestinationSelector
                selectedId={formData.destination_id}
                onChange={(destinationId) => {
                    setFormData(prev => ({
                        ...prev,
                        destination_id: destinationId
                    }));
                    // Clear error when selected
                    if (errors.destination_id) {
                        setErrors(prev => ({
                            ...prev,
                            destination_id: null
                        }));
                    }
                }}
                error={errors.destination_id}
            />

            {/* Meeting Point */}
            <div className="form-group">
                <label className="form-label">
                    Điểm tập trung <span className="required">*</span>
                </label>
                <input
                    type="text"
                    name="meeting_point.address"
                    value={formData.meeting_point.address}
                    onChange={handleChange}
                    className={`form-input ${errors.meeting_point ? 'error' : ''}`}
                    placeholder="VD: Sân bay Đà Nẵng, 123 Đường ABC..."
                />
                {errors.meeting_point && <span className="error-message">{errors.meeting_point}</span>}
            </div>

            {/* Meeting Point Instructions */}
            <div className="form-group">
                <label className="form-label">
                    Hướng dẫn tập trung <span className="optional">(Tùy chọn)</span>
                </label>
                <textarea
                    name="meeting_point.instructions"
                    value={formData.meeting_point.instructions}
                    onChange={handleChange}
                    rows={2}
                    className="form-textarea"
                    placeholder="VD: Gặp tại cổng A, mang theo CMND/Passport..."
                />
                <small className="form-hint">💡 Hướng dẫn chi tiết để khách dễ tìm điểm tập trung</small>
            </div>

            {/* Duration & Difficulty */}
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">
                        Thời gian <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className={`form-input ${errors.duration ? 'error' : ''}`}
                        placeholder="VD: 3 ngày 2 đêm"
                    />
                    {errors.duration && <span className="error-message">{errors.duration}</span>}
                    <small className="form-hint">💡 Nhập theo định dạng: X ngày Y đêm</small>
                </div>

                <div className="form-group">
                    <label className="form-label">
                        Độ khó <span className="required">*</span>
                    </label>
                    <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="easy">Dễ - Phù hợp mọi lứa tuổi</option>
                        <option value="moderate">Trung bình - Yêu cầu sức khỏe tốt</option>
                        <option value="challenging">Khó - Thể lực tốt</option>
                    </select>
                </div>
            </div>

            {/* Status */}
            <div className="form-group">
                <label className="form-label">
                    Trạng thái Tour <span className="required">*</span>
                </label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-select"
                >
                    <option value="draft">📝 Nháp - Chưa công khai</option>
                    <option value="active">✅ Hoạt động - Đang mở đặt chỗ</option>
                    <option value="inactive">⏸️ Tạm dừng - Không nhận đặt chỗ</option>
                    <option value="completed">✔️ Hoàn thành - Tour đã kết thúc</option>
                    <option value="cancelled">❌ Đã hủy</option>
                </select>
                <small className="form-hint">
                    💡 Chọn "Nháp" nếu chưa muốn công khai tour. Chọn "Hoạt động" khi sẵn sàng nhận booking.
                </small>
            </div>

            {/* Participants */}
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Số người tối thiểu</label>
                    <input
                        type="number"
                        name="capacity.min_participants"
                        value={formData.capacity.min_participants}
                        onChange={handleChange}
                        min="1"
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">
                        Số người tối đa <span className="required">*</span>
                    </label>
                    <input
                        type="number"
                        name="capacity.max_participants"
                        value={formData.capacity.max_participants}
                        onChange={handleChange}
                        min="1"
                        className="form-input"
                    />
                </div>
            </div>
            {errors.participants && <span className="error-message">{errors.participants}</span>}

            {/* Pricing */}
            <div className="pricing-section">
                <h3 className="subsection-title">Giá Tour <span className="required">*</span></h3>
                <div className="form-group">
                    <label className="form-label">Giá Tour (VNĐ/người)</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        className={`form-input ${errors.price ? 'error' : ''}`}
                        placeholder="VD: 5000000"
                    />
                    {errors.price && <span className="error-message">{errors.price}</span>}
                    <small className="form-hint">💡 Giá áp dụng chung cho mọi độ tuổi</small>
                </div>
            </div>

            {/* Image URL */}
            <div className="form-group">
                <label className="form-label">Link hình ảnh</label>
                <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            {/* Highlights */}
            <div className="services-section">
                <h3 className="subsection-title">Điểm nổi bật</h3>
                <div className="add-item-group">
                    <input
                        type="text"
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                        className="form-input"
                        placeholder="VD: Ngắm hoàng hôn tại Bãi Đá Nhảy, Khám phá làng cổ Hội An..."
                    />
                    <button type="button" onClick={addHighlight} className="btn-add">
                        + Thêm
                    </button>
                </div>
                <div className="items-list">
                    {(Array.isArray(formData.highlights) ? formData.highlights : []).map((highlight, index) => (
                        <div key={index} className="item-tag">
                            <span>⭐ {highlight}</span>
                            <button type="button" onClick={() => removeHighlight(index)} className="btn-remove">
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Services */}
            <div className="services-section">
                <h3 className="subsection-title">Dịch vụ bao gồm</h3>
                <div className="add-item-group">
                    <input
                        type="text"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                        className="form-input"
                        placeholder="VD: Khách sạn 3 sao, Bảo hiểm du lịch..."
                    />
                    <button type="button" onClick={addService} className="btn-add">
                        + Thêm
                    </button>
                </div>
                <div className="items-list">
                    {(Array.isArray(formData.services) ? formData.services : []).map((service, index) => (
                        <div key={index} className="item-tag">
                            <span>✓ {service}</span>
                            <button type="button" onClick={() => removeService(index)} className="btn-remove">
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Available Dates */}
            <div className="dates-section">
                <h3 className="subsection-title">
                    Ngày khởi hành <span className="required">*</span>
                </h3>
                <div className="add-item-group">
                    <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="form-input"
                    />
                    <button type="button" onClick={addAvailableDate} className="btn-add">
                        + Thêm ngày
                    </button>
                </div>
                {errors.available_dates && <span className="error-message">{errors.available_dates}</span>}
                <div className="dates-grid">
                    {(Array.isArray(formData.available_dates) ? formData.available_dates : []).map((dateItem, index) => (
                        <div key={index} className="date-card">
                            <span className="date-text">
                                📅 {new Date(dateItem.date).toLocaleDateString('vi-VN')}
                            </span>
                            <span className="slots-text">
                                {dateItem.available_slots} chỗ
                            </span>
                            <button type="button" onClick={() => removeDate(index)} className="btn-remove-date">
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
                <button type="button" onClick={onCancel} className="btn-cancel">
                    Hủy
                </button>
                <button type="submit" disabled={loading} className="btn-submit">
                    {loading ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật & Tiếp tục →' : 'Tiếp theo: Lịch trình →')}
                </button>
            </div>
        </form>
    );
};

export default BasicInfoForm;
