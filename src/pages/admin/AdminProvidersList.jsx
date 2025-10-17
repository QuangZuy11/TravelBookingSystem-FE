import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllServiceProviders, getPendingVerifications } from '../../services/serviceProviderService';
import { getServiceTypeDisplay, getLicenseStatusConfig } from '../../utils/licenseValidation';

const AdminProvidersList = () => {
    const navigate = useNavigate();
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        verification_status: '',
        service_type: '',
        page: 1,
        limit: 20
    });

    useEffect(() => {
        fetchProviders();
    }, [filters]);

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const response = await getAllServiceProviders(filters);
            if (response.success) {
                setProviders(response.data.providers || response.data);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Không thể tải danh sách providers');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value, page: 1 });
    };

    const viewDetail = (providerId) => {
        navigate(`/admin/providers/${providerId}`);
    };

    if (loading) return <div className="admin-loading"><div className="spinner"></div><p>Đang tải...</p></div>;

    return (
        <div className="admin-providers-list">
            <div className="admin-header">
                <h1>Quản lý Service Providers</h1>
                <p>Tổng số: {providers.length} providers</p>
            </div>

            {/* Filters */}
            <div className="filters-container">
                <select value={filters.verification_status} onChange={(e) => handleFilterChange('verification_status', e.target.value)}>
                    <option value="">Tất cả trạng thái</option>
                    <option value="pending">⏳ Chờ xác minh</option>
                    <option value="verified">✅ Đã xác minh</option>
                    <option value="rejected">❌ Bị từ chối</option>
                </select>

                <select value={filters.service_type} onChange={(e) => handleFilterChange('service_type', e.target.value)}>
                    <option value="">Tất cả dịch vụ</option>
                    <option value="hotel">🏨 Hotel</option>
                    <option value="tour">🗺️ Tour</option>
                </select>

                <button onClick={() => setFilters({ verification_status: '', service_type: '', page: 1, limit: 20 })} className="btn-secondary">
                    Xóa bộ lọc
                </button>
            </div>

            {/* Providers Table */}
            <div className="providers-table-container">
                <table className="providers-table">
                    <thead>
                        <tr>
                            <th>Công ty</th>
                            <th>Email</th>
                            <th>Loại dịch vụ</th>
                            <th>Số licenses</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {providers.map(provider => {
                            const pendingCount = provider.licenses?.filter(l => l.verification_status === 'pending').length || 0;
                            const verifiedCount = provider.licenses?.filter(l => l.verification_status === 'verified').length || 0;

                            return (
                                <tr key={provider._id}>
                                    <td><strong>{provider.company_name}</strong></td>
                                    <td>{provider.email}</td>
                                    <td>
                                        <div className="service-types-cell">
                                            {provider.type?.map(t => (
                                                <span key={t} className="badge-service">{getServiceTypeDisplay(t)}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="licenses-count">
                                            {verifiedCount} / {provider.licenses?.length || 0}
                                            {pendingCount > 0 && <span className="pending-badge"> ({pendingCount} chờ)</span>}
                                        </span>
                                    </td>
                                    <td>
                                        {pendingCount > 0 ? (
                                            <span className="status-badge badge-pending">⏳ Chờ xác minh</span>
                                        ) : verifiedCount === provider.licenses?.length ? (
                                            <span className="status-badge badge-verified">✅ Đã xác minh</span>
                                        ) : (
                                            <span className="status-badge badge-rejected">❌ Có từ chối</span>
                                        )}
                                    </td>
                                    <td>
                                        <button onClick={() => viewDetail(provider._id)} className="btn-primary btn-small">
                                            Xem chi tiết →
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {providers.length === 0 && (
                    <div className="empty-state">
                        <p>Không tìm thấy provider nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProvidersList;
