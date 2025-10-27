import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import promotionService from '../../../services/promotionService';
import './PromotionListPage.css';
import toast from 'react-hot-toast';

const PromotionListPage = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPromotions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await promotionService.getMyPromotions();
      const data = response?.data?.data || [];
      setPromotions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load promotions', err);
      setError(err?.response?.data?.message || 'Không tải được danh sách mã giảm giá.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const renderStatusBadge = (promotion) => {
    const now = Date.now();
    const start = new Date(promotion.startDate).getTime();
    const end = new Date(promotion.endDate).getTime();

    if (Number.isFinite(start) && now < start) {
      return <span className="badge badge-scheduled">Chưa bắt đầu</span>;
    }
    if (Number.isFinite(end) && now > end) {
      return <span className="badge badge-expired">Đã kết thúc</span>;
    }
    return <span className="badge badge-active">Đang áp dụng</span>;
  };

  const handleCreate = () => {
    navigate('/provider/promotions/create');
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(
      () => toast.success('Đã sao chép mã'),
      () => toast.error('Sao chép thất bại')
    );
  };

  return (
    <div className="promotion-list-page">
      <div className="promotion-list-header">
        <div className="promotion-list-info">
          <h2>Danh sách mã giảm giá</h2>
          <p>Theo dõi các chương trình ưu đãi dành cho khách sạn của bạn.</p>
        </div>
        <div className="promotion-list-actions">
          <button className="btn-primary" onClick={handleCreate}>
              Tạo mã giảm giá
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="promotion-list-loading">Đang tải...</div>
      ) : error ? (
        <div className="promotion-list-error">{error}</div>
      ) : promotions.length === 0 ? (
        <div className="promotion-list-empty">
          <p>Chưa có mã giảm giá nào. Hãy tạo mã mới để thu hút khách hàng!</p>
        </div>
      ) : (
        <div className="promotion-table-wrapper">
          <table className="promotion-table">
            <thead>
              <tr>
                <th>Chương trình</th>
                <th>Mã</th>
                <th>Áp dụng</th>
                <th>Giá trị</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <tr key={promotion._id}>
                  <td>
                    <div className="promotion-name">
                      <strong>{promotion.name}</strong>
                      {promotion.description && (
                        <span className="promotion-desc">{promotion.description}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="promotion-code"
                      onClick={() => handleCopyCode(promotion.code)}
                    >
                      {promotion.code}
                    </button>
                  </td>
                  <td>{promotion.targetType === 'hotel' ? 'Khách sạn' : 'Tour'}</td>
                  <td>
                    {promotion.discountType === 'percent'
                      ? `Giảm ${promotion.discountValue}%`
                      : `Giảm ${promotion.discountValue.toLocaleString('vi-VN')} VND`}
                  </td>
                  <td>
                    <div className="promotion-time">
                      <span>
                        {new Date(promotion.startDate).toLocaleString('vi-VN')} -{' '}
                        {new Date(promotion.endDate).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </td>
                  <td>{renderStatusBadge(promotion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PromotionListPage;
