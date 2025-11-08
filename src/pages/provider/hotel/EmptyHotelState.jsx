import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Sparkles } from 'lucide-react';
import './EmptyHotelState.css';

const EmptyHotelState = () => {
    const navigate = useNavigate();

    const handleCreateHotel = () => {
        navigate('/provider/hotels/new');
    };

    return (
        <div className="empty-hotel-state">
            <div className="empty-hotel-container">
                <div className="empty-hotel-icon-wrapper">
                    <div className="empty-hotel-icon-bg">
                        <Building2 className="empty-hotel-icon" size={80} />
                    </div>
                    <Sparkles className="sparkle-icon sparkle-1" size={24} />
                    <Sparkles className="sparkle-icon sparkle-2" size={20} />
                    <Sparkles className="sparkle-icon sparkle-3" size={18} />
                </div>

                <h1 className="empty-hotel-title">
                    Hãy bắt đầu tạo khách sạn của bạn cùng VietTravel
                </h1>

                <p className="empty-hotel-description">
                    Tạo khách sạn đầu tiên của bạn để bắt đầu quản lý phòng, đón khách và phát triển doanh nghiệp cùng VietTravel
                </p>

                <button onClick={handleCreateHotel} className="empty-hotel-create-btn">
                    <Plus size={20} />
                    Tạo Khách Sạn Ngay
                </button>

                <div className="empty-hotel-features">
                    <div className="feature-item">
                        <div className="feature-icon">🏨</div>
                        <div className="feature-text">
                            <h3>Quản lý dễ dàng</h3>
                            <p>Quản lý phòng và đặt chỗ một cách hiệu quả</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">📊</div>
                        <div className="feature-text">
                            <h3>Thống kê chi tiết</h3>
                            <p>Theo dõi doanh thu và hiệu suất kinh doanh</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">🌍</div>
                        <div className="feature-text">
                            <h3>Tiếp cận khách hàng</h3>
                            <p>Kết nối với hàng ngàn du khách trên khắp Việt Nam</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyHotelState;
