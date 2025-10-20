import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PendingVerificationPage.css';

/**
 * PendingVerificationPage - Notification page for providers waiting for admin verification
 * Shown after provider completes registration but before admin approval
 */
const PendingVerificationPage = () => {
    const navigate = useNavigate();
    const [providerInfo, setProviderInfo] = useState(null);

    useEffect(() => {
        loadProviderInfo();
    }, []);

    const loadProviderInfo = () => {
        const providerStr = localStorage.getItem('provider');
        if (providerStr) {
            try {
                const provider = JSON.parse(providerStr);
                setProviderInfo(provider);
            } catch (error) {
                console.error('Error parsing provider:', error);
            }
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/auth');
    };

    return (
        <div className="pending-verification-page">
            <div className="verification-card">
                <div className="verification-icon">
                    <div className="clock-animation">⏳</div>
                </div>

                <h1 className="verification-title">
                    Đang Chờ Xác Minh
                </h1>

                <div className="verification-content">
                    <p className="verification-message">
                        Cảm ơn bạn đã đăng ký làm <strong>Service Provider</strong> với hệ thống Travel Booking!
                    </p>

                    {providerInfo && (
                        <div className="provider-info-box">
                            <h3>Thông tin đã đăng ký:</h3>
                            <div className="info-row">
                                <span className="info-label">Công ty:</span>
                                <span className="info-value">{providerInfo.company_name}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{providerInfo.email}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Loại dịch vụ:</span>
                                <span className="info-value">
                                    {(() => {
                                        // Get provider types from licenses or type field
                                        let types = [];
                                        if (Array.isArray(providerInfo.type)) {
                                            types = providerInfo.type;
                                        } else if (typeof providerInfo.type === 'string') {
                                            types = [providerInfo.type];
                                        } else if (providerInfo.licenses && Array.isArray(providerInfo.licenses)) {
                                            // Derive from licenses if type field missing
                                            types = [...new Set(providerInfo.licenses.map(l => l.service_type))];
                                        }

                                        const icons = { hotel: '🏨', tour: '🗺️' };
                                        return types.map(t => (
                                            <span key={t} className="service-badge">
                                                {icons[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
                                            </span>
                                        ));
                                    })()}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Số giấy phép:</span>
                                <span className="info-value">{providerInfo.licenses?.length || 0}</span>
                            </div>
                        </div>
                    )}

                    <div className="status-box">
                        <div className="status-step">
                            <span className="step-icon completed">✓</span>
                            <span className="step-text">Đăng ký thông tin</span>
                        </div>
                        <div className="status-arrow">→</div>
                        <div className="status-step">
                            <span className="step-icon pending">⏳</span>
                            <span className="step-text">Xác minh Admin</span>
                        </div>
                        <div className="status-arrow">→</div>
                        <div className="status-step">
                            <span className="step-icon waiting">◯</span>
                            <span className="step-text">Kích hoạt tài khoản</span>
                        </div>
                    </div>

                    <div className="info-box">
                        <h3>📋 Quy trình tiếp theo:</h3>
                        <ol className="process-list">
                            <li>Admin sẽ xác minh từng giấy phép kinh doanh của bạn</li>
                            <li>Sau khi tất cả giấy phép được verify, admin sẽ phê duyệt tài khoản</li>
                            <li>Bạn sẽ nhận email thông báo khi tài khoản được kích hoạt</li>
                            <li>Đăng nhập lại để truy cập giao diện quản lý dịch vụ</li>
                        </ol>
                    </div>

                    <div className="notice-box">
                        <span className="notice-icon">💡</span>
                        <p className="notice-text">
                            <strong>Lưu ý:</strong> Thời gian xác minh thường mất 1-3 ngày làm việc.
                            Nếu có thắc mắc, vui lòng liên hệ: <a href="mailto:support@travelbooking.com">support@travelbooking.com</a>
                        </p>
                    </div>
                </div>

                <div className="action-buttons">
                    <button
                        className="btn-home"
                        onClick={handleBackToHome}
                    >
                        ← Về Trang Chủ
                    </button>
                    <button
                        className="btn-logout"
                        onClick={handleLogout}
                    >
                        Đăng Xuất
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingVerificationPage;
