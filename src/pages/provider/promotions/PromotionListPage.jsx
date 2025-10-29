import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import promotionService from '../../../services/promotionService';
import './PromotionListPage.css';

const PromotionListPage = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [providerTypes, setProviderTypes] = useState([]);

  useEffect(() => {
    const providerStr = localStorage.getItem('provider');
    if (!providerStr) return;

    try {
      const parsed = JSON.parse(providerStr);
      const licenseTypes =
        parsed?.licenses && Array.isArray(parsed.licenses)
          ? [...new Set(parsed.licenses.map((item) => item.service_type))]
          : [];
      const combinedTypes =
        licenseTypes.length === 0 && Array.isArray(parsed?.type) ? parsed.type : licenseTypes;
      setProviderTypes(Array.isArray(combinedTypes) ? combinedTypes : []);
    } catch (err) {
      console.error('Failed to parse provider from localStorage', err);
    }
  }, []);

  const canCreateHotel = useMemo(() => providerTypes.includes('hotel'), [providerTypes]);
  const canCreateTour = useMemo(() => providerTypes.includes('tour'), [providerTypes]);

  const fetchPromotions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await promotionService.getMyPromotions();
      const data = response?.data?.data || [];
      setPromotions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load promotions', err);
      setError(err?.response?.data?.message || 'Kh\u00F4ng t\u1EA3i \u0111\u01B0\u1EE3c danh s\u00E1ch m\u00E3 gi\u1EA3m gi\u00E1.');
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
      return <span className="badge badge-scheduled">{'Ch\u01B0a k\u00EDch ho\u1EA1t'}</span>;
    }
    if (Number.isFinite(end) && now > end) {
      return <span className="badge badge-expired">{'\u0110\u00E3 k\u1EBFt th\u00FAc'}</span>;
    }
    return <span className="badge badge-active">{'\u0110ang \u00E1p d\u1EE5ng'}</span>;
  };

  const handleCreate = (targetType) => {
    if (targetType) {
      navigate('/provider/promotions/create', { state: { targetType } });
    } else {
      navigate('/provider/promotions/create');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(
      () => toast.success('\u0110\u00E3 sao ch\u00E9p m\u00E3'),
      () => toast.error('Sao ch\u00E9p th\u1EA5t b\u1EA1i')
    );
  };

  const handleEdit = (promotion) => {
    navigate(`/provider/promotions/${promotion._id}/edit`, { state: { promotion } });
  };

  const handleDelete = async (promotion) => {
    const confirmed = window.confirm(`B\u1EA1n c\u00F3 ch\u1EAFc mu\u1ED1n x\u00F3a m\u00E3 ${promotion.code}?`);
    if (!confirmed) return;

    try {
      await promotionService.deletePromotion(promotion._id);
      toast.success('\u0110\u00E3 x\u00F3a m\u00E3 gi\u1EA3m gi\u00E1');
      fetchPromotions();
    } catch (err) {
      console.error('Failed to delete promotion', err);
      toast.error(err?.response?.data?.message || 'Kh\u00F4ng th\u1EC3 x\u00F3a m\u00E3 gi\u1EA3m gi\u00E1.');
    }
  };

  return (
    <div className="promotion-list-page">
      <div className="promotion-list-header">
        <div className="promotion-list-info">
          <h2>{'\u0110anh s\u00E1ch khuy\u1EBFn m\u00E3i'}</h2>
          <p>{'Qu\u1EA3n l\u00FD c\u00E1c ch\u01B0\u01A1ng tr\u00ECnh \u01B0u \u0111\u00E3i cho kh\u00E1ch s\u1EA1n v\u00E0 tour c\u1EE7a b\u1EA1n.'}</p>
        </div>
        <div className="promotion-list-actions">
          {canCreateHotel && (
            <button className="btn-primary" onClick={() => handleCreate('hotel')}>
              {'T\u1EA1o m\u00E3 cho kh\u00E1ch s\u1EA1n'}
            </button>
          )}
          {canCreateTour && (
            <button className="btn-primary" onClick={() => handleCreate('tour')}>
              {'T\u1EA1o m\u00E3 cho tour'}
            </button>
          )}
          {!canCreateHotel && !canCreateTour && (
            <button className="btn-primary" onClick={() => handleCreate()}>
              {'T\u1EA1o m\u00E3 gi\u1EA3m gi\u00E1'}
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="promotion-list-loading">{'\u0110ang t\u1EA3i...'}</div>
      ) : error ? (
        <div className="promotion-list-error">{error}</div>
      ) : promotions.length === 0 ? (
        <div className="promotion-list-empty">
          <p>{'Ch\u01B0a c\u00F3 m\u00E3 gi\u1EA3m gi\u00E1 n\u00E0o. H\u00E3y t\u1EA1o m\u00E3 m\u1EDBi \u0111\u1EC3 thu h\u00FAt kh\u00E1ch h\u00E0ng.'}</p>
        </div>
      ) : (
        <div className="promotion-table-wrapper">
          <table className="promotion-table">
            <thead>
              <tr>
                <th>{'Ch\u01B0\u01A1ng tr\u00ECnh'}</th>
                <th>{'M\u00E3'}</th>
                <th>{'\u00C1p d\u1EE5ng'}</th>
                <th>{'Gi\u00E1 tr\u1ECB'}</th>
                <th>{'Th\u1EDDi gian'}</th>
                <th>{'Tr\u1EA1ng th\u00E1i'}</th>
                <th>{'H\u00E0nh \u0111\u1ED9ng'}</th>
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
                  <td>{promotion.targetType === 'hotel' ? 'Kh\u00E1ch s\u1EA1n' : 'Tour'}</td>
                  <td>
                    {promotion.discountType === 'percent'
                      ? `Gi\u1EA3m ${promotion.discountValue}%`
                      : `Gi\u1EA3m ${promotion.discountValue.toLocaleString('vi-VN')} VND`}
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
                  <td>
                    <div className="promotion-actions">
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => handleEdit(promotion)}
                      >
                        {'S\u1EEDa'}
                      </button>
                      <button
                        type="button"
                        className="btn-link btn-link-danger"
                        onClick={() => handleDelete(promotion)}
                      >
                        {'X\u00F3a'}
                      </button>
                    </div>
                  </td>
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

