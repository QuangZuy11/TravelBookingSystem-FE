import React from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, Info, AlertCircle, AlertTriangle, Bell, Calendar, CreditCard, Building, User } from 'lucide-react';
import './NotificationsModal.css';

const NotificationDetailModal = ({ isOpen, onClose, notification }) => {
    if (!isOpen || !notification) return null;

    // Get notification icon
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle size={32} color="#2d6a4f" />;
            case 'info':
                return <Info size={32} color="#0ea5e9" />;
            case 'warning':
                return <AlertTriangle size={32} color="#f59e0b" />;
            case 'error':
                return <AlertCircle size={32} color="#dc3545" />;
            default:
                return <Bell size={32} color="#666" />;
        }
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format price
    const formatPrice = (amount) => {
        if (!amount) return '0 VNĐ';
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
    };

    // Use portal to render modal outside of Header component to avoid z-index conflicts
    const modalContent = (
        <div className="notifications-modal-overlay detail-modal" onClick={onClose}>
            <div className="notification-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="notification-detail-header">
                    <h2 className="notification-detail-modal-title">Chi tiết</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="notification-detail-body">
                    <div className="notification-detail-type-header">
                        <div className="notification-detail-icon">
                            {getNotificationIcon(notification.type)}
                        </div>
                        <div className="notification-detail-title-section">
                            <h3>{notification.title}</h3>
                            <span className={`notification-detail-badge ${notification.type}`}>
                                {notification.type === 'success' && 'Thành công'}
                                {notification.type === 'info' && 'Thông tin'}
                                {notification.type === 'warning' && 'Cảnh báo'}
                                {notification.type === 'error' && 'Lỗi'}
                            </span>
                        </div>
                    </div>

                    <div className="notification-detail-content">
                        <div className="notification-detail-message">
                            <p>{notification.message}</p>
                        </div>

                        {notification.metadata && (
                            <div className="notification-detail-metadata">
                                <h4>Chi tiết</h4>
                                <div className="metadata-grid">
                                    {notification.metadata.bookingNumber && (
                                        <div className="metadata-item">
                                            <CreditCard size={16} />
                                            <span className="metadata-label">Mã đặt:</span>
                                            <span className="metadata-value">{notification.metadata.bookingNumber}</span>
                                        </div>
                                    )}
                                    {notification.metadata.hotelName && (
                                        <div className="metadata-item">
                                            <Building size={16} />
                                            <span className="metadata-label">Khách sạn:</span>
                                            <span className="metadata-value">{notification.metadata.hotelName}</span>
                                        </div>
                                    )}
                                    {notification.metadata.tourName && (
                                        <div className="metadata-item">
                                            <Building size={16} />
                                            <span className="metadata-label">Tour:</span>
                                            <span className="metadata-value">{notification.metadata.tourName}</span>
                                        </div>
                                    )}
                                    {notification.metadata.amount && (
                                        <div className="metadata-item">
                                            <CreditCard size={16} />
                                            <span className="metadata-label">Số tiền:</span>
                                            <span className="metadata-value">{formatPrice(notification.metadata.amount)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="notification-detail-footer">
                            <div className="notification-detail-time">
                                <Calendar size={14} />
                                <span>Ngày tạo: {formatDate(notification.createdAt)}</span>
                            </div>
                            {notification.isRead && (
                                <div className="notification-detail-status">
                                    <CheckCircle size={14} color="#2d6a4f" />
                                    <span>Đã đọc</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default NotificationDetailModal;

