import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import "./MyTours.css";

const MyTours = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchBookings();
  }, [user, filterStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const url = `http://localhost:3000/api/traveler/tour-bookings?${
        filterStatus !== "all" ? `status=${filterStatus}&` : ""
      }page=1&limit=100`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải danh sách tour");
      }

      const result = await response.json();

      if (result.success && result.data) {
        setBookings(result.data.bookings || []);
      } else {
        throw new Error(result.message || "Lỗi khi tải danh sách");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Chờ thanh toán", color: "#f59e0b" },
      paid: { label: "Đã thanh toán", color: "#10b981" },
      confirmed: { label: "Đã xác nhận", color: "#3b82f6" },
      cancelled: { label: "Đã hủy", color: "#ef4444" },
      completed: { label: "Hoàn thành", color: "#8b5cf6" },
      "no-show": { label: "Không đến", color: "#dc2626" },
    };

    const config = statusConfig[status] || {
      label: status,
      color: "#6b7280",
    };

    return (
      <span
        className="my-tours-status-badge"
        style={{
          backgroundColor: `${config.color}15`,
          color: config.color,
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="my-tours-page">
        <div className="my-tours-container">
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                border: "4px solid #e5e7eb",
                borderTopColor: "#06b6d4",
                borderRadius: "50%",
                margin: "0 auto 20px",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p style={{ color: "#6b7280", fontSize: "16px" }}>
              Đang tải danh sách tour...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-tours-page">
        <div className="my-tours-container">
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <svg
              style={{
                width: "64px",
                height: "64px",
                color: "#ef4444",
                margin: "0 auto 20px",
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "8px",
              }}
            >
              Không thể tải danh sách tour
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: "#06b6d4",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-tours-page">
      <div className="my-tours-container">
        <div className="my-tours-page-header">
          <h1 className="my-tours-page-title">Tour đã đặt của tôi</h1>
          <p className="my-tours-page-subtitle">
            Quản lý và xem chi tiết các tour bạn đã đặt
          </p>
        </div>

        {/* Filter Section */}
        <div className="my-tours-filter-section">
          <button
            className={`my-tours-filter-btn ${
              filterStatus === "all" ? "my-tours-filter-btn-active" : ""
            }`}
            onClick={() => setFilterStatus("all")}
          >
            Tất cả
          </button>
          <button
            className={`my-tours-filter-btn ${
              filterStatus === "paid" ? "my-tours-filter-btn-active" : ""
            }`}
            onClick={() => setFilterStatus("paid")}
          >
            Đã thanh toán
          </button>
          <button
            className={`my-tours-filter-btn ${
              filterStatus === "pending" ? "my-tours-filter-btn-active" : ""
            }`}
            onClick={() => setFilterStatus("pending")}
          >
            Chờ thanh toán
          </button>
          <button
            className={`my-tours-filter-btn ${
              filterStatus === "confirmed" ? "my-tours-filter-btn-active" : ""
            }`}
            onClick={() => setFilterStatus("confirmed")}
          >
            Đã xác nhận
          </button>
          <button
            className={`my-tours-filter-btn ${
              filterStatus === "cancelled" ? "my-tours-filter-btn-active" : ""
            }`}
            onClick={() => setFilterStatus("cancelled")}
          >
            Đã hủy
          </button>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="my-tours-empty-state">
            <svg
              style={{
                width: "80px",
                height: "80px",
                color: "#d1d5db",
                margin: "0 auto 24px",
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Chưa có tour nào
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              Bạn chưa đặt tour nào. Hãy khám phá các tour tuyệt vời của chúng
              tôi!
            </p>
            <button
              onClick={() => navigate("/tour")}
              style={{
                backgroundColor: "#06b6d4",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Khám phá tour
            </button>
          </div>
        ) : (
          <div className="my-tours-bookings-grid">
            {bookings.map((booking) => {
              const tour = booking.tour_id;
              const pricing = booking.pricing || {};

              return (
                <div
                  key={booking._id}
                  className="my-tours-booking-card"
                  onClick={() => navigate(`/my-tours/${booking._id}`)}
                >
                  <div className="my-tours-booking-card-header">
                    <div className="my-tours-booking-number">
                      Mã đặt: {booking.booking_number}
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  {tour && (
                    <>
                      <div className="my-tours-booking-tour-image">
                        <img
                          src={
                            tour.image ||
                            "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800"
                          }
                          alt={tour.title || tour.name}
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800";
                          }}
                        />
                      </div>

                      <div className="my-tours-booking-card-body">
                        <h3 className="my-tours-booking-tour-title">
                          {tour.title || tour.name}
                        </h3>

                        <div className="my-tours-booking-info">
                          {tour.meeting_point && (
                            <>
                              {tour.meeting_point.address && (
                                <div className="my-tours-info-row">
                                  <span className="my-tours-bullet">•</span>
                                  <span>
                                    Điểm tập trung: {tour.meeting_point.address}
                                  </span>
                                </div>
                              )}
                              {tour.meeting_point.instructions && (
                                <div className="my-tours-info-row">
                                  <span className="my-tours-bullet">•</span>
                                  <span>
                                    Hướng dẫn: {tour.meeting_point.instructions}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                          <div className="my-tours-info-row">
                            <svg
                              className="my-tours-info-icon"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>
                              Ngày khởi hành: {formatDate(booking.tour_date)}
                            </span>
                          </div>

                          <div className="my-tours-info-row">
                            <svg
                              className="my-tours-info-icon"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            <span>
                              Số khách: {booking.total_participants || 1} người
                            </span>
                          </div>

                          <div className="my-tours-info-row">
                            <svg
                              className="my-tours-info-icon"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="my-tours-booking-price">
                              Tổng tiền:{" "}
                              {formatPrice(
                                pricing.total_amount ||
                                  tour.price * (booking.total_participants || 1)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="my-tours-booking-card-footer">
                    <span className="my-tours-booking-date">
                      Đặt ngày: {formatDate(booking.booking_date)}
                    </span>
                    <button className="my-tours-view-detail-btn">
                      Xem chi tiết →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MyTours;
