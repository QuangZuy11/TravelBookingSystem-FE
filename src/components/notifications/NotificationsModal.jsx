import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, CheckCircle, Info, AlertCircle, AlertTriangle, Clock } from 'lucide-react';
import './NotificationsModal.css';

const NotificationsModal = ({ isOpen, onClose, onNotificationClick }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all notifications
    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Vui lòng đăng nhập để xem thông báo');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:3000/api/traveler/notifications?limit=100', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải thông báo');
            }

            const result = await response.json();
            if (result.success) {
                setNotifications(result.data.notifications || []);
            } else {
                setError(result.message || 'Không thể tải thông báo');
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Không thể tải thông báo. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch notifications when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();

            // Listen for notification refresh event
            const handleRefresh = () => {
                fetchNotifications();
            };
            window.addEventListener('notificationRefresh', handleRefresh);

            return () => {
                window.removeEventListener('notificationRefresh', handleRefresh);
            };
        }
    }, [isOpen]);

    // Mark notification as read
    const handleMarkAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`http://localhost:3000/api/traveler/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === notificationId
                            ? { ...notif, isRead: true, status: 'read' }
                            : notif
                    )
                );
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Get notification icon
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} color="#2d6a4f" />;
            case 'info':
                return <Info size={20} color="#0ea5e9" />;
            case 'warning':
                return <AlertTriangle size={20} color="#f59e0b" />;
            case 'error':
                return <AlertCircle size={20} color="#dc3545" />;
            default:
                return <Bell size={20} color="#666" />;
        }
    };

    // Format time ago
    const formatTimeAgo = (date) => {
        if (!date) return '';
        const now = new Date();
        const notificationDate = new Date(date);
        const diffMs = now - notificationDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return notificationDate.toLocaleDateString('vi-VN');
    };

    if (!isOpen) return null;

    // Use portal to render modal outside of Header component to avoid z-index conflicts
    const modalContent = (
        <div className="notifications-modal-overlay" onClick={onClose}>
            <div className="notifications-modal" onClick={(e) => e.stopPropagation()}>
                <div className="notifications-modal-header">
                    <h2>
                        <Bell size={24} style={{ marginRight: '8px' }} />
                        Thông báo
                    </h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="notifications-modal-content">
                    {loading ? (
                        <div className="notifications-loading">
                            <div className="loading-spinner"></div>
                            <p>Đang tải thông báo...</p>
                        </div>
                    ) : error ? (
                        <div className="notifications-error">
                            <AlertCircle size={40} color="#dc3545" />
                            <p>{error}</p>
                            <button onClick={fetchNotifications} className="btn-retry">
                                Thử lại
                            </button>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="notifications-empty">
                            <Bell size={64} color="#ccc" />
                            <p>Chưa có thông báo nào</p>
                        </div>
                    ) : (
                        <div className="notifications-list-full">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`notification-item-full ${notif.isRead ? 'read' : 'unread'}`}
                                    onClick={() => {
                                        if (!notif.isRead) {
                                            handleMarkAsRead(notif.id);
                                        }
                                        if (onNotificationClick) {
                                            onNotificationClick(notif);
                                        }
                                    }}
                                >
                                    <div className="notification-icon-full">
                                        {getNotificationIcon(notif.type)}
                                    </div>
                                    <div className="notification-content-full">
                                        <h4 className="notification-title-full">{notif.title}</h4>
                                        <p className="notification-message-full">{notif.message}</p>
                                        <div className="notification-meta-full">
                                            <Clock size={12} />
                                            <span>{formatTimeAgo(notif.createdAt)}</span>
                                        </div>
                                    </div>
                                    {!notif.isRead && <div className="unread-dot-full"></div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default NotificationsModal;

