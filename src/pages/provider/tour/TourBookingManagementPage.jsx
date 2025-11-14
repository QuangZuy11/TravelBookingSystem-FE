import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  DollarSign,
  Users,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FilterX,
} from "lucide-react";
import {
  getTourBookingStatistics,
  getTourBookings,
  formatCurrency,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getBookingStatusLabel,
  getBookingStatusColor,
} from "../../../services/tourBookingService";

const TourBookingManagementPage = () => {
  const navigate = useNavigate();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [selectedBookingStatus, setSelectedBookingStatus] = useState("all");

  // Data states
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_bookings: 0,
    total_cancellations: 0,
    cancellation_rate: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const itemsPerPage = 10;

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await getTourBookingStatistics();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error fetching tour booking statistics:", err);
    }
  };

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      // Add filters
      if (searchTerm) params.search = searchTerm;
      if (selectedDate) params.booking_date = selectedDate;
      if (selectedPaymentStatus !== "all")
        params.payment_status = selectedPaymentStatus;
      if (selectedBookingStatus !== "all")
        params.booking_status = selectedBookingStatus;

      const response = await getTourBookings(params);

      if (response.success) {
        setBookings(response.data.bookings);
        setTotalPages(response.data.pagination.pages);
        setTotalBookings(response.data.pagination.total);
      }
    } catch (err) {
      console.error("Error fetching tour bookings:", err);
      setError(err.message || "Không thể tải danh sách booking");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    searchTerm,
    selectedDate,
    selectedPaymentStatus,
    selectedBookingStatus,
  ]);

  // Initial load
  useEffect(() => {
    fetchStatistics();
  }, []);

  // Fetch bookings when filters change
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedDate("");
    setSelectedPaymentStatus("all");
    setSelectedBookingStatus("all");
    setCurrentPage(1);
  };

  // Loading state
  if (loading && bookings.length === 0) {
    return (
      <div
        style={{
          padding: "2rem",
          background: "#f8f9fa",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              border: "4px solid #f3f4f6",
              borderTop: "4px solid #0a5757",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          ></div>
          <p style={{ color: "#6b7280" }}>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{ padding: "2rem", background: "#f8f9fa", minHeight: "100vh" }}
      >
        <div
          style={{
            background: "#fed7d7",
            borderRadius: "16px",
            padding: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            maxWidth: "600px",
            margin: "2rem auto",
          }}
        >
          <AlertCircle size={24} color="#991b1b" />
          <div>
            <h3 style={{ margin: 0, color: "#991b1b", fontSize: "1.125rem" }}>
              Lỗi tải dữ liệu
            </h3>
            <p style={{ margin: "0.5rem 0 0", color: "#7f1d1d" }}>{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchBookings();
              }}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                background: "#991b1b",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Stats Cards - 4 cards trên 1 dòng */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          onClick={() => navigate("/provider/revenue-statistics")}
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "2px solid transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow =
              "0 8px 16px rgba(10, 87, 87, 0.2)";
            e.currentTarget.style.borderColor = "#0a5757";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #0a5757 0%, #2d6a4f 100%)",
              borderRadius: "12px",
              padding: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DollarSign size={24} color="white" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
              Doanh thu
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "#1a1a1a",
              }}
            >
              {formatCurrency(stats.total_revenue)}
            </p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#10b981" }}>
              VND
            </p>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              background: "#e8f5e9",
              borderRadius: "12px",
              padding: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={24} color="#0a5757" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
              Lượt đặt tour
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "#1a1a1a",
              }}
            >
              {stats.total_bookings}
            </p>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffebee",
              borderRadius: "12px",
              padding: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <XCircle size={24} color="#ef4444" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
              Lượt hủy
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "#1a1a1a",
              }}
            >
              {stats.total_cancellations}
            </p>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              background: "#fff3e0",
              borderRadius: "12px",
              padding: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock size={24} color="#f59e0b" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
              Tỷ lệ hủy
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "#1a1a1a",
              }}
            >
              {stats.cancellation_rate}%
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
            <Search
              size={20}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            />
            <input
              type="text"
              placeholder="Tìm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.75rem",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0a5757")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          {/* Date Filter */}
          <div style={{ position: "relative", minWidth: "200px" }}>
            <Calendar
              size={20}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.75rem",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "0.875rem",
                outline: "none",
                cursor: "pointer",
              }}
            />
          </div>

          {/* Payment Status Filter */}
          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            style={{
              padding: "0.75rem 1rem",
              paddingRight: "2.5rem",
              border: "2px solid #e5e7eb",
              borderRadius: "10px",
              fontSize: "0.875rem",
              outline: "none",
              cursor: "pointer",
              minWidth: "150px",
              background: "white",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
            }}
          >
            <option value="all">Thanh toán</option>
            <option value="completed">Đã thanh toán</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="failed">Thất bại</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>

          {/* Booking Status Filter */}
          <select
            value={selectedBookingStatus}
            onChange={(e) => setSelectedBookingStatus(e.target.value)}
            style={{
              padding: "0.75rem 1rem",
              paddingRight: "2.5rem",
              border: "2px solid #e5e7eb",
              borderRadius: "10px",
              fontSize: "0.875rem",
              outline: "none",
              cursor: "pointer",
              minWidth: "150px",
              background: "white",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
            }}
          >
            <option value="all">Trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="paid">Đã thanh toán</option>
            <option value="in_progress">Đang diễn ra</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
            <option value="refunded">Đã hoàn tiền</option>
            <option value="no-show">Không đến</option>
          </select>

          {/* Reset Filters Button */}
          <button
            onClick={handleResetFilters}
            style={{
              padding: "0.75rem 1rem",
              border: "2px solid #e5e7eb",
              borderRadius: "10px",
              fontSize: "0.875rem",
              background: "white",
              color: "#6b7280",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s ease",
              fontWeight: "500",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
              e.currentTarget.style.borderColor = "#0a5757";
              e.currentTarget.style.color = "#0a5757";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            <FilterX size={18} />
            Xóa filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "1.5rem",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#6b7280",
                }}
              >
                No
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#6b7280",
                }}
              >
                Tên khách hàng
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#6b7280",
                }}
              >
                Ngày đặt
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#6b7280",
                }}
              >
                Số tiền
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#6b7280",
                }}
              >
                Thanh toán
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#6b7280",
                }}
              >
                Trạng Thái
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ padding: "3rem", textAlign: "center" }}
                >
                  <div
                    style={{
                      border: "4px solid #f3f4f6",
                      borderTop: "4px solid #0a5757",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      animation: "spin 1s linear infinite",
                      margin: "0 auto",
                    }}
                  ></div>
                  <p style={{ marginTop: "1rem", color: "#6b7280" }}>
                    Đang tải...
                  </p>
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ padding: "3rem", textAlign: "center" }}
                >
                  <p style={{ color: "#6b7280", fontSize: "1rem" }}>
                    Không có booking nào
                  </p>
                </td>
              </tr>
            ) : (
              bookings.map((booking, index) => {
                const paymentColor = getPaymentStatusColor(
                  booking.payment_status
                );
                const bookingColor = getBookingStatusColor(
                  booking.booking_status
                );
                const startIndex = (currentPage - 1) * itemsPerPage;

                return (
                  <tr
                    key={booking._id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      transition: "background 0.2s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "white")
                    }
                  >
                    <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                      {startIndex + index + 1}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                      }}
                    >
                      {booking.customer_name}
                      <br />
                      <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        {booking.booking_number}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                      {new Date(booking.booking_date).toLocaleDateString(
                        "vi-VN"
                      )}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                      }}
                    >
                      {formatCurrency(booking.total_amount)}
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                      <span
                        style={{
                          padding: "0.375rem 0.75rem",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          background: paymentColor.bg,
                          color: paymentColor.color,
                        }}
                      >
                        {getPaymentStatusLabel(booking.payment_status)}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                      <span
                        style={{
                          padding: "0.375rem 0.75rem",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          background: bookingColor.bg,
                          color: bookingColor.color,
                        }}
                      >
                        {getBookingStatusLabel(booking.booking_status)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Total Records */}
        {!loading && bookings.length > 0 && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.5rem 0",
              fontSize: "0.875rem",
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, totalBookings)} trong tổng số{" "}
            {totalBookings} booking
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "2rem",
              gap: "0.5rem",
            }}
          >
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: "0.5rem",
                border: "none",
                borderRadius: "8px",
                background: currentPage === 1 ? "#f3f4f6" : "#0a5757",
                color: currentPage === 1 ? "#9ca3af" : "white",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ChevronLeft size={20} />
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                style={{
                  padding: "0.5rem 0.875rem",
                  borderRadius: "8px",
                  background: currentPage === index + 1 ? "#0a5757" : "white",
                  color: currentPage === index + 1 ? "white" : "#6b7280",
                  fontWeight: currentPage === index + 1 ? "600" : "400",
                  cursor: "pointer",
                  border:
                    currentPage === index + 1 ? "none" : "1px solid #e5e7eb",
                }}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: "0.5rem",
                border: "none",
                borderRadius: "8px",
                background: currentPage === totalPages ? "#f3f4f6" : "#0a5757",
                color: currentPage === totalPages ? "#9ca3af" : "white",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* CSS for spinner animation */}
      <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
    </div>
  );
};

export default TourBookingManagementPage;
