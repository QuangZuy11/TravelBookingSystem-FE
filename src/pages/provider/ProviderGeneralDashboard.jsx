import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ProviderGeneralDashboard.css';

/**
 * ProviderGeneralDashboard - Dashboard for providers with multiple service types
 * Shows overview cards for each service type the provider manages
 */
const ProviderGeneralDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [providerTypes, setProviderTypes] = useState([]);
    const [companyName, setCompanyName] = useState('');

    useEffect(() => {
        loadProviderInfo();
    }, [user]);

    const loadProviderInfo = () => {
        const providerStr = localStorage.getItem('provider');
        let provider = null;

        try {
            provider = providerStr ? JSON.parse(providerStr) : null;
        } catch (error) {
            console.error('Error parsing provider:', error);
        }

        if (!provider && user?.provider) {
            provider = user.provider;
        }

        if (provider) {
            // Get provider types from licenses or type field
            let types = [];
            if (Array.isArray(provider.type)) {
                types = provider.type;
            } else if (typeof provider.type === 'string') {
                types = [provider.type];
            } else if (provider.licenses && Array.isArray(provider.licenses)) {
                // Derive from licenses if type field missing
                types = [...new Set(provider.licenses.map(l => l.service_type))];
            }

            setProviderTypes(types);
            setCompanyName(provider.company_name || 'Provider');
        }
    };

    const getServiceConfig = (type) => {
        const configs = {
            hotel: {
                icon: '🏨',
                title: 'Quản lý Khách sạn',
                description: 'Quản lý khách sạn, phòng, giá cả và đặt phòng',
                route: '/provider/hotels',
                color: '#3b82f6',
                bgColor: '#eff6ff'
            },
            tour: {
                icon: '🗺️',
                title: 'Quản lý Tour',
                description: 'Quản lý tour du lịch, lịch trình và booking',
                route: '/provider/tours',
                color: '#10b981',
                bgColor: '#f0fdf4'
            },
        };

        return configs[type.toLowerCase()] || null;
    };

    const handleNavigate = (route) => {
        navigate(route);
    };

    return (
        <div className="general-dashboard">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Chào mừng trở lại!</h1>
                <p className="dashboard-subtitle">{companyName}</p>
            </div>

            <div className="services-grid">
                {providerTypes.map(type => {
                    const config = getServiceConfig(type);
                    if (!config) return null;

                    return (
                        <div
                            key={type}
                            className="service-card"
                            style={{ borderLeftColor: config.color }}
                            onClick={() => handleNavigate(config.route)}
                        >
                            <div
                                className="service-icon"
                                style={{ backgroundColor: config.bgColor }}
                            >
                                <span style={{ fontSize: '3rem' }}>{config.icon}</span>
                            </div>
                            <div className="service-content">
                                <h2 className="service-title" style={{ color: config.color }}>
                                    {config.title}
                                </h2>
                                <p className="service-description">{config.description}</p>
                                <button
                                    className="service-button"
                                    style={{
                                        backgroundColor: config.color,
                                        borderColor: config.color
                                    }}
                                >
                                    Quản lý →
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {providerTypes.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h2 className="empty-title">Chưa có dịch vụ nào</h2>
                    <p className="empty-text">
                        Vui lòng liên hệ admin để được cấp quyền quản lý dịch vụ.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProviderGeneralDashboard;
