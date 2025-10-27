import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import hotelService from '../../../services/hotelService';
import promotionService from '../../../services/promotionService';
import './PromotionCreatePage.css';

const initialFormState = {
  targetType: 'hotel',
  targetId: '',
  name: '',
  code: '',
  description: '',
  discountType: 'percent',
  discountValue: '',
  startDate: '',
  endDate: '',
};

const PromotionCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [providerId, setProviderId] = useState('');
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load provider info from localStorage
  useEffect(() => {
    const providerStr = localStorage.getItem('provider');
    if (!providerStr) {
      toast.error('Không tìm thấy thông tin provider. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      const parsed = JSON.parse(providerStr);
      if (parsed?._id) {
        setProviderId(parsed._id);
      } else if (parsed?.provider_id) {
        setProviderId(parsed.provider_id);
      } else if (parsed?.provider?._id) {
        setProviderId(parsed.provider._id);
      } else {
        toast.error('Không xác định được providerId.');
      }
    } catch (error) {
      console.error('Error parsing provider from localStorage', error);
      toast.error('Không đọc được thông tin provider.');
    }
  }, []);

  // Fetch hotels for provider
  useEffect(() => {
    const fetchHotels = async () => {
      if (!providerId) return;

      setIsLoading(true);
      try {
        const response = await hotelService.getProviderHotels(providerId, {
          limit: 100,
        });
        const list = response?.data?.data || response?.data?.hotels || response?.data || [];
        setHotels(Array.isArray(list) ? list : []);

        if (Array.isArray(list) && list.length && !formData.targetId) {
          setFormData((prev) => ({ ...prev, targetId: list[0]._id }));
        }
      } catch (error) {
        console.error('Failed to fetch provider hotels', error);
        toast.error('Không tải được danh sách khách sạn.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.targetId) {
      toast.error('Vui lòng chọn khách sạn áp dụng.');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên chương trình.');
      return;
    }
    if (!formData.code.trim()) {
      toast.error('Vui lòng nhập mã giảm giá.');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error('Vui lòng chọn thời gian áp dụng.');
      return;
    }

    const payload = {
      ...formData,
      discountValue: Number(formData.discountValue),
    };

    setIsSubmitting(true);
    try {
      await promotionService.createPromotion(payload);
      toast.success('Tạo mã giảm giá thành công!');
      setFormData(initialFormState);
      if (hotels.length) {
        setFormData((prev) => ({ ...prev, targetType: 'hotel', targetId: hotels[0]._id }));
      }
      navigate('/provider/promotions', { replace: true });
    } catch (error) {
      console.error('Failed to create promotion', error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tạo mã giảm giá, vui lòng thử lại.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderNumericInput = (name, label, placeholder, options = {}) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type="number"
        min={options.min ?? 0}
        step={options.step ?? 1}
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        required={options.required ?? false}
      />
    </div>
  );

  return (
    <div className="promotion-page">
      <div className="promotion-card">
        <div className="promotion-card__header">
          <h2>Tạo mã giảm giá</h2>
          <p>Thiết lập ưu đãi dành riêng cho khách hàng của bạn.</p>
        </div>

        {isLoading ? (
          <div className="promotion-loading">Đang tải danh sách khách sạn...</div>
        ) : hotels.length === 0 ? (
          <div className="promotion-empty">
            <p>Bạn chưa có khách sạn nào. Hãy tạo khách sạn trước khi thêm mã giảm giá.</p>
          </div>
        ) : (
          <form className="promotion-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="targetId">Khách sạn áp dụng</label>
              <select
                id="targetId"
                name="targetId"
                value={formData.targetId}
                onChange={handleChange}
              >
                {hotels.map((hotel) => (
                  <option key={hotel._id} value={hotel._id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="name">Tên chương trình</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Ví dụ: Summer Flash Sale"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-inline">
              <div className="form-group">
                <label htmlFor="code">Mã giảm giá</label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  placeholder="SUMMER25"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  maxLength={30}
                />
              </div>
              <div className="form-group">
                <label htmlFor="discountType">Loại giảm</label>
                <select
                  id="discountType"
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                >
                  <option value="percent">Phần trăm (%)</option>
                  <option value="amount">Số tiền (VND)</option>
                </select>
              </div>
              {renderNumericInput(
                'discountValue',
                formData.discountType === 'percent' ? 'Giá trị (%)' : 'Giá trị (VND)',
                formData.discountType === 'percent' ? 'Tối đa 100' : 'Ví dụ: 200000',
                {
                  min: 1,
                  step: formData.discountType === 'percent' ? 1 : 1000,
                  required: true,
                }
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả (tuỳ chọn)</label>
              <textarea
                id="description"
                name="description"
                placeholder="Thông tin chi tiết về chương trình..."
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-inline">
              <div className="form-group">
                <label htmlFor="startDate">Ngày bắt đầu</label>
                <input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">Ngày kết thúc</label>
                <input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/provider/promotions')}
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Đang tạo...' : 'Tạo mã giảm giá'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PromotionCreatePage;
