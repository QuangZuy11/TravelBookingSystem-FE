import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './BasicInfoForm.css';

const BasicInfoForm = ({ providerId, initialData, isEditMode, onNext, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        meeting_point: {
            address: '',
            lat: 0,
            lng: 0
        },
        duration_hours: 24,
        difficulty: 'easy',
        capacity: {
            max_participants: 20,
            min_participants: 5
        },
        pricing: {
            adult: 0,
            child: 0,
            infant: 0
        },
        image: '',
        services: [],
        available_dates: [],
        status: 'draft'
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [newService, setNewService] = useState('');
    const [newDate, setNewDate] = useState('');
    const token = localStorage.getItem('token');
    // Load initial data in edit mode
    useEffect(() => {
        if (isEditMode && initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                location: initialData.location || '',
                meeting_point: {
                    address: initialData.meeting_point?.address || '',
                    lat: initialData.meeting_point?.lat || 0,
                    lng: initialData.meeting_point?.lng || 0
                },
                duration_hours: initialData.duration_hours || 24,
                difficulty: initialData.difficulty || 'easy',
                capacity: {
                    max_participants: initialData.capacity?.max_participants || 20,
                    min_participants: initialData.capacity?.min_participants || 5
                },
                pricing: {
                    adult: initialData.pricing?.adult || 0,
                    child: initialData.pricing?.child || 0,
                    infant: initialData.pricing?.infant || 0
                },
                image: initialData.image || '',
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
                    [child]: name === 'meeting_point.lat' || name === 'meeting_point.lng'
                        ? parseFloat(value) || 0
                        : (name.startsWith('pricing.') || name.startsWith('capacity.'))
                            ? Number(value) || 0
                            : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'duration_hours' ? Number(value) || 0 : value
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
        } else if (title.trim().length < 10) {
            newErrors.title = 'Tên tour phải có ít nhất 10 ký tự';
        }

        const description = String(formData.description || '');
        // Description is optional, but if provided must be at least 50 characters
        if (description.trim() && description.trim().length < 50) {
            newErrors.description = 'Mô tả phải có ít nhất 50 ký tự';
        }

        const location = String(formData.location || '');
        if (!location.trim()) {
            newErrors.location = 'Vui lòng nhập địa điểm';
        }

        const address = String(formData.meeting_point?.address || '');
        if (!address.trim()) {
            newErrors.meeting_point = 'Vui lòng nhập địa chỉ điểm tập trung';
        }

        if (formData.duration_hours < 1) {
            newErrors.duration_hours = 'Thời gian tour phải lớn hơn 0';
        }

        if (formData.pricing.adult <= 0) {
            newErrors.pricing = 'Giá người lớn phải lớn hơn 0';
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
            // Prepare data with price field from adult pricing
            const tourData = {
                ...formData,
                price: formData.pricing.adult // Backend requires price as Number
            };

            let response;
            let tourId;

            if (isEditMode && initialData?._id) {
                // Update existing tour
                response = await axios.put(
                    `http://localhost:3000/api/tour/provider/${providerId}/tours/${initialData._id}`,
                    tourData, {
                    headers: { Authorization: `Bearer ${token}` }
                }
                );
                tourId = initialData._id;
                toast.success('Cập nhật thông tin tour thành công!');
            } else {
                // Create new tour
                response = await axios.post(
                    `http://localhost:3000/api/tour/provider/${providerId}/tours`,
                    tourData, {
                    headers: { Authorization: `Bearer ${token}` }
                }
                );
                tourId = response.data.data._id;
                toast.success('Tạo tour mới thành công!');
            }

            if (response.data.success) {
                onNext({ tourId, basicInfo: formData });
            }
        } catch (error) {
            console.error('Error saving tour:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
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
                    Mô tả <span className="optional">(Tùy chọn - tối thiểu 50 ký tự nếu nhập)</span>
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`form-textarea ${errors.description ? 'error' : ''}`}
                    placeholder="Mô tả chi tiết về tour, các điểm đến, hoạt động..."
                />
                <div className="char-count">
                    {formData.description.length} ký tự {formData.description.length > 0 && formData.description.length < 50 ? '(tối thiểu 50)' : ''}
                </div>
                {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            {/* Location */}
            <div className="form-group">
                <label className="form-label">
                    Địa điểm <span className="required">*</span>
                </label>
                <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`form-input ${errors.location ? 'error' : ''}`}
                    placeholder="VD: Đà Nẵng, Việt Nam"
                />
                {errors.location && <span className="error-message">{errors.location}</span>}
            </div>

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

            {/* Meeting Point Coordinates (Optional) */}
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Vĩ độ (Latitude)</label>
                    <input
                        type="number"
                        name="meeting_point.lat"
                        value={formData.meeting_point.lat}
                        onChange={handleChange}
                        step="0.000001"
                        className="form-input"
                        placeholder="16.0544"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Kinh độ (Longitude)</label>
                    <input
                        type="number"
                        name="meeting_point.lng"
                        value={formData.meeting_point.lng}
                        onChange={handleChange}
                        step="0.000001"
                        className="form-input"
                        placeholder="108.2022"
                    />
                </div>
            </div>

            {/* Duration & Difficulty */}
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">
                        Thời gian (giờ) <span className="required">*</span>
                    </label>
                    <input
                        type="number"
                        name="duration_hours"
                        value={formData.duration_hours}
                        onChange={handleChange}
                        min="1"
                        className="form-input"
                    />
                    {errors.duration_hours && <span className="error-message">{errors.duration_hours}</span>}
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
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Người lớn (VNĐ)</label>
                        <input
                            type="number"
                            name="pricing.adult"
                            value={formData.pricing.adult}
                            onChange={handleChange}
                            min="0"
                            className="form-input"
                            placeholder="0"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Trẻ em (VNĐ)</label>
                        <input
                            type="number"
                            name="pricing.child"
                            value={formData.pricing.child}
                            onChange={handleChange}
                            min="0"
                            className="form-input"
                            placeholder="0"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Em bé (VNĐ)</label>
                        <input
                            type="number"
                            name="pricing.infant"
                            value={formData.pricing.infant}
                            onChange={handleChange}
                            min="0"
                            className="form-input"
                            placeholder="0"
                        />
                    </div>
                </div>
                {errors.pricing && <span className="error-message">{errors.pricing}</span>}
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
