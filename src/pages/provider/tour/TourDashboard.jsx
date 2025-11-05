import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tourApi } from '@api/tourApi';
import { formatCurrency } from '@utils/tourHelpers';
import toast from 'react-hot-toast';

const TourDashboard = () => {
    const navigate = useNavigate();
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalTours: 0,
        totalBookings: 0,
        averageRating: 0,
        activeTours: 0
    });
    const [hoveredCard, setHoveredCard] = useState(null);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null); // New state for dropdown

    // Get provider _id from localStorage
    const provider = localStorage.getItem('provider')
        ? JSON.parse(localStorage.getItem('provider'))
        : null;
    const providerId = provider?._id || null;

    const fetchTours = async () => {
        try {
            setLoading(true);
            if (!providerId) {
                toast.error('Provider ID not found');
                return;
            }

            const response = await tourApi.getProviderTours(providerId, {});
            const tourList = response.data || response.tours || response || [];
            const toursArray = Array.isArray(tourList) ? tourList : [];
            setTours(toursArray);

            if (toursArray.length > 0) {
                const activeTours = toursArray.filter(t => t.status === 'published').length;
                const totalBookings = toursArray.reduce((sum, tour) =>
                    sum + (tour.capacity?.current_participants || 0), 0);
                const totalRatings = toursArray.reduce((sum, tour) => sum + (tour.rating || 0), 0);

                setStats({
                    totalTours: toursArray.length,
                    totalBookings,
                    averageRating: toursArray.length ? (totalRatings / toursArray.length).toFixed(1) : 0,
                    activeTours
                });
            }
        } catch (error) {
            console.error('Error fetching tours:', error);
            toast.error('Không thể tải danh sách tours');
            setTours([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTour = async (tourId, tourTitle) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa tour "${tourTitle}"?\nHành động này không thể hoàn tác!`)) {
            return;
        }

        try {
            await tourApi.deleteTour(providerId, tourId);
            toast.success('Đã xóa tour thành công!');
            fetchTours(); // Refresh the list
        } catch (error) {
            console.error('Error deleting tour:', error);
            toast.error(error.response?.data?.message || 'Không thể xóa tour');
        }
    };

    useEffect(() => {
        if (providerId) {
            fetchTours();
        }
    }, [providerId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown !== null) {
                setOpenDropdown(null);
            }
        };

        if (openDropdown !== null) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [openDropdown]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: '#f3f4f6'
            }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid rgba(255,255,255,0.3)',
                        borderTop: '4px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    const containerStyle = {
        minHeight: '100vh',
        background: '#f3f4f6',
        padding: '1rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        maxWidth: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box'
    };

    const headerStyle = {
        marginBottom: '2rem',
        color: 'white',
        maxWidth: '100%'
    };

    const titleStyle = {
        fontSize: '2.5rem',
        fontWeight: '700',
        marginBottom: '0.5rem',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    const statsContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
        maxWidth: '100%'
    };

    const statCardStyle = {
        background: 'white',
        borderRadius: '20px',
        padding: '1.5rem',
        minHeight: '180px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0 // Important for grid items to prevent overflow
    };

    const statCardHoverStyle = {
        transform: 'translateY(-5px)',
        boxShadow: '0 15px 40px rgba(0,0,0,0.2)'
    };

    const statTitleStyle = {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.75rem'
    };

    const statValueStyle = {
        fontSize: '2.5rem',
        fontWeight: '700',
        background: '#f3f4f6',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    };

    const actionsContainerStyle = {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        maxWidth: '100%'
    };

    const buttonPrimaryStyle = {
        background: '#f3f4f6',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '12px',
        border: 'none',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flex: '1 1 auto',
        minWidth: '180px',
        justifyContent: 'center'
    };

    const buttonSecondaryStyle = {
        background: 'white',
        color: '#10b981',
        padding: '1rem 2rem',
        borderRadius: '12px',
        border: '2px solid #10b981',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flex: '1 1 auto',
        minWidth: '180px',
        justifyContent: 'center'
    };

    const toursListStyle = {
        background: 'white',
        borderRadius: '20px',
        padding: '1.5rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        maxWidth: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch' // Smooth scrolling on mobile
    };

    const sectionTitleStyle = {
        fontSize: '1.75rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '1.5rem'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0 0.5rem',
        minWidth: '900px', // Reduced minimum width
        tableLayout: 'auto' // Changed to auto for better flexibility
    };

    const theadStyle = {
        background: '#f3f4f6',
        color: 'white'
    };

    const thStyle = {
        padding: '1rem',
        textAlign: 'left',
        fontWeight: '600',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap'
    };

    const thFirstStyle = {
        ...thStyle,
        borderTopLeftRadius: '12px',
        borderBottomLeftRadius: '12px',
        minWidth: '180px',
        maxWidth: '250px'
    };

    const thLastStyle = {
        ...thStyle,
        borderTopRightRadius: '12px',
        borderBottomRightRadius: '12px',
        width: '120px',
        textAlign: 'center'
    };

    const trStyle = {
        background: '#f9fafb',
        transition: 'all 0.3s ease'
    };

    const tdStyle = {
        padding: '1.25rem 1rem',
        fontSize: '0.95rem',
        color: '#374151',
        maxWidth: '150px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    };

    const tdFirstStyle = {
        ...tdStyle,
        borderTopLeftRadius: '12px',
        borderBottomLeftRadius: '12px',
        fontWeight: '600',
        maxWidth: '250px',
        minWidth: '180px'
    };

    const tdLastStyle = {
        padding: '1.25rem 1rem',
        fontSize: '0.95rem',
        color: '#374151',
        borderTopRightRadius: '12px',
        borderBottomRightRadius: '12px',
        position: 'relative',
        width: '120px' // Fixed width for actions column
    };

    const dropdownButtonStyle = {
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        border: 'none',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
        background: '#f3f4f6',
        color: 'white',
        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        whiteSpace: 'nowrap'
    };

    const dropdownMenuStyle = {
        position: 'absolute',
        top: '100%',
        right: '0',
        marginTop: '0.5rem',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: '150px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
    };

    const dropdownItemStyle = {
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '0.875rem',
        fontWeight: '500',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const actionButtonStyle = {
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        border: 'none',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginRight: '0',
        whiteSpace: 'nowrap',
        minWidth: '60px'
    };

    const editButtonStyle = {
        ...actionButtonStyle,
        background: '#f3f4f6',
        color: 'white',
        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
    };

    const viewButtonStyle = {
        ...actionButtonStyle,
        background: 'white',
        color: '#10b981',
        border: '2px solid #10b981'
    };

    const deleteButtonStyle = {
        ...actionButtonStyle,
        background: '#ef4444',
        color: 'white',
        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
        marginRight: 0
    };

    const emptyStateStyle = {
        textAlign: 'center',
        padding: '4rem 2rem'
    };

    const emptyIconStyle = {
        fontSize: '4rem',
        marginBottom: '1rem',
        opacity: '0.3'
    };

    const emptyTextStyle = {
        fontSize: '1.25rem',
        color: '#6b7280',
        marginBottom: '1.5rem'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={titleStyle}>Tour Management Dashboard</h1>
                <p style={{ fontSize: '1rem', opacity: '0.9' }}>Manage your tours and monitor performance</p>
            </div>

            {/* Stats Section */}
            <div style={statsContainerStyle}>
                {[
                    { title: 'Total Tours', value: stats.totalTours, icon: '🗺️' },
                    { title: 'Total Bookings', value: stats.totalBookings, icon: '👥' },
                    { title: 'Active Tours', value: stats.activeTours, icon: '✅' },
                    { title: 'Average Rating', value: `⭐ ${stats.averageRating}`, icon: '' }
                ].map((stat, index) => (
                    <div
                        key={index}
                        style={{
                            ...statCardStyle,
                            ...(hoveredCard === index ? statCardHoverStyle : {})
                        }}
                        onMouseEnter={() => setHoveredCard(index)}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                        <h3 style={statTitleStyle}>{stat.title}</h3>
                        <p style={statValueStyle}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div style={actionsContainerStyle}>
                <button
                    style={buttonPrimaryStyle}
                    onClick={() => navigate('/provider/tours/create')}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>+</span> Tạo Tour Mới
                </button>
                <button
                    style={buttonSecondaryStyle}
                    onClick={() => navigate('/provider/tours/bookings')}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#10b981';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = '#10b981';
                    }}
                >
                    Xem Tất Cả Bookings
                </button>
            </div>

            {/* Tours List */}
            <div style={toursListStyle}>
                <h2 style={sectionTitleStyle}>Your Tours</h2>
                {tours.length === 0 ? (
                    <div style={emptyStateStyle}>
                        <div style={emptyIconStyle}>🗺️</div>
                        <p style={emptyTextStyle}>Chưa có tour nào</p>
                        <button
                            style={buttonPrimaryStyle}
                            onClick={() => navigate('/provider/tours/create')}
                        >
                            Tạo tour đầu tiên
                        </button>
                    </div>
                ) : (
                    <div style={{
                        overflowX: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        width: '100%',
                        maxWidth: '100%'
                    }}>
                        <table style={tableStyle}>
                            <thead style={theadStyle}>
                                <tr>
                                    <th style={thFirstStyle}>Tên Tour</th>
                                    <th style={thStyle}>Địa điểm</th>
                                    <th style={thStyle}>Thời lượng</th>
                                    <th style={thStyle}>Giá</th>
                                    <th style={thStyle}>Độ khó</th>
                                    <th style={thStyle}>Trạng thái</th>
                                    <th style={thStyle}>Rating</th>
                                    <th style={thLastStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tours.map((tour, index) => (
                                    <tr
                                        key={tour._id}
                                        style={{
                                            ...trStyle,
                                            ...(hoveredRow === index ? {
                                                background: 'white',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                            } : {})
                                        }}
                                        onMouseEnter={() => setHoveredRow(index)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                    >
                                        <td style={tdFirstStyle} title={tour.title}>{tour.title}</td>
                                        <td style={tdStyle} title={
                                            tour.destinations && tour.destinations.length > 0
                                                ? tour.destinations.map(dest => dest.name || dest).join(', ')
                                                : Array.isArray(tour.destination_id) && tour.destination_id.length > 0
                                                    ? tour.destination_id.map(dest => typeof dest === 'object' ? dest.name : dest).join(', ')
                                                    : tour.location || 'Chưa có địa điểm'
                                        }>
                                            {tour.destinations && tour.destinations.length > 0
                                                ? tour.destinations.map(dest => dest.name || dest).join(', ')
                                                : Array.isArray(tour.destination_id) && tour.destination_id.length > 0
                                                    ? tour.destination_id.map(dest => typeof dest === 'object' ? dest.name : dest).join(', ')
                                                    : tour.location || 'Chưa có địa điểm'
                                            }
                                        </td>
                                        <td style={tdStyle}>{tour.duration_hours} giờ</td>
                                        <td style={tdStyle}>
                                            <span style={{ fontWeight: '600', color: '#10b981' }}>
                                                {formatCurrency(tour.pricing?.adult || tour.pricing?.base_price || tour.price)}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                background: tour.difficulty === 'easy' ? '#d1fae5' :
                                                    tour.difficulty === 'moderate' ? '#fef3c7' :
                                                        tour.difficulty === 'challenging' ? '#fed7aa' : '#fecaca',
                                                color: tour.difficulty === 'easy' ? '#065f46' :
                                                    tour.difficulty === 'moderate' ? '#92400e' :
                                                        tour.difficulty === 'challenging' ? '#9a3412' : '#991b1b'
                                            }}>
                                                {tour.difficulty === 'easy' ? 'Dễ' :
                                                    tour.difficulty === 'moderate' ? 'TB' :
                                                        tour.difficulty === 'challenging' ? 'Khó' : 'CG'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                background: tour.status === 'published' ? '#d1fae5' :
                                                    tour.status === 'draft' ? '#f3f4f6' : '#fecaca',
                                                color: tour.status === 'published' ? '#065f46' :
                                                    tour.status === 'draft' ? '#374151' : '#991b1b'
                                            }}>
                                                {tour.status === 'published' ? 'Hoạt động' :
                                                    tour.status === 'draft' ? 'Nháp' : 'Dừng'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ fontSize: '1.1rem' }}>⭐</span> {tour.rating || 0}
                                        </td>
                                        <td style={tdLastStyle}>
                                            <div style={{ position: 'relative' }}>
                                                <button
                                                    style={dropdownButtonStyle}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenDropdown(openDropdown === tour._id ? null : tour._id);
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    ⚙️ Actions
                                                </button>

                                                {openDropdown === tour._id && (
                                                    <div
                                                        style={dropdownMenuStyle}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div
                                                            style={dropdownItemStyle}
                                                            onClick={() => {
                                                                navigate(`/provider/tours/${tour._id}`);
                                                                setOpenDropdown(null);
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = '#f3f4f6';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'white';
                                                            }}
                                                        >
                                                            <span>👁️</span> Xem chi tiết
                                                        </div>
                                                        <div
                                                            style={dropdownItemStyle}
                                                            onClick={() => {
                                                                navigate(`/provider/tours/${tour._id}/edit`);
                                                                setOpenDropdown(null);
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = '#f3f4f6';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'white';
                                                            }}
                                                        >
                                                            <span>✏️</span> Chỉnh sửa
                                                        </div>
                                                        <div
                                                            style={{
                                                                ...dropdownItemStyle,
                                                                color: '#ef4444',
                                                                borderBottom: 'none'
                                                            }}
                                                            onClick={() => {
                                                                handleDeleteTour(tour._id, tour.title);
                                                                setOpenDropdown(null);
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = '#fef2f2';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'white';
                                                            }}
                                                        >
                                                            <span>🗑️</span> Xóa tour
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .stats-container {
            grid-template-columns: 1fr !important;
          }
          .actions-container {
            flex-direction: column;
          }
          .actions-container button {
            width: 100%;
          }
        }
        
        @media (max-width: 1200px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
        </div>
    );
};

export default TourDashboard;
