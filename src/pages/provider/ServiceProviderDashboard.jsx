import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getServiceProviderProfile } from '../../services/serviceProviderService';
import {
    getLicensesByType,
    getServiceTypeDisplay,
    getLicenseStatusConfig
} from '../../utils/licenseValidation';
import AddHotelLicenseModal from '../../components/provider/AddHotelLicenseModal';
import './ServiceProviderDashboard.css';

const ServiceProviderDashboard = () => {
    const navigate = useNavigate();
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddHotelModal, setShowAddHotelModal] = useState(false);

    useEffect(() => {
        fetchProviderProfile();
    }, []);

    const fetchProviderProfile = async () => {
        try {
            setLoading(true);
            const response = await getServiceProviderProfile();

            if (response.success) {
                setProvider(response.data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Không thể tải thông tin. Vui lòng đăng nhập lại.');
            navigate('/auth');
        } finally {
            setLoading(false);
        }
    };

    const handleAddHotelSuccess = () => {
        fetchProviderProfile();
        setShowAddHotelModal(false);
        toast.success('✅ Thêm khách sạn thành công!');
    };

    const goToHotelManagement = (license) => {
        // Navigate to hotel management with license ID
        navigate(`/provider/hotels/${license._id}`);
    };

    const goToTourManagement = () => {
        navigate('/provider/tours');
    };

    const goToFlightManagement = () => {
        navigate('/provider/flights');
    };

    const handleContactAdmin = () => {
        toast.info('Vui lòng liên hệ admin qua email: admin@viettravel.com');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="error-container">
                <h2>Không thể tải thông tin</h2>
                <button onClick={() => navigate('/auth')} className="btn-primary">
                    Đăng nhập lại
                </button>
            </div>
        );
    }

    // Group licenses by service type
    const hotelLicenses = getLicensesByType(provider.licenses, 'hotel');
    const tourLicense = provider.licenses.find(l => l.service_type === 'tour');
    const flightLicense = provider.licenses.find(l => l.service_type === 'flight');

    return (
        <div className="service-provider-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>Dashboard - {provider.company_name}</h1>
                    <p className="company-email">📧 {provider.email}</p>
                </div>
                <div className="header-actions">
                    <button
                        onClick={() => navigate('/provider/profile')}
                        className="btn-secondary"
                    >
                        ⚙️ Cài đặt
                    </button>
                </div>
            </div>

            {/* Service Types Overview */}
            <div className="service-types-overview">
                <h3>Loại hình dịch vụ đã đăng ký:</h3>
                <div className="service-badges">
                    {provider.type.map(type => (
                        <span key={type} className="service-badge">
                            {getServiceTypeDisplay(type)}
                        </span>
                    ))}
                </div>
            </div>

            {/* ====== HOTEL SECTION - Nhiều licenses ====== */}
            {provider.type.includes('hotel') && (
                <section className="service-section hotel-section">
                    <div className="section-header">
                        <h2>🏨 Danh sách Khách sạn ({hotelLicenses.length})</h2>

                        {/* ⚠️ QUAN TRỌNG: Button ADD CHỈ cho HOTEL */}
                        <button
                            onClick={() => setShowAddHotelModal(true)}
                            className="btn-primary btn-add"
                        >
                            ➕ Thêm khách sạn mới
                        </button>
                    </div>

                    {hotelLicenses.length > 0 ? (
                        <div className="license-grid">
                            {hotelLicenses.map(license => (
                                <LicenseCard
                                    key={license._id}
                                    license={license}
                                    onManage={() => goToHotelManagement(license)}
                                    onContact={handleContactAdmin}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>Chưa có khách sạn nào. Nhấn "Thêm khách sạn mới" để bắt đầu.</p>
                        </div>
                    )}
                </section>
            )}

            {/* ====== TOUR SECTION - 1 license duy nhất ====== */}
            {provider.type.includes('tour') && tourLicense && (
                <section className="service-section tour-section">
                    <div className="section-header">
                        <h2>🗺️ Giấy phép Tour</h2>
                    </div>

                    <div className="single-license-container">
                        <LicenseCard
                            license={tourLicense}
                            onManage={goToTourManagement}
                            onContact={handleContactAdmin}
                            isSingle
                        />
                    </div>

                    {/* ⚠️ QUAN TRỌNG: KHÔNG có button "Thêm license" */}
                    <p className="info-text">
                        ℹ️ Tour chỉ được có 1 license duy nhất. Không thể thêm license mới.
                    </p>
                </section>
            )}

            {/* ====== FLIGHT SECTION - 1 license duy nhất ====== */}
            {provider.type.includes('flight') && flightLicense && (
                <section className="service-section flight-section">
                    <div className="section-header">
                        <h2>✈️ Giấy phép Hàng không</h2>
                    </div>

                    <div className="single-license-container">
                        <LicenseCard
                            license={flightLicense}
                            onManage={goToFlightManagement}
                            onContact={handleContactAdmin}
                            isSingle
                        />
                    </div>

                    {/* ⚠️ QUAN TRỌNG: KHÔNG có button "Thêm license" */}
                    <p className="info-text">
                        ℹ️ Flight chỉ được có 1 license duy nhất. Không thể thêm license mới.
                    </p>
                </section>
            )}

            {/* Add Hotel License Modal */}
            {showAddHotelModal && (
                <AddHotelLicenseModal
                    isOpen={showAddHotelModal}
                    onClose={() => setShowAddHotelModal(false)}
                    providerId={provider._id}
                    onSuccess={handleAddHotelSuccess}
                />
            )}
        </div>
    );
};

// ==================== LICENSE CARD COMPONENT ====================

const LicenseCard = ({ license, onManage, onContact, isSingle = false }) => {
    const statusConfig = getLicenseStatusConfig(license.verification_status);

    return (
        <div className={`license-card ${license.verification_status} ${isSingle ? 'single' : ''}`}>
            <div className="license-card-header">
                <h3 className="license-number">{license.license_number}</h3>
                <StatusBadge status={license.verification_status} />
            </div>

            <div className="license-card-body">
                {license.verification_status === 'verified' ? (
                    <>
                        <p className="status-message success">
                            <span className="status-icon">✅</span>
                            Đã xác minh
                        </p>
                        <p className="verified-date">
                            Xác minh lúc: {new Date(license.verified_at).toLocaleDateString('vi-VN')}
                        </p>
                        <button onClick={onManage} className="btn-primary">
                            📊 Quản lý
                        </button>
                    </>
                ) : license.verification_status === 'pending' ? (
                    <>
                        <p className="status-message warning">
                            <span className="status-icon">⏳</span>
                            Đang chờ admin xác minh
                        </p>
                        <small className="status-hint">
                            Vui lòng chờ admin xác minh giấy phép của bạn. Thời gian xử lý: 1-3 ngày làm việc.
                        </small>
                    </>
                ) : (
                    <>
                        <p className="status-message error">
                            <span className="status-icon">❌</span>
                            Bị từ chối
                        </p>
                        <div className="rejection-reason">
                            <strong>Lý do:</strong>
                            <p>{license.rejection_reason || 'Không có thông tin'}</p>
                        </div>
                        <button onClick={onContact} className="btn-secondary">
                            📧 Liên hệ Admin
                        </button>
                    </>
                )}
            </div>

            {/* Documents */}
            {license.documents && license.documents.length > 0 && (
                <div className="license-card-footer">
                    <p className="documents-label">📄 Tài liệu đính kèm: {license.documents.length}</p>
                </div>
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

export default ServiceProviderDashboard;
