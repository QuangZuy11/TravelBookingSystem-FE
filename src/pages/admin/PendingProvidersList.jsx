import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/ui/Spinner';
import './PendingProvidersList.css';

const PendingProvidersList = () => {
    const navigate = useNavigate();
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, hotel, tour, flight
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPendingProviders();
    }, []);

    const fetchPendingProviders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/admin/service-providers/pending', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProviders(response.data.data || []);
            toast.success(`Tải thành công ${response.data.data?.length || 0} providers`);
        } catch (error) {
            console.error('Error fetching providers:', error);
            toast.error('Lỗi khi tải danh sách providers: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Filter by service type
    const filteredByType = filter === 'all'
        ? providers
        : providers.filter(p => p.type.includes(filter));

    // Filter by search term
    const filteredProviders = searchTerm
        ? filteredByType.filter(p =>
            p.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : filteredByType;

    const getFilterCount = (type) => {
        if (type === 'all') return providers.length;
        return providers.filter(p => p.type.includes(type)).length;
    };

    if (loading) {
        return (
            <div className="pending-providers-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải danh sách providers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pending-providers-page">
            {/* Page Header */}
            <div className="page-header">
                <h1>🔔 Service Providers Chờ Xét Duyệt</h1>
                <p className="subtitle">Quản lý và xét duyệt các providers đang chờ phê duyệt</p>
            </div>

            {/* Search & Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên công ty, email, người liên hệ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-buttons">
                    <button
                        onClick={() => setFilter('all')}
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    >
                        Tất cả <span className="count">{getFilterCount('all')}</span>
                    </button>
                    <button
                        onClick={() => setFilter('hotel')}
                        className={`filter-btn ${filter === 'hotel' ? 'active' : ''}`}
                    >
                        🏨 Hotel <span className="count">{getFilterCount('hotel')}</span>
                    </button>
                    <button
                        onClick={() => setFilter('tour')}
                        className={`filter-btn ${filter === 'tour' ? 'active' : ''}`}
                    >
                        🗺️ Tour <span className="count">{getFilterCount('tour')}</span>
                    </button>
                    <button
                        onClick={() => setFilter('flight')}
                        className={`filter-btn ${filter === 'flight' ? 'active' : ''}`}
                    >
                        ✈️ Flight <span className="count">{getFilterCount('flight')}</span>
                    </button>

                    <button
                        onClick={fetchPendingProviders}
                        className="filter-btn btn-refresh"
                    >
                        🔄 Làm mới
                    </button>
                </div>
            </div>

            {/* Providers Grid */}
            {filteredProviders.length > 0 ? (
                <div className="providers-grid">
                    {filteredProviders.map(provider => {
                        const pendingLicenses = provider.licenses.filter(l => l.verification_status === 'pending').length;
                        const verifiedLicenses = provider.licenses.filter(l => l.verification_status === 'verified').length;
                        const rejectedLicenses = provider.licenses.filter(l => l.verification_status === 'rejected').length;

                        return (
                            <div key={provider._id} className="provider-card">
                                {/* Card Header */}
                                <div className="card-header">
                                    <div className="company-info">
                                        <h3>{provider.company_name}</h3>
                                        <div className="created-date">
                                            📅 {new Date(provider.created_at).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                    {provider.admin_verified ? (
                                        <span className="status-badge badge-verified">
                                            ✓ Đã xác minh
                                        </span>
                                    ) : provider.admin_rejection_reason ? (
                                        <span className="status-badge badge-rejected">
                                            ✗ Từ chối
                                        </span>
                                    ) : (
                                        <span className="status-badge badge-pending">
                                            ⏳ Chờ
                                        </span>
                                    )}
                                </div>

                                {/* Card Body */}
                                <div className="card-body">
                                    <div className="contact-info">
                                        <div className="info-row">
                                            <span className="icon">👤</span>
                                            <span>{provider.contact_person}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="icon">📧</span>
                                            <span>{provider.email}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="icon">📞</span>
                                            <span>{provider.phone}</span>
                                        </div>
                                    </div>

                                    <div className="service-types">
                                        {provider.type.map(type => (
                                            <span
                                                key={type}
                                                className={`service-badge ${type}`}
                                            >
                                                {type === 'hotel' ? '🏨' : type === 'tour' ? '🗺️' : '✈️'} {type.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="license-stats">
                                        {pendingLicenses > 0 && (
                                            <span className="stat-badge pending">
                                                ⏳ {pendingLicenses} chờ duyệt
                                            </span>
                                        )}
                                        {verifiedLicenses > 0 && (
                                            <span className="stat-badge verified">
                                                ✓ {verifiedLicenses} đã duyệt
                                            </span>
                                        )}
                                        {rejectedLicenses > 0 && (
                                            <span className="stat-badge rejected">
                                                ✗ {rejectedLicenses} từ chối
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="card-footer">
                                    <button
                                        onClick={() => navigate(`/admin/providers/${provider._id}`)}
                                        className="btn-view-detail"
                                    >
                                        Xem chi tiết & Xét duyệt
                                        <span>→</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="icon">📭</div>
                    <h3>
                        {searchTerm ? 'Không tìm thấy kết quả' : 'Không có provider nào chờ xét duyệt'}
                    </h3>
                    <p>
                        {searchTerm
                            ? 'Thử tìm kiếm với từ khóa khác'
                            : 'Tất cả providers đã được xét duyệt hoặc chưa có đăng ký mới'}
                    </p>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="btn-clear-filter"
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            )}

            {/* Summary Stats */}
            {providers.length > 0 && (
                <div className="summary-stats">
                    <h3>📊 Thống kê tổng quan</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-value blue">{providers.length}</div>
                            <div className="stat-label">Tổng providers</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value yellow">
                                {providers.reduce((sum, p) => sum + p.licenses.filter(l => l.verification_status === 'pending').length, 0)}
                            </div>
                            <div className="stat-label">Licenses chờ duyệt</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value green">
                                {providers.reduce((sum, p) => sum + p.licenses.filter(l => l.verification_status === 'verified').length, 0)}
                            </div>
                            <div className="stat-label">Licenses đã duyệt</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value red">
                                {providers.reduce((sum, p) => sum + p.licenses.filter(l => l.verification_status === 'rejected').length, 0)}
                            </div>
                            <div className="stat-label">Licenses bị từ chối</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingProvidersList;
