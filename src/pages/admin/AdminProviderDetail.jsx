import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    getServiceProviderDetail,
    verifyLicense
} from '../../services/serviceProviderService';
import {
    getServiceTypeDisplay,
    getLicenseStatusConfig,
    canAddLicense
} from '../../utils/licenseValidation';
import AddHotelLicenseModal from '../../components/provider/AddHotelLicenseModal';
import './AdminProviderDetail.css';

const AdminProviderDetail = () => {
    const { providerId } = useParams();
    const navigate = useNavigate();
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [processingLicense, setProcessingLicense] = useState(null);

    useEffect(() => {
        fetchProviderDetail();
    }, [providerId]);

    const fetchProviderDetail = async () => {
        try {
            setLoading(true);
            const response = await getServiceProviderDetail(providerId);

            if (response.success) {
                setProvider(response.data);
            }
        } catch (error) {
            console.error('Error fetching provider:', error);
            toast.error('Không thể tải thông tin provider');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyLicense = async (license) => {
        const confirmed = window.confirm(
            `Xác minh giấy phép "${license.license_number}"?\n\nSau khi xác minh, provider sẽ có thể quản lý ${getServiceTypeDisplay(license.service_type)}.`
        );

        if (!confirmed) return;

        setProcessingLicense(license._id);

        try {
            const response = await verifyLicense(providerId, {
                service_type: license.service_type,
                status: 'verified'
            });

            if (response.success) {
                toast.success('✅ Đã xác minh thành công!');
                fetchProviderDetail();
            }
        } catch (error) {
            console.error('Verify error:', error);
            toast.error(error.response?.data?.message || 'Xác minh thất bại');
        } finally {
            setProcessingLicense(null);
        }
    };

    const handleRejectLicense = async (license) => {
        const reason = prompt(
            `Nhập lý do từ chối giấy phép "${license.license_number}":\n\n(Provider sẽ nhận được thông báo này)`
        );

        if (!reason || !reason.trim()) {
            toast.error('Bạn phải nhập lý do từ chối!');
            return;
        }

        setProcessingLicense(license._id);

        try {
            const response = await verifyLicense(providerId, {
                service_type: license.service_type,
                status: 'rejected',
                rejection_reason: reason.trim()
            });

            if (response.success) {
                toast.success('✅ Đã từ chối!');
                fetchProviderDetail();
            }
        } catch (error) {
            console.error('Reject error:', error);
            toast.error(error.response?.data?.message || 'Từ chối thất bại');
        } finally {
            setProcessingLicense(null);
        }
    };

    const handleAddLicenseSuccess = () => {
        fetchProviderDetail();
        setShowAddModal(false);
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
                <p>Đang tải thông tin provider...</p>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="admin-error">
                <h2>❌ Không tìm thấy provider</h2>
                <button onClick={() => navigate('/admin/providers')} className="btn-primary">
                    ← Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="admin-provider-detail">
            {/* Header */}
            <div className="admin-header">
                <div className="header-left">
                    <button onClick={() => navigate('/admin/providers')} className="btn-back">
                        ← Quay lại
                    </button>
                    <div className="provider-info">
                        <h1>{provider.company_name}</h1>
                        <p className="provider-email">📧 {provider.email}</p>
                        <p className="provider-phone">📱 {provider.phone || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Company Details */}
            <div className="info-card">
                <h2>Thông tin công ty</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Tên công ty:</label>
                        <span>{provider.company_name}</span>
                    </div>
                    <div className="info-item">
                        <label>Người liên hệ:</label>
                        <span>{provider.contact_person || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <label>Email:</label>
                        <span>{provider.email}</span>
                    </div>
                    <div className="info-item">
                        <label>Điện thoại:</label>
                        <span>{provider.phone || 'N/A'}</span>
                    </div>
                    <div className="info-item full-width">
                        <label>Địa chỉ:</label>
                        <span>{provider.address || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Service Types */}
            <div className="info-card">
                <h2>Loại hình dịch vụ đã đăng ký</h2>
                <div className="service-types-badges">
                    {(Array.isArray(provider.type) ? provider.type : [provider.type]).map(type => (
                        <span key={type} className="service-type-badge">
                            {getServiceTypeDisplay(type)}
                        </span>
                    ))}
                </div>
            </div>

            {/* Licenses Section */}
            <div className="licenses-section">
                <div className="section-header">
                    <h2>Giấy phép kinh doanh ({(Array.isArray(provider.licenses) ? provider.licenses : []).length})</h2>

                    {/* ⚠️ QUAN TRỌNG: Button ADD CHỈ cho HOTEL */}
                    {(Array.isArray(provider.type) ? provider.type : [provider.type]).includes('hotel') && (
                        <button onClick={() => setShowAddModal(true)} className="btn-primary btn-add-license">
                            ➕ Thêm license Hotel
                        </button>
                    )}
                </div>

                <div className="licenses-table-container">
                    <table className="licenses-table">
                        <thead>
                            <tr>
                                <th>Service Type</th>
                                <th>License Number</th>
                                <th>Status</th>
                                <th>Ngày xác minh</th>
                                <th>Tài liệu</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Array.isArray(provider.licenses) ? provider.licenses : []).map(license => (
                                <tr key={license._id} className={`license-row ${license.verification_status}`}>
                                    <td>
                                        <span className="service-type-cell">
                                            {getServiceTypeDisplay(license.service_type)}
                                        </span>
                                    </td>
                                    <td>
                                        <strong className="license-number">{license.license_number}</strong>
                                    </td>
                                    <td>
                                        <StatusBadge status={license.verification_status} />
                                    </td>
                                    <td>
                                        {license.verified_at
                                            ? new Date(license.verified_at).toLocaleDateString('vi-VN')
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        {license.documents && license.documents.length > 0 ? (
                                            <div className="documents-cell">
                                                {license.documents.map((doc, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={doc}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="doc-link"
                                                        title={`Document ${idx + 1}`}
                                                    >
                                                        📄 {idx + 1}
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="no-documents">Không có</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            {license.verification_status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleVerifyLicense(license)}
                                                        disabled={processingLicense === license._id}
                                                        className="btn-success btn-small"
                                                    >
                                                        {processingLicense === license._id ? '⏳' : '✅'} Verify
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectLicense(license)}
                                                        disabled={processingLicense === license._id}
                                                        className="btn-danger btn-small"
                                                    >
                                                        {processingLicense === license._id ? '⏳' : '❌'} Reject
                                                    </button>
                                                </>
                                            )}
                                            {license.verification_status === 'verified' && (
                                                <span className="status-text success">✓ Đã xác minh</span>
                                            )}
                                            {license.verification_status === 'rejected' && (
                                                <div className="rejection-info">
                                                    <span className="status-text error">✗ Đã từ chối</span>
                                                    {license.rejection_reason && (
                                                        <small className="rejection-reason">
                                                            Lý do: {license.rejection_reason}
                                                        </small>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Info Box */}
                <div className="info-box">
                    <p>ℹ️ <strong>Hotel:</strong> Có thể có nhiều licenses (mỗi khách sạn 1 license)</p>
                    <p>ℹ️ <strong>Tour:</strong> Chỉ có 1 license duy nhất (1 công ty = 1 giấy phép)</p>
                    <p>🔒 <strong>License number:</strong> Phải unique trong toàn hệ thống (format: XXX-YYYY-NNN)</p>
                </div>
            </div>

            {/* Add Hotel License Modal */}
            {showAddModal && (
                <AddHotelLicenseModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    providerId={providerId}
                    onSuccess={handleAddLicenseSuccess}
                />
            )}
        </div>
    );
};

// ==================== STATUS BADGE COMPONENT ====================

const StatusBadge = ({ status }) => {
    const config = getLicenseStatusConfig(status);

    return (
        <span
            className={`status-badge ${config.className}`}
            style={{
                backgroundColor: config.bgColor,
                borderColor: config.borderColor,
                color: config.textColor,
                border: `2px solid ${config.borderColor}`,
            }}
        >
            {config.icon} {config.text}
        </span>
    );
};

export default AdminProviderDetail;
