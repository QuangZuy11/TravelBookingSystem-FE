import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import hotelService from '../../../services/hotelService';
import { tourApi } from '../../../api/tourApi';
import promotionService from '../../../services/promotionService';
import './PromotionCreatePage.css';

const initialFormState = {
  targetType: '',
  targetId: '',
  name: '',
  code: '',
  description: '',
  discountType: 'percent',
  discountValue: '',
  startDate: '',
  endDate: '',
};

const toInputDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const PromotionFormPage = ({ mode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const forcedTargetTypeFromState = useMemo(() => {
    if (mode !== 'create') return null;
    const raw = location.state?.targetType;
    if (raw === 'hotel' || raw === 'tour') {
      return raw;
    }
    return null;
  }, [location.state, mode]);

  const [formData, setFormData] = useState({
    ...initialFormState,
    targetType: forcedTargetTypeFromState || '',
  });
  const [providerId, setProviderId] = useState('');
  const [hotels, setHotels] = useState([]);
  const [tours, setTours] = useState([]);
  const [isLoadingTargets, setIsLoadingTargets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promotionData, setPromotionData] = useState(null);
  const [isPromotionLoading, setIsPromotionLoading] = useState(mode === 'edit');

  const promotionId = mode === 'edit' ? params.promotionId : null;

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

  useEffect(() => {
    const loadPromotion = async () => {
      if (mode !== 'edit' || !promotionId) return;
      setIsPromotionLoading(true);
      try {
        const response = await promotionService.getPromotionById(promotionId);
        const data = response?.data?.data;
        if (!data) {
          toast.error('Không tìm thấy thông tin khuyến mãi.');
          navigate('/provider/promotions');
          return;
        }
        setPromotionData(data);
      } catch (error) {
        console.error('Failed to load promotion detail', error);
        toast.error(error?.response?.data?.message || 'Không tải được thông tin khuyến mãi.');
        navigate('/provider/promotions');
      } finally {
        setIsPromotionLoading(false);
      }
    };

    loadPromotion();
  }, [mode, navigate, promotionId]);

  useEffect(() => {
    if (!providerId) return;

    const fetchTargets = async () => {
      setIsLoadingTargets(true);
      let hotelList = [];
      let tourList = [];

      try {
        const response = await hotelService.getProviderHotels(providerId, { limit: 100 });
        hotelList = response?.data?.data || response?.data?.hotels || response?.data || [];
        hotelList = Array.isArray(hotelList) ? hotelList : [];
      } catch (error) {
        console.error('Failed to fetch provider hotels', error);
        toast.error('Không tải được danh sách khách sạn.');
      }

      try {
        const response = await tourApi.getProviderTours(providerId, { limit: 100 });
        tourList = response?.data || response?.tours || response || [];
        tourList = Array.isArray(tourList) ? tourList : [];
      } catch (error) {
        console.error('Failed to fetch provider tours', error);
        toast.error('Không tải được danh sách tour.');
      }

      if (mode === 'create' && forcedTargetTypeFromState === 'hotel' && hotelList.length === 0) {
        toast.error('Bạn chưa có khách sạn nào để tạo mã giảm giá.');
        setIsLoadingTargets(false);
        navigate('/provider/promotions');
        return;
      }

      if (mode === 'create' && forcedTargetTypeFromState === 'tour' && tourList.length === 0) {
        toast.error('Bạn chưa có tour nào để tạo mã giảm giá.');
        setIsLoadingTargets(false);
        navigate('/provider/promotions');
        return;
      }

      setHotels(hotelList);
      setTours(tourList);
      setIsLoadingTargets(false);
    };

    fetchTargets();
  }, [forcedTargetTypeFromState, mode, navigate, providerId]);

  useEffect(() => {
    const hasHotels = hotels.length > 0;
    const hasTours = tours.length > 0;

    if (mode === 'edit' && promotionData) {
      setFormData((prev) => ({
        ...prev,
        targetType: promotionData.targetType,
        targetId: promotionData.targetId,
        name: promotionData.name || '',
        code: promotionData.code || '',
        description: promotionData.description || '',
        discountType: promotionData.discountType || 'percent',
        discountValue:
          promotionData.discountValue !== undefined ? promotionData.discountValue.toString() : '',
        startDate: toInputDateTime(promotionData.startDate),
        endDate: toInputDateTime(promotionData.endDate),
      }));
      return;
    }

    if (mode === 'create' && !promotionData) {
      setFormData((prev) => {
        const next = { ...prev };
        if (forcedTargetTypeFromState) {
          next.targetType = forcedTargetTypeFromState;
        } else if (!next.targetType) {
          next.targetType = hasHotels ? 'hotel' : hasTours ? 'tour' : '';
        }

        if (next.targetType === 'hotel') {
          const exists = hotels.some((hotel) => hotel._id === next.targetId);
          next.targetId = exists ? next.targetId : hotels[0]?._id || '';
        } else if (next.targetType === 'tour') {
          const exists = tours.some((tour) => tour._id === next.targetId);
          next.targetId = exists ? next.targetId : tours[0]?._id || '';
        }
        return next;
      });
    }
  }, [forcedTargetTypeFromState, hotels, mode, promotionData, tours]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'targetType') {
      if (mode === 'create' && forcedTargetTypeFromState) {
        return;
      }

      const list = value === 'tour' ? tours : hotels;
      if (!Array.isArray(list) || list.length === 0) {
        toast.error(
          value === 'tour'
            ? 'Bạn chưa có tour nào để áp dụng mã giảm giá.'
            : 'Bạn chưa có khách sạn nào để áp dụng mã giảm giá.'
        );
        return;
      }

      setFormData((prev) => ({
        ...prev,
        targetType: value,
        targetId: list[0]?._id || '',
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const currentTargets = useMemo(() => {
    if (formData.targetType === 'tour') {
      return tours;
    }
    if (formData.targetType === 'hotel') {
      return hotels;
    }
    return [];
  }, [formData.targetType, hotels, tours]);

  const hasAnyTargets = hotels.length > 0 || tours.length > 0;
  const showTargetTypeSelect =
    (mode === 'edit' || !forcedTargetTypeFromState) && hotels.length > 0 && tours.length > 0;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.targetType) {
      toast.error('Vui lòng chọn loại dịch vụ áp dụng.');
      return;
    }
    if (!formData.targetId) {
      toast.error('Vui lòng chọn dịch vụ áp dụng.');
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

    const discountValueNumber = Number(formData.discountValue);
    if (Number.isNaN(discountValueNumber) || discountValueNumber <= 0) {
      toast.error('Giá trị giảm phải là số dương.');
      return;
    }

    if (formData.discountType === 'percent' && discountValueNumber > 100) {
      toast.error('Giảm phần trăm không được vượt quá 100%.');
      return;
    }

    const payload = {
      ...formData,
      discountValue: discountValueNumber,
    };

    setIsSubmitting(true);
    try {
      if (mode === 'edit' && promotionId) {
        await promotionService.updatePromotion(promotionId, payload);
        toast.success('Cập nhật mã giảm giá thành công!');
      } else {
        await promotionService.createPromotion(payload);
        toast.success('Tạo mã giảm giá thành công!');
      }
      navigate('/provider/promotions', { replace: true });
    } catch (error) {
      console.error('Failed to submit promotion', error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể lưu mã giảm giá, vui lòng thử lại.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageTitle = mode === 'edit' ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá';
  const submitLabel = isSubmitting
    ? mode === 'edit'
      ? 'Đang cập nhật...'
      : 'Đang tạo...'
    : mode === 'edit'
    ? 'Lưu thay đổi'
    : 'Tạo mã giảm giá';

  return (
    <div className="promotion-page">
      <div className="promotion-card">
        <div className="promotion-card__header">
          <h2>{pageTitle}</h2>
          <p>Thiết lập ưu đãi dành riêng cho khách hàng của bạn.</p>
        </div>

        {isPromotionLoading || isLoadingTargets ? (
          <div className="promotion-loading">Đang tải dữ liệu...</div>
        ) : !hasAnyTargets ? (
          <div className="promotion-empty">
            <p>
              Bạn chưa có dịch vụ phù hợp để tạo mã giảm giá. Hãy thêm khách sạn hoặc tour trước khi tiếp tục.
            </p>
          </div>
        ) : (
          <form className="promotion-form" onSubmit={handleSubmit}>
            {showTargetTypeSelect && (
              <div className="form-group">
                <label htmlFor="targetType">Loại dịch vụ</label>
                <select
                  id="targetType"
                  name="targetType"
                  value={formData.targetType}
                  onChange={handleChange}
                >
                  <option value="hotel">Khách sạn</option>
                  <option value="tour">Tour</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="targetId">
                {formData.targetType === 'tour' ? 'Tour áp dụng' : 'Khách sạn áp dụng'}
              </label>
              <select
                id="targetId"
                name="targetId"
                value={formData.targetId}
                onChange={handleChange}
              >
                {currentTargets.map((target) => (
                  <option key={target._id} value={target._id}>
                    {target.name || target.title}
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
              <div className="form-group">
                <label htmlFor="discountValue">
                  {formData.discountType === 'percent' ? 'Giá trị (%)' : 'Giá trị (VND)'}
                </label>
                <input
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  min={formData.discountType === 'percent' ? 1 : 1000}
                  step={formData.discountType === 'percent' ? 1 : 1000}
                  placeholder={formData.discountType === 'percent' ? 'Tối đa 100' : 'Ví dụ: 200000'}
                  value={formData.discountValue}
                  onChange={handleChange}
                  required
                />
              </div>
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
                Huỷ
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {submitLabel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PromotionFormPage;
