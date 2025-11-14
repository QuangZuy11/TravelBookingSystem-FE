import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DollarSign, Users, FileText, Package, Building2 } from "lucide-react";
import adminService from "../../services/adminService";
import "./Admin.css";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [activeAds, setActiveAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAds, setLoadingAds] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getDashboardStats();
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchActiveAds = async () => {
      try {
        const response = await adminService.getActiveAdBookings();
        setActiveAds(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch active ads:", error);
      } finally {
        setLoadingAds(false);
      }
    };
    fetchActiveAds();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  };

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        background: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #0a5757',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280' }}>Đang tải dashboard...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <header className="admin-page-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="header-right">
          <Link to="/" className="btn-secondary">← Về Trang Chủ</Link>
        </div>
      </header>

      {/* Stats Cards - Chỉ hiển thị 3 cards có dữ liệu */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Card 1: Tổng người dùng */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            background: '#e8f5e9',
            borderRadius: '12px',
            padding: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={24} color="#0a5757" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>TỔNG NGƯỜI DÙNG</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
              {stats?.totalUsers || 0}
            </p>
          </div>
        </div>

        {/* Card 2: Tổng doanh thu từ quảng cáo */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0a5757 0%, #2d6a4f 100%)',
            borderRadius: '12px',
            padding: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={24} color="white" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>DOANH THU QUẢNG CÁO</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
              {formatCurrency(stats?.totalRevenue || 0)}
            </p>
          </div>
        </div>

        {/* Card 3: Tổng lượt đặt quảng cáo */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            background: '#e3f2fd',
            borderRadius: '12px',
            padding: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={24} color="#1976d2" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>TỔNG LƯỢT ĐẶT QC</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
              {stats?.totalAdBookings || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Danh sách Tour/Hotel đang quảng cáo */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          margin: '0 0 1.5rem 0',
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#1a1a1a'
        }}>
          Danh sách Tour/Hotel đang quảng cáo
        </h2>

        {loadingAds ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #0a5757',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: '#6b7280' }}>Đang tải danh sách...</p>
          </div>
        ) : activeAds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <p style={{ fontSize: '1rem', margin: 0 }}>Chưa có tour/hotel nào đang quảng cáo</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {activeAds.map((ad) => {
              const item = ad.tour || ad.hotel;
              // Tour có images array hoặc image string, Hotel có images array
              let itemImage = '/placeholder-image.jpg';
              if (item) {
                if (item.images && item.images.length > 0) {
                  itemImage = item.images[0];
                } else if (item.image) {
                  // Tour có thể có image (string) thay vì images (array)
                  itemImage = item.image;
                }
              }
              
              return (
                <div
                  key={ad.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Image */}
                  <div style={{
                    width: '100%',
                    height: '200px',
                    background: `url(${itemImage}) center/cover`,
                    backgroundColor: '#e5e7eb'
                  }}></div>

                  {/* Content */}
                  <div style={{ padding: '1rem' }}>
                    {/* Type badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      background: ad.ad_type === 'tour' ? '#e3f2fd' : '#fff3e0',
                      color: ad.ad_type === 'tour' ? '#1976d2' : '#f59e0b',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      marginBottom: '0.75rem'
                    }}>
                      {ad.ad_type === 'tour' ? (
                        <Package size={14} />
                      ) : (
                        <Building2 size={14} />
                      )}
                      <span>{ad.ad_type === 'tour' ? 'TOUR' : 'HOTEL'}</span>
                    </div>

                    {/* Name */}
                    <h3 style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1a1a1a'
                    }}>
                      {item?.name || 'N/A'}
                    </h3>

                    {/* Provider */}
                    {ad.provider && (
                      <p style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                      }}>
                        Provider: {ad.provider.name || ad.provider.email}
                      </p>
                    )}

                    {/* Price */}
                    <p style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#0a5757'
                    }}>
                      Giá quảng cáo: {formatCurrency(ad.price)}
                    </p>

                    {/* Dates */}
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      <div>
                        <strong>Bắt đầu:</strong>{' '}
                        {new Date(ad.start_date).toLocaleDateString('vi-VN')}
                      </div>
                      <div>
                        <strong>Kết thúc:</strong>{' '}
                        {new Date(ad.end_date).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
