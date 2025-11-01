import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './TourDetailsPage.css';
import { getProxiedGoogleDriveUrl } from '../../../utils/googleDriveImageHelper';

const TourDetailsPage = () => {
    const { tourId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [tour, setTour] = useState(null);
    const [itineraries, setItineraries] = useState([]);
    const [budgetItems, setBudgetItems] = useState([]);

    // Get provider _id from localStorage
    const provider = localStorage.getItem('provider')
        ? JSON.parse(localStorage.getItem('provider'))
        : null;
    const providerId = provider?._id || null;

    const token = localStorage.getItem('token');

    console.log('🔐 TourDetailsPage - Provider Info:', {
        provider,
        providerId,
        tourId
    });

    useEffect(() => {
        fetchTourDetails();
    }, [tourId]);

    const fetchTourDetails = async () => {
        try {
            setLoading(true);

            // 1. Fetch tour basic info
            const tourResponse = await axios.get(
                `http://localhost:3000/api/tour/provider/${providerId}/tours/${tourId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }
            );
            setTour(tourResponse.data.data);

            // 2. Fetch itineraries
            const itinerariesResponse = await axios.get(
                `http://localhost:3000/api/itineraries/tour/${tourId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }
            );

            if (itinerariesResponse.data.data) {
                const itinerariesData = itinerariesResponse.data.data;

                // 3. Fetch activities for each itinerary
                const itinerariesWithActivities = await Promise.all(
                    itinerariesData.map(async (itinerary) => {
                        try {
                            const activitiesResponse = await axios.get(
                                `http://localhost:3000/api/itineraries/${itinerary._id}/activities`, {
                                headers: { Authorization: `Bearer ${token}` }
                            }
                            );
                            return {
                                ...itinerary,
                                activities: activitiesResponse.data.data || []
                            };
                        } catch (error) {
                            console.error(`Error fetching activities for itinerary ${itinerary._id}:`, error);
                            return { ...itinerary, activities: [] };
                        }
                    })
                );

                setItineraries(itinerariesWithActivities);

                // 4. Extract budget items from itineraries
                const allBudgetItems = itinerariesWithActivities.flatMap(itinerary =>
                    itinerary.budget_breakdowns || []
                );
                console.log('🔍 Budget items extracted:', allBudgetItems);
                console.log('📊 Itineraries with budgets:', itinerariesWithActivities.map(i => ({
                    id: i._id,
                    day: i.day_number,
                    budgets: i.budget_breakdowns
                })));
                setBudgetItems(allBudgetItems);
            }

        } catch (error) {
            console.error('Error fetching tour details:', error);
            toast.error('Không thể tải thông tin tour');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa tour này?')) {
            return;
        }

        try {
            await axios.delete(
                `http://localhost:3000/api/tour/provider/${providerId}/tours/${tourId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            toast.success('Đã xóa tour thành công!');
            navigate('/provider/tours');
        } catch (error) {
            console.error('Error deleting tour:', error);
            toast.error('Không thể xóa tour');
        }
    };

    if (loading) {
        return (
            <div className="tour-details-loading">
                <div className="spinner"></div>
                <p>Đang tải thông tin tour...</p>
            </div>
        );
    }

    if (!tour) {
        return (
            <div className="tour-details-error">
                <h2>Không tìm thấy tour</h2>
                <button onClick={() => navigate('/provider/tours')} className="btn-back">
                    ← Quay lại danh sách
                </button>
            </div>
        );
    }

    const maxDays = Math.ceil((tour.duration_hours || 24) / 24);

    return (
        <div className="tour-details-page">
            {/* Header */}
            <div className="details-header">
                <div className="header-left">
                    <button onClick={() => navigate('/provider/tours')} className="btn-back">
                        ← Quay lại
                    </button>
                    <h1 className="page-title">{tour.title}</h1>
                    <span className={`status-badge status-${tour.status}`}>
                        {tour.status === 'active' ? 'Đang hoạt động' :
                            tour.status === 'draft' ? 'Bản nháp' :
                                tour.status === 'inactive' ? 'Tạm ngừng' : tour.status}
                    </span>
                </div>
                <div className="header-actions">
                    <button
                        onClick={() => navigate(`/provider/tours/${tourId}/edit`)}
                        className="btn-edit"
                    >
                        ✏️ Chỉnh sửa
                    </button>
                    <button onClick={handleDelete} className="btn-delete">
                        🗑️ Xóa
                    </button>
                </div>
            </div>

            {/* Basic Info Section */}
            <div className="details-section">
                <h2 className="section-title">📝 Thông tin cơ bản</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Địa điểm:</span>
                        <span className="info-value">
                            {/* Handle multiple destinations */}
                            {tour.destinations && tour.destinations.length > 0
                                ? tour.destinations.map(dest => dest.name || dest).join(', ')
                                : Array.isArray(tour.destination_id) && tour.destination_id.length > 0
                                    ? tour.destination_id.map(dest => typeof dest === 'object' ? dest.name : dest).join(', ')
                                    : (tour.destination_id?.name || tour.location || 'Chưa có thông tin')
                            }
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Thời gian:</span>
                        <span className="info-value">{tour.duration || `${tour.duration_hours} giờ`}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Độ khó:</span>
                        <span className="info-value">
                            {tour.difficulty === 'easy' ? 'Dễ' :
                                tour.difficulty === 'moderate' ? 'Trung bình' : 'Khó'}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Số người (min-max):</span>
                        <span className="info-value">
                            {tour.capacity?.min_participants} - {tour.capacity?.max_participants} người
                        </span>
                    </div>
                </div>

                <div className="info-item full-width">
                    <span className="info-label">Mô tả:</span>
                    <p className="info-description">
                        {Array.isArray(tour.description) ? tour.description.join(', ') : tour.description}
                    </p>
                </div>

                {tour.image && (
                    <div className="tour-image">
                        <img src={getProxiedGoogleDriveUrl(tour.image)} alt={tour.title} />
                    </div>
                )}
            </div>

            {/* Meeting Point */}
            <div className="details-section">
                <h2 className="section-title">📍 Điểm tập trung</h2>
                <div className="info-item">
                    <span className="info-label">Địa chỉ:</span>
                    <span className="info-value">{tour.meeting_point?.address || 'Chưa có thông tin'}</span>
                </div>
                {tour.meeting_point?.instructions && (
                    <div className="info-item">
                        <span className="info-label">Hướng dẫn:</span>
                        <span className="info-value">{tour.meeting_point.instructions}</span>
                    </div>
                )}
            </div>

            {/* Pricing */}
            <div className="details-section">
                <h2 className="section-title">💰 Giá Tour</h2>
                <div className="pricing-grid">
                    <div className="price-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                        <span className="price-label">Giá tour</span>
                        <span className="price-value" style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb' }}>
                            {tour.price?.toLocaleString('vi-VN')} VNĐ
                        </span>
                    </div>
                </div>
            </div>

            {/* Highlights */}
            {tour.highlights && tour.highlights.length > 0 && (
                <div className="details-section">
                    <h2 className="section-title">⭐ Điểm nổi bật</h2>
                    <div className="services-list">
                        {tour.highlights.map((highlight, index) => (
                            <div key={index} className="service-item" style={{ color: '#f59e0b' }}>
                                ⭐ {highlight}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Services */}
            {tour.services && tour.services.length > 0 && (
                <div className="details-section">
                    <h2 className="section-title">✨ Dịch vụ bao gồm</h2>
                    <div className="services-list">
                        {tour.services.map((service, index) => (
                            <div key={index} className="service-item">
                                ✓ {service}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Available Dates */}
            {tour.available_dates && tour.available_dates.length > 0 && (
                <div className="details-section">
                    <h2 className="section-title">📅 Ngày khởi hành</h2>
                    <div className="dates-grid">
                        {tour.available_dates.map((dateItem, index) => (
                            <div key={index} className="date-card">
                                <span className="date-text">
                                    {new Date(dateItem.date).toLocaleDateString('vi-VN')}
                                </span>
                                <span className="slots-text">
                                    {dateItem.available_slots} chỗ trống
                                </span>
                                <span className={`date-status status-${dateItem.status}`}>
                                    {dateItem.status === 'available' ? 'Còn chỗ' : 'Hết chỗ'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Itineraries */}
            {itineraries.length > 0 && (
                <div className="details-section">
                    <h2 className="section-title">📅 Lịch trình chi tiết</h2>
                    <div className="itineraries-list">
                        {itineraries.map((itinerary, index) => (
                            <div key={itinerary._id} className="itinerary-card">
                                <div className="itinerary-header">
                                    <h3 className="itinerary-title">
                                        <span className="day-badge">Ngày {itinerary.day_number}</span>
                                        {itinerary.title}
                                    </h3>
                                </div>

                                {itinerary.description && (
                                    <p className="itinerary-description">{itinerary.description}</p>
                                )}

                                {/* Activities */}
                                {itinerary.activities && itinerary.activities.length > 0 && (
                                    <div className="activities-list">
                                        <h4 className="activities-title">Hoạt động ({itinerary.activities.length}):</h4>
                                        {itinerary.activities.map((activity, actIdx) => (
                                            <div key={actIdx} className="activity-item">
                                                <div className="activity-header">
                                                    <span className="activity-time">⏰ {activity.time || `${activity.start_time} - ${activity.end_time}`}</span>
                                                    <span className="activity-name">📍 {activity.action || activity.activity_name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Budget */}
            {budgetItems.length > 0 && (
                <div className="details-section">
                    <h2 className="section-title">💰 Ngân sách</h2>
                    <div className="budget-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ngày</th>
                                    <th>Danh mục</th>
                                    <th>Tên khoản mục</th>
                                    <th>Đơn giá</th>
                                    <th>Số lượng</th>
                                    <th>Tổng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {budgetItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>Ngày {item.day_number}</td>
                                        <td>{item.category}</td>
                                        <td>{item.item_name}</td>
                                        <td>{item.unit_price?.toLocaleString('vi-VN')} VNĐ</td>
                                        <td>{item.quantity}</td>
                                        <td><strong>{item.total_price?.toLocaleString('vi-VN')} VNĐ</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="budget-total">
                            <span>Tổng cộng:</span>
                            <strong>
                                {budgetItems.reduce((sum, item) => sum + (item.total_price || 0), 0).toLocaleString('vi-VN')} VNĐ
                            </strong>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TourDetailsPage;
