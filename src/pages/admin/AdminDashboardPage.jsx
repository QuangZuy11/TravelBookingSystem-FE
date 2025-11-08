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

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  if (loading) return <div className="admin-page-loading">Đang tải dashboard...</div>;

  return (
    <>
      <header className="admin-page-header">
        <div className="header-left"><h1>Admin Dashboard</h1></div>
        <div className="header-right"><Link to="/" className="btn-secondary">← Về Trang Chủ</Link></div>
      </header>

      <div className="admin-stats">
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
          <p className="stat-value">{formatCurrency(stats?.revenueThisMonth || 0)}</p>
        </div>
      </div>

      {/* Bỏ 3 widget-card vì đã có navbar trái */}
    </>
  );
};

export default AdminDashboardPage;
