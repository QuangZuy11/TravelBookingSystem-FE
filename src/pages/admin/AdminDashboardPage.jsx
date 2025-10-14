import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import adminService from "../../services/adminService";
import "./Admin.css";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return <div className="admin-page-loading">Đang tải dashboard...</div>;
  }

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="header-right">
          <Link to="/" className="btn-secondary">
            ← Về Trang Chủ
          </Link>
        </div>
      </header>

      <div className="stats-cards-grid">
        <div className="stat-card">
          <h3>Tổng người dùng</h3>
          <p className="stat-value">{stats?.totalUsers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Tour đang hoạt động</h3>
          <p className="stat-value">{stats?.activeTours || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Booking hôm nay</h3>
          <p className="stat-value">{stats?.bookingsToday || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Doanh thu tháng</h3>
          <p className="stat-value">
            {formatCurrency(stats?.revenueThisMonth || 0)}
          </p>
        </div>
      </div>

      <div className="widget-cards-grid">
        <div className="widget-card">
          <h2>Quản lý người dùng</h2>
          <p>Quản lý tài khoản du khách và nhà cung cấp dịch vụ.</p>
          <Link to="/admin/users" className="widget-button">
            Xem chi tiết
          </Link>
        </div>
        <div className="widget-card">
          <h2>Quản lý Service Provider</h2>
          <p>Duyệt và quản lý các nhà cung cấp dịch vụ trong hệ thống.</p>
          <Link to="/admin/providers" className="widget-button">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
