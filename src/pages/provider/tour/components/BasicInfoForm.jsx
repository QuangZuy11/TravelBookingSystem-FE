import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './BasicInfoForm.css';

const BasicInfoForm = ({ providerId, initialData, isEditMode, onNext, onCancel }) => {
    console.log('🔄 BasicInfoForm rendered with initialData:', initialData);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        destination: '', // Single destination as string
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
        included_services: [], // Dịch vụ bao gồm
        available_dates: [],
        status: 'draft'
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [newHighlight, setNewHighlight] = useState('');
    const [newService, setNewService] = useState('');
    const [newDate, setNewDate] = useState('');

    // Destination is now a simple text input, no need for API loading

    // Helper to check if form has basic required data
    const hasMinimumRequiredData = () => {
        return (
            formData.title.trim().length > 0 &&
            // Description is optional - removed from required checks
            formData.destination && formData.destination.trim().length > 0 &&
            formData.meeting_point.address.trim().length >= 10 &&
            /^\d+\s*ngày\s*\d+\s*đêm$/i.test(formData.duration) &&
            formData.price >= 100000 &&
            formData.capacity.min_participants > 0 &&
            formData.capacity.max_participants > formData.capacity.min_participants &&
            formData.highlights.length > 0 &&
            formData.image
            // available_dates is now optional - removed from required checks
        );
    };

    const token = localStorage.getItem('token');

    // Get provider _id from localStorage (current logged in user)
    const provider = localStorage.getItem('provider') ? JSON.parse(localStorage.getItem('provider')) : null;
    const currentProviderId = provider?._id || providerId; // Use provider's _id, fallback to prop

    console.log('🔐 Auth Check:', {
        fromProps: providerId,
        providerFromStorage: provider,
        providerIdUsing: currentProviderId
    });

    // No longer need to fetch destinations from API since it's now a text input

    // Load initial data in edit mode OR when coming back from next step
    useEffect(() => {
        if (initialData) {
            console.log('📥 Loading initial data into form:', initialData);
            // Handle destination - simplified since it's now always a string
            let destination = '';
            if (typeof initialData.destination === 'string') {
                destination = initialData.destination;
            }
            // Remove legacy destination_id support since we've fully migrated to destination

            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                destination: destination,
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
                included_services: Array.isArray(initialData.included_services) ? initialData.included_services : [],
                available_dates: Array.isArray(initialData.available_dates) ? initialData.available_dates : [],
                status: initialData.status || 'draft'
            });
            console.log('✅ Form data updated');
        }
    }, [initialData]);

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

            // Log destination changes for debugging
            if (name === 'destination') {
                console.log('🎯 Destination updated:', value);
            }
        }

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    // Destination is now handled by the standard handleChange function

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

    const addService = () => {
        if (newService.trim()) {
            setFormData(prev => ({
                ...prev,
                included_services: [...(Array.isArray(prev.included_services) ? prev.included_services : []), newService.trim()]
            }));
            setNewService('');
        }
    };

    const removeService = (index) => {
        setFormData(prev => ({
            ...prev,
            included_services: (Array.isArray(prev.included_services) ? prev.included_services : []).filter((_, i) => i !== index)
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

        // 1. Title validation (only check if empty)
        const title = String(formData.title || '').trim();
        if (!title) {
            newErrors.title = 'Vui lòng nhập tên tour';
        }

        // 2. Description validation (OPTIONAL - no validation)
        // Description is completely optional, no length checks

        // 3. Destination validation (text string)
        const destination = String(formData.destination || '').trim();
        if (!destination) {
            newErrors.destination = 'Vui lòng nhập địa điểm';
        } else if (destination.length < 2) {
            newErrors.destination = 'Tên địa điểm phải có ít nhất 2 ký tự';
        } else if (destination.length > 200) {
            newErrors.destination = 'Tên địa điểm quá dài (tối đa 200 ký tự)';
        } else {
            // Check for valid destination format (basic Vietnamese text validation)
            const validDestinationPattern = /^[a-zA-ZÀ-ỹ0-9\s\-,\.]+$/;
            if (!validDestinationPattern.test(destination)) {
                newErrors.destination = 'Địa điểm chỉ được chứa chữ cái, số và các ký tự "-", ",", "."';
            }
        }

        // 4. Meeting point validation
        const address = String(formData.meeting_point?.address || '').trim();
        if (!address) {
            newErrors.meeting_point = 'Vui lòng nhập địa chỉ điểm tập trung';
        } else if (address.length < 10) {
            newErrors.meeting_point = 'Địa chỉ điểm tập trung phải rõ ràng (ít nhất 10 ký tự)';
        }

        // 5. Duration validation - format "X ngày Y đêm"
        const duration = String(formData.duration || '').trim();
        const durationPattern = /^(\d+)\s*ngày\s*(\d+)\s*đêm$/i;
        if (!duration) {
            newErrors.duration = 'Vui lòng nhập thời gian tour';
        } else if (!durationPattern.test(duration)) {
            newErrors.duration = 'Format phải là "X ngày Y đêm" (VD: 3 ngày 2 đêm)';
        } else {
            const match = duration.match(durationPattern);
            const days = parseInt(match[1]);
            const nights = parseInt(match[2]);

            if (days <= 0 || nights < 0) {
                newErrors.duration = 'Số ngày phải > 0, số đêm phải ≥ 0';
            } else if (nights > days + 1) {
                newErrors.duration = 'Số đêm không được lớn hơn số ngày + 1';
            } else if (nights < days - 1) {
                newErrors.duration = 'Số đêm không được nhỏ hơn số ngày - 1';
            }
        }

        // 6. Price validation
        if (!formData.price || formData.price <= 0) {
            newErrors.price = 'Giá tour phải lớn hơn 0';
        } else if (formData.price < 100000) {
            newErrors.price = 'Giá tour tối thiểu 100,000 VNĐ';
        } else if (formData.price > 1000000000) {
            newErrors.price = 'Giá tour không hợp lý (tối đa 1 tỷ VNĐ)';
        }

        // 7. Capacity validation
        const minPax = formData.capacity.min_participants;
        const maxPax = formData.capacity.max_participants;

        if (!minPax || minPax <= 0) {
            newErrors.min_participants = 'Số người tối thiểu phải > 0';
        } else if (!maxPax || maxPax <= 0) {
            newErrors.max_participants = 'Số người tối đa phải > 0';
        } else if (minPax >= maxPax) {
            newErrors.participants = 'Số người tối thiểu phải nhỏ hơn số người tối đa';
        } else if (minPax < 1) {
            newErrors.min_participants = 'Số người tối thiểu phải ≥ 1';
        } else if (maxPax > 1000) {
            newErrors.max_participants = 'Số người tối đa không hợp lý (tối đa 1000)';
        }

        // 8. Highlights validation
        if (!Array.isArray(formData.highlights) || formData.highlights.length === 0) {
            newErrors.highlights = 'Phải có ít nhất 1 điểm nổi bật của tour';
        } else if (formData.highlights.length > 10) {
            newErrors.highlights = 'Tối đa 10 điểm nổi bật';
        }

        // 9. Image validation (only check if provided)
        const image = String(formData.image || '').trim();
        if (!image) {
            newErrors.image = 'Vui lòng thêm ảnh đại diện cho tour';
        }

        // 10. Available dates validation (optional)
        if (Array.isArray(formData.available_dates) && formData.available_dates.length > 0) {
            // Check if any date is in the past
            const now = new Date();
            const pastDates = formData.available_dates.filter(d => new Date(d.date) < now);
            if (pastDates.length > 0) {
                newErrors.available_dates = 'Có ngày khởi hành trong quá khứ, vui lòng kiểm tra lại';
            }
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

            {/* Validation Summary */}
            {!hasMinimumRequiredData() && (
                <div style={{
                    background: '#fef3c7',
                    border: '2px solid #fbbf24',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e', fontWeight: 600 }}>
                            Cần hoàn thiện thông tin
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#78350f', fontSize: '0.875rem', lineHeight: '1.6' }}>
                            {!formData.destination && <li>Nhập địa điểm</li>}
                            {formData.meeting_point.address.trim().length < 10 && <li>Địa chỉ điểm tập trung</li>}
                            {!/^\d+\s*ngày\s*\d+\s*đêm$/i.test(formData.duration) && <li>Thời gian tour (format: X ngày Y đêm)</li>}
                            {formData.price < 100000 && <li>Giá tour (tối thiểu 100,000 VNĐ)</li>}
                            {formData.capacity.min_participants <= 0 && <li>Số người tối thiểu phải {'>'} 0</li>}
                            {formData.capacity.max_participants <= formData.capacity.min_participants && <li>Số người tối đa phải {'>'} tối thiểu</li>}
                            {formData.highlights.length === 0 && <li>Thêm ít nhất 1 điểm nổi bật</li>}
                            {!formData.image && <li>Link hình ảnh đại diện</li>}
                            {/* Ngày khởi hành bây giờ là optional */}
                        </ul>
                    </div>
                </div>
            )}

            {hasMinimumRequiredData() && (
                <div style={{
                    background: '#d1fae5',
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>✅</span>
                    <div style={{ color: '#065f46', fontWeight: 600, fontSize: '0.875rem' }}>
                        Thông tin cơ bản đã đầy đủ! Bạn có thể tiếp tục sang bước lịch trình.
                    </div>
                </div>
            )}

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
                {errors.title && <span className="error-message">❌ {errors.title}</span>}
                {!errors.title && formData.title.trim().length > 0 && (
                    <span className="success-message">✓ Tên tour hợp lệ</span>
                )}
            </div>            {/* Description */}
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
                {errors.description && <span className="error-message">❌ {errors.description}</span>}
            </div>

            {/* Destination Input */}
            <div className="form-group">
                <label className="form-label">
                    Địa điểm <span className="required">*</span>
                </label>
                <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className={`form-input ${errors.destination ? 'error' : ''}`}
                    placeholder="VD: Hà Nội, Hồ Chí Minh, Đà Nẵng, Nha Trang..."
                    maxLength={200}
                />
                {errors.destination && <span className="error-message">❌ {errors.destination}</span>}
                {!errors.destination && formData.destination && formData.destination.trim().length > 0 && (
                    <span className="success-message">✓ Địa điểm hợp lệ</span>
                )}
                <small className="form-hint">
                    💡 Nhập tên thành phố hoặc khu vực du lịch chính.
                    Có thể nhập nhiều địa điểm cách nhau bằng dấu "-" (VD: Hà Nội - Hạ Long - Sapa)
                </small>
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
                    maxLength={200}
                />
                {errors.meeting_point && <span className="error-message">❌ {errors.meeting_point}</span>}
                {!errors.meeting_point && formData.meeting_point.address.length >= 10 && (
                    <span className="success-message">✓ Địa chỉ hợp lệ</span>
                )}
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
                        maxLength={50}
                    />
                    {errors.duration && <span className="error-message">❌ {errors.duration}</span>}
                    {!errors.duration && /^\d+\s*ngày\s*\d+\s*đêm$/i.test(formData.duration) && (
                        <span className="success-message">✓ Format đúng</span>
                    )}
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
                    <option value="published">✅ Hoạt động - Đang mở đặt chỗ</option>
                </select>
                <small className="form-hint">
                    💡 Chọn "Nháp" nếu chưa muốn công khai tour. Chọn "Hoạt động" khi sẵn sàng nhận booking.
                </small>
            </div>

            {/* Participants */}
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">
                        Số người tối thiểu <span className="required">*</span>
                    </label>
                    <input
                        type="number"
                        name="capacity.min_participants"
                        value={formData.capacity.min_participants}
                        onChange={handleChange}
                        min="1"
                        className={`form-input ${errors.min_participants ? 'error' : ''}`}
                    />
                    {errors.min_participants && <span className="error-message">❌ {errors.min_participants}</span>}
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
                        max="1000"
                        className={`form-input ${errors.max_participants ? 'error' : ''}`}
                    />
                    {errors.max_participants && <span className="error-message">❌ {errors.max_participants}</span>}
                </div>
            </div>
            {errors.participants && <span className="error-message">❌ {errors.participants}</span>}
            {!errors.participants && !errors.min_participants && !errors.max_participants
                && formData.capacity.min_participants > 0
                && formData.capacity.max_participants > formData.capacity.min_participants && (
                    <span className="success-message">✓ Sức chứa hợp lệ ({formData.capacity.min_participants}-{formData.capacity.max_participants} người)</span>
                )}

            {/* Pricing */}
            <div className="pricing-section">
                <h3 className="subsection-title">Giá Tour <span className="required">*</span></h3>
                <div className="form-group">
                    <label className="form-label">
                        Giá Tour (VNĐ/người)
                        {formData.price >= 100000 && formData.price <= 1000000000 && (
                            <span style={{
                                marginLeft: '8px',
                                fontSize: '0.85rem',
                                color: '#10b981',
                                fontWeight: 'normal'
                            }}>
                                ({formData.price.toLocaleString('vi-VN')} ₫)
                            </span>
                        )}
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="100000"
                        max="1000000000"
                        step="10000"
                        className={`form-input ${errors.price ? 'error' : ''}`}
                        placeholder="VD: 5000000"
                    />
                    {errors.price && <span className="error-message">❌ {errors.price}</span>}
                    {!errors.price && formData.price >= 100000 && (
                        <span className="success-message">✓ Giá hợp lệ</span>
                    )}
                    <small className="form-hint">💡 Giá tối thiểu 100,000 VNĐ - Giá áp dụng chung cho mọi độ tuổi</small>
                </div>
            </div>

            {/* Image URL */}
            <div className="form-group">
                <label className="form-label">
                    Link hình ảnh <span className="required">*</span>
                </label>
                <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className={`form-input ${errors.image ? 'error' : ''}`}
                    placeholder="https://example.com/image.jpg"
                />
                {errors.image && <span className="error-message">❌ {errors.image}</span>}
                {!errors.image && formData.image && (
                    <span className="success-message">✓ URL ảnh hợp lệ</span>
                )}
            </div>

            {/* Highlights */}
            <div className="services-section">
                <h3 className="subsection-title">
                    Điểm nổi bật <span className="required">*</span>
                    <span style={{
                        marginLeft: '8px',
                        fontSize: '0.85rem',
                        color: formData.highlights.length === 0 ? '#ef4444' : formData.highlights.length > 10 ? '#f59e0b' : '#10b981',
                        fontWeight: 'normal'
                    }}>
                        ({formData.highlights.length}/10 điểm)
                    </span>
                </h3>
                <div className="add-item-group">
                    <input
                        type="text"
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                        className="form-input"
                        placeholder="VD: Ngắm hoàng hôn tại Bãi Đá Nhảy, Khám phá làng cổ Hội An..."
                        maxLength={200}
                    />
                    <button
                        type="button"
                        onClick={addHighlight}
                        className="btn-add"
                        disabled={formData.highlights.length >= 10}
                    >
                        + Thêm
                    </button>
                </div>
                {errors.highlights && <span className="error-message">❌ {errors.highlights}</span>}
                {!errors.highlights && formData.highlights.length > 0 && formData.highlights.length <= 10 && (
                    <span className="success-message">✓ {formData.highlights.length} điểm nổi bật</span>
                )}
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

            {/* Included Services */}
            <div className="services-section">
                <h3 className="subsection-title">
                    Dịch vụ bao gồm
                    <span style={{
                        marginLeft: '8px',
                        fontSize: '0.85rem',
                        color: formData.included_services.length === 0 ? '#64748b' : '#10b981',
                        fontWeight: 'normal'
                    }}>
                        ({formData.included_services.length} dịch vụ)
                    </span>
                </h3>
                <div className="add-item-group">
                    <input
                        type="text"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                        className="form-input"
                        placeholder="VD: Xe đưa đón, Khách sạn 4 sao, Bữa sáng..."
                        maxLength={150}
                    />
                    <button
                        type="button"
                        onClick={addService}
                        className="btn-add"
                    >
                        + Thêm
                    </button>
                </div>
                <div className="items-list">
                    {(Array.isArray(formData.included_services) ? formData.included_services : []).map((service, index) => (
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
                    <span style={{
                        marginLeft: '8px',
                        fontSize: '0.85rem',
                        color: formData.available_dates.length === 0 ? '#ef4444' : '#10b981',
                        fontWeight: 'normal'
                    }}>
                        ({formData.available_dates.length} ngày)
                    </span>
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
                {errors.available_dates && <span className="error-message">❌ {errors.available_dates}</span>}
                {!errors.available_dates && formData.available_dates.length > 0 && (
                    <span className="success-message">✓ {formData.available_dates.length} ngày khởi hành</span>
                )}
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
                <button
                    type="submit"
                    disabled={loading || !hasMinimumRequiredData()}
                    className="btn-submit"
                    title={!hasMinimumRequiredData() ? 'Vui lòng điền đầy đủ thông tin bắt buộc' : ''}
                >
                    {loading ? '⏳ Đang xử lý...' : (isEditMode ? '✅ Cập nhật & Tiếp tục →' : '✨ Tiếp theo: Lịch trình →')}
                </button>
            </div>
        </form>
    );
};

export default BasicInfoForm;
