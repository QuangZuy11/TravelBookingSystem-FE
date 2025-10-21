import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ProviderDetailPage.css';

const ProviderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalData, setApprovalData] = useState({ approved: true, reason: '' });
    const [submitting, setSubmitting] = useState(false);
    const [processingLicense, setProcessingLicense] = useState(null);

    useEffect(() => {
        fetchProviderDetail();
    }, [id]);

    const fetchProviderDetail = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/admin/service-providers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProvider(response.data.data);
        } catch (error) {
            console.error('Error fetching provider:', error);
            toast.error('Lỗi khi tải thông tin provider: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleAdminApproval = async () => {
        if (!approvalData.approved && !approvalData.reason.trim()) {
            toast.error('Vui lòng nhập lý do từ chối!');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:3000/api/admin/service-providers/${id}/verify-admin`,
                {
                    approved: approvalData.approved,
                    rejection_reason: approvalData.approved ? null : approvalData.reason
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(approvalData.approved ? '✅ Đã phê duyệt provider!' : '❌ Đã từ chối provider!');
            setShowApprovalModal(false);
            setApprovalData({ approved: true, reason: '' });
            fetchProviderDetail();
        } catch (error) {
            console.error('Error with admin approval:', error);
            toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerifyLicense = async (license) => {
        const confirmed = window.confirm(
            `Xác minh giấy phép "${license.license_number}"?\n\nSau khi xác minh, license này sẽ được đánh dấu là hợp lệ.`
        );

        if (!confirmed) return;

        setProcessingLicense(license._id);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:3000/api/admin/service-providers/${id}/verify-license`,
                {
                    license_id: license._id,
                    status: 'verified'
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('✅ Đã xác minh license thành công!');
                fetchProviderDetail();
            }
        } catch (error) {
            console.error('Verify license error:', error);
            toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
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
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:3000/api/admin/service-providers/${id}/verify-license`,
                {
                    license_id: license._id,
                    status: 'rejected',
                    rejection_reason: reason.trim()
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('✅ Đã từ chối license!');
                fetchProviderDetail();
            }
        } catch (error) {
            console.error('Reject license error:', error);
            toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
        } finally {
            setProcessingLicense(null);
        }
    };

    const getServiceIcon = (type) => {
        const icons = { hotel: '🏨', tour: '🗺️' };
        return icons[type] || '📦';
    };

    if (loading) {
        return (
            <div className="provider-detail-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin provider...</p>
                </div>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="provider-detail-page">
                <div className="error-container">
                    <div className="error-icon">😕</div>
                    <h2>Provider không tồn tại</h2>
                    <button
                        onClick={() => navigate('/admin/providers')}
                        className="btn-back-list"
                    >
                        ← Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    const allLicensesVerified = provider.licenses.length > 0 && provider.licenses.every(l => l.verification_status === 'verified');
    const hasPendingLicenses = provider.licenses.some(l => l.verification_status === 'pending');

    return (
        <div className="provider-detail-page">
            {/* Page Header */}
            <div className="page-header">
                <div
                    onClick={() => navigate('/admin/providers')}
                    className="header-nav"
                >
                    <span>←</span>
                    <span>Quay lại danh sách</span>
                </div>

                <div className="header-content">
                    <div className="company-section">
                        <h1>{provider.company_name}</h1>
                        <div className="contact-details">
                            <div className="detail-row">
                                <span className="icon">👤</span>
                                <span><strong>Người liên hệ:</strong> {provider.contact_person}</span>
                            </div>
                            <div className="detail-row">
                                <span className="icon">📧</span>
                                <span><strong>Email:</strong> {provider.email}</span>
                            </div>
                            <div className="detail-row">
                                <span className="icon">📞</span>
                                <span><strong>Phone:</strong> {provider.phone}</span>
                            </div>
                            <div className="detail-row">
                                <span className="icon">📍</span>
                                <span><strong>Địa chỉ:</strong> {provider.address}</span>
                            </div>
                        </div>

                        {/* Service Types */}
                        <div className="service-types">
                            {(Array.isArray(provider.type) ? provider.type : [provider.type]).map(type => (
                                <span key={type} className="service-type-badge">
                                    <span>{getServiceIcon(type)}</span>
                                    <span>{type}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="status-section">
                        {provider.admin_verified ? (
                            <span className="status-badge verified">
                                ✓ Đã xác minh
                            </span>
                        ) : provider.admin_rejection_reason ? (
                            <span className="status-badge rejected">
                                ✗ Bị từ chối
                            </span>
                        ) : (
                            <span className="status-badge pending">
                                ⏳ Chờ xét duyệt
                            </span>
                        )}

                        {provider.admin_verified && provider.admin_verified_at && (
                            <div className="status-date">
                                Phê duyệt: {new Date(provider.admin_verified_at).toLocaleDateString('vi-VN')}
                            </div>
                        )}

                        <div className="status-date">
                            Đăng ký: {new Date(provider.created_at).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Licenses Section */}
            <div className="licenses-section">
                <div className="section-header">
                    <h2>Giấy phép kinh doanh ({(Array.isArray(provider.licenses) ? provider.licenses : []).length})</h2>
                </div>

                {(Array.isArray(provider.licenses) ? provider.licenses : []).length > 0 ? (
                    <div className="licenses-grid">
                        {(Array.isArray(provider.licenses) ? provider.licenses : []).map(license => (
                            <div
                                key={license._id}
                                className={`license-card ${license.verification_status}`}
                            >
                                <div className="license-header">
                                    <h3 className="license-number">{license.license_number}</h3>
                                    <span className={`status-badge ${license.verification_status}`}>
                                        {license.verification_status === 'verified' && '✓ Đã xác minh'}
                                        {license.verification_status === 'pending' && '⏳ Chờ xét duyệt'}
                                        {license.verification_status === 'rejected' && '✗ Bị từ chối'}
                                    </span>
                                </div>

                                <div className="license-body">
                                    <div className="license-info-row">
                                        <span className="label">Loại dịch vụ:</span>
                                        <span className="value">{getServiceIcon(license.service_type)} {license.service_type}</span>
                                    </div>

                                    {license.verified_at && (
                                        <div className="license-info-row">
                                            <span className="label">Ngày xác minh:</span>
                                            <span className="value">
                                                {new Date(license.verified_at).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    )}

                                    {license.rejection_reason && (
                                        <div className="license-info-row">
                                            <span className="label">Lý do từ chối:</span>
                                            <span className="value">{license.rejection_reason}</span>
                                        </div>
                                    )}

                                    {license.documents && license.documents.length > 0 && (
                                        <div className="license-info-row">
                                            <span className="label">Tài liệu:</span>
                                            <div className="license-documents">
                                                {license.documents.map((doc, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={doc}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="doc-link"
                                                    >
                                                        📄 Tài liệu {idx + 1}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* License Actions */}
                                    {license.verification_status === 'pending' && (
                                        <div className="license-actions">
                                            <button
                                                onClick={() => handleVerifyLicense(license)}
                                                disabled={processingLicense === license._id}
                                                className="btn-verify"
                                            >
                                                {processingLicense === license._id ? '⏳ Đang xử lý...' : '✓ Xác minh License'}
                                            </button>
                                            <button
                                                onClick={() => handleRejectLicense(license)}
                                                disabled={processingLicense === license._id}
                                                className="btn-reject-license"
                                            >
                                                {processingLicense === license._id ? '⏳ Đang xử lý...' : '✗ Từ chối'}
                                            </button>
                                        </div>
                                    )}

                                    {license.verification_status === 'verified' && (
                                        <div className="license-verified-msg">
                                            ✓ License đã được xác minh
                                        </div>
                                    )}

                                    {license.verification_status === 'rejected' && (
                                        <div className="license-rejected-msg">
                                            ✗ License đã bị từ chối
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-licenses">
                        <div className="icon">📄</div>
                        <p>Chưa có giấy phép nào được đăng ký</p>
                    </div>
                )}
            </div>

            {/* Admin Approval Section */}
            <div className="approval-section">
                <h2>Phê duyệt Admin</h2>

                {provider.admin_verified ? (
                    <div className="approval-status approved">
                        <p className="title">✓ Provider đã được phê duyệt</p>
                        <p className="date">
                            Phê duyệt bởi Admin • {new Date(provider.admin_verified_at).toLocaleString('vi-VN')}
                        </p>
                    </div>
                ) : provider.admin_rejection_reason ? (
                    <div className="approval-status rejected">
                        <p className="title">✗ Provider đã bị từ chối</p>
                        <div className="reason">
                            <strong>Lý do:</strong> {provider.admin_rejection_reason}
                        </div>
                        <button
                            onClick={() => {
                                setApprovalData({ approved: true, reason: '' });
                                setShowApprovalModal(true);
                            }}
                            className="btn-retry"
                        >
                            ✓ Phê duyệt lại
                        </button>
                    </div>
                ) : (
                    <div className="approval-actions">
                        <button
                            onClick={() => {
                                setApprovalData({ approved: true, reason: '' });
                                setShowApprovalModal(true);
                            }}
                            className="btn-approve"
                        >
                            <span>✓</span>
                            <span>Phê duyệt Provider</span>
                        </button>
                        <button
                            onClick={() => {
                                setApprovalData({ approved: false, reason: '' });
                                setShowApprovalModal(true);
                            }}
                            className="btn-reject"
                        >
                            <span>✗</span>
                            <span>Từ chối Provider</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Approval Modal */}
            {showApprovalModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <span className={`modal-icon ${approvalData.approved ? 'success' : 'danger'}`}>
                                {approvalData.approved ? '✓' : '✗'}
                            </span>
                            <h3>{approvalData.approved ? 'Phê duyệt Provider' : 'Từ chối Provider'}</h3>
                        </div>

                        <div className="modal-provider-info">
                            <div className="company">{provider.company_name}</div>
                            <div className="contact">{provider.contact_person}</div>
                        </div>

                        {!approvalData.approved && (
                            <div className="modal-form-group">
                                <label>
                                    Lý do từ chối <span className="required">*</span>
                                </label>
                                <textarea
                                    value={approvalData.reason}
                                    onChange={(e) => setApprovalData({ ...approvalData, reason: e.target.value })}
                                    placeholder="Nhập lý do từ chối..."
                                    rows="4"
                                    required
                                />
                            </div>
                        )}

                        <div className="modal-info-box">
                            <p>
                                {approvalData.approved
                                    ? '✓ Xác nhận phê duyệt provider này? Provider sẽ có thể đăng nhập và sử dụng hệ thống.'
                                    : '✗ Xác nhận từ chối provider này? Provider sẽ không thể sử dụng hệ thống.'}
                            </p>
                        </div>

                        <div className="modal-actions">
                            <button
                                onClick={handleAdminApproval}
                                disabled={submitting || (!approvalData.approved && !approvalData.reason.trim())}
                                className={`btn-confirm ${approvalData.approved ? '' : 'danger'}`}
                            >
                                {submitting ? 'Đang xử lý...' : 'Xác nhận'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowApprovalModal(false);
                                    setApprovalData({ approved: true, reason: '' });
                                }}
                                disabled={submitting}
                                className="btn-cancel"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderDetailPage;
