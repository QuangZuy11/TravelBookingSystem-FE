import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tourApi } from "../../../api/tourApi";
import { formatCurrency } from "../../../utils/tourHelpers";
import LoadingSpinner from "../../../components/shared/LoadingSpinner";
import ErrorAlert from "../../../components/shared/ErrorAlert";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Phone,
  DollarSign,
  Users,
  AlertCircle,
} from "lucide-react";

const TourBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAttendance, setFilterAttendance] = useState("all");
  const [processingBooking, setProcessingBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [filterDate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (filterDate) {
        filters.date = filterDate;
      }
      const response = await tourApi.getProviderBookings(filters);
      const bookingsData =
        response.data?.data || response.data || response || [];
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Không thể tải danh sách đặt tour");
      toast.error("Không thể tải danh sách đặt tour");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (bookingId) => {
    if (!window.confirm("Xác nhận check-in cho khách hàng này?")) {
      return;
    }

    try {
      setProcessingBooking(bookingId);
      await tourApi.checkInBooking(bookingId);
      toast.success("Check-in thành công!");
      await fetchBookings(); // Refresh list
    } catch (err) {
      console.error("Error checking in:", err);
      console.error("Error response:", err.response?.data);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Không thể check-in";
      toast.error(errorMessage);
      if (err.response?.data?.details) {
        console.error("Error details:", err.response.data.details);
      }
    } finally {
      setProcessingBooking(null);
    }
  };

  const handleMarkNoShow = async (bookingId) => {
    if (!window.confirm("Xác nhận đánh dấu khách hàng không đến tour?")) {
      return;
    }

    try {
      setProcessingBooking(bookingId);
      await tourApi.markNoShow(bookingId);
      toast.success("Đã đánh dấu không đến tour");
      await fetchBookings(); // Refresh list
    } catch (err) {
      console.error("Error marking no-show:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể đánh dấu no-show";
      toast.error(errorMessage);
    } finally {
      setProcessingBooking(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "#3b82f6";
      case "paid":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "in_progress":
        return "#8b5cf6";
      case "completed":
        return "#6366f1";
      case "cancelled":
        return "#ef4444";
      case "no-show":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "confirmed":
        return "✅ Đã xác nhận";
      case "paid":
        return "💰 Đã thanh toán";
      case "pending":
        return "⏳ Chờ xử lý";
      case "in_progress":
        return "🚌 Đang diễn ra";
      case "completed":
        return "🎉 Hoàn thành";
      case "cancelled":
        return "❌ Đã hủy";
      case "no-show":
        return "🚫 Không đến";
      default:
        return status;
    }
  };

  const getAttendanceColor = (attendanceStatus) => {
    switch (attendanceStatus) {
      case "attended":
        return "#10b981";
      case "no-show":
        return "#dc2626";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getAttendanceLabel = (attendanceStatus) => {
    switch (attendanceStatus) {
      case "attended":
        return "✅ Đã đến";
      case "no-show":
        return "🚫 Không đến";
      case "pending":
        return "⏳ Chờ check-in";
      default:
        return attendanceStatus || "Chưa xác định";
    }
  };

  // Filter bookings by date, status, and attendance
  const filteredBookings = bookings.filter((booking) => {
    // Filter by status
    const statusMatch =
      filterStatus === "all" || booking.status === filterStatus;

    // Filter by attendance
    const attendanceMatch =
      filterAttendance === "all" ||
      booking.attendance_status === filterAttendance;

    return statusMatch && attendanceMatch;
  });

  const canCheckIn = (booking) => {
    return (
      booking.attendance_status === "pending" &&
      booking.status !== "cancelled" &&
      booking.status !== "refunded" &&
      booking.status !== "no-show"
    );
  };

  const canMarkNoShow = (booking) => {
    return (
      booking.attendance_status === "pending" &&
      booking.status !== "cancelled" &&
      booking.status !== "refunded"
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <button
              onClick={() => navigate("/provider/tours")}
              style={{
                background: "none",
                border: "none",
                color: "#667eea",
                fontSize: "1rem",
                cursor: "pointer",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              ← Quay lại danh sách tour
            </button>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "0.5rem",
              }}
            >
              ✅ Check-in & Quản lý tham gia tour
            </h1>
            <p style={{ color: "#6b7280" }}>
              Tổng cộng {filteredBookings.length} đặt tour
              {filterDate && (
                <span style={{ marginLeft: "1rem", fontWeight: "600" }}>
                  • Ngày {new Date(filterDate).toLocaleDateString("vi-VN")}:{" "}
                  {filteredBookings.length} tour
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "2rem",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          }}
        >
          {/* Date Filter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.5rem",
              paddingBottom: "1.5rem",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <label
              style={{
                fontWeight: "600",
                color: "#374151",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Calendar size={18} />
              Lọc theo ngày tour:
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "2px solid #e5e7eb",
                fontSize: "1rem",
                cursor: "pointer",
                minWidth: "200px",
              }}
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "2px solid #ef4444",
                  background: "white",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                }}
              >
                Xóa bộ lọc ngày
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "center",
              marginTop: "1.5rem",
            }}
          >
            <span
              style={{ fontWeight: "600", color: "#374151", width: "100%" }}
            >
              Lọc theo trạng thái:
            </span>
            {[
              "all",
              "pending",
              "paid",
              "confirmed",
              "in_progress",
              "completed",
              "cancelled",
              "no-show",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: filterStatus === status ? "#667eea" : "#e5e7eb",
                  background: filterStatus === status ? "#667eea" : "white",
                  color: filterStatus === status ? "white" : "#374151",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                }}
              >
                {status === "all" ? "Tất cả" : getStatusLabel(status)}
              </button>
            ))}
          </div>

          {/* Attendance Filter */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "center",
              marginTop: "1rem",
            }}
          >
            <span
              style={{ fontWeight: "600", color: "#374151", width: "100%" }}
            >
              Lọc theo tham gia:
            </span>
            {["all", "pending", "attended", "no-show"].map((attendance) => (
              <button
                key={attendance}
                onClick={() => setFilterAttendance(attendance)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor:
                    filterAttendance === attendance ? "#667eea" : "#e5e7eb",
                  background:
                    filterAttendance === attendance ? "#667eea" : "white",
                  color: filterAttendance === attendance ? "white" : "#374151",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                }}
              >
                {attendance === "all"
                  ? "Tất cả"
                  : getAttendanceLabel(attendance)}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          }}
        >
          {filteredBookings.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 2rem",
                color: "#6b7280",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📅</div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                Không có đặt tour nào
              </h3>
              <p>
                {filterDate
                  ? `Không có tour nào vào ngày ${new Date(
                      filterDate
                    ).toLocaleDateString("vi-VN")} phù hợp với bộ lọc`
                  : filterStatus !== "all" || filterAttendance !== "all"
                  ? "Không có đặt tour nào phù hợp với bộ lọc"
                  : "Chưa có khách hàng nào đặt tour của bạn"}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "1.5rem",
              }}
            >
              {filteredBookings.map((booking, index) => {
                const tour = booking.tour_id || {};
                const customer = booking.customer_id || {};
                const isProcessing = processingBooking === booking._id;

                return (
                  <div
                    key={booking._id || index}
                    style={{
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      background: "#f9fafb",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1rem",
                        alignItems: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      {/* Customer Info */}
                      <div>
                        <h4
                          style={{
                            fontSize: "1.1rem",
                            fontWeight: "700",
                            color: "#1f2937",
                            marginBottom: "0.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <User size={18} />
                          {customer?.name || "Khách hàng"}
                        </h4>
                        <p
                          style={{
                            color: "#6b7280",
                            margin: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <Phone size={14} />
                          {booking.contact_info?.phone || "Chưa có SĐT"}
                        </p>
                        <p
                          style={{
                            color: "#6b7280",
                            margin: "0.25rem 0 0 0",
                            fontSize: "0.9rem",
                          }}
                        >
                          {booking.contact_info?.email || customer?.email || ""}
                        </p>
                      </div>

                      {/* Tour Info */}
                      <div>
                        <div
                          style={{ marginBottom: "0.5rem", fontWeight: "600" }}
                        >
                          {tour.title || "Tour"}
                        </div>
                        <div
                          style={{
                            color: "#6b7280",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "0.25rem",
                          }}
                        >
                          <Calendar size={14} />
                          {booking.tour_date
                            ? new Date(booking.tour_date).toLocaleDateString(
                                "vi-VN"
                              )
                            : "TBD"}
                        </div>
                        <div
                          style={{
                            color: "#6b7280",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <Users size={14} />
                          {booking.total_participants || 0} người
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div>
                        <div
                          style={{
                            marginBottom: "0.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <DollarSign size={16} />
                          <strong>Tổng tiền:</strong>
                        </div>
                        <div
                          style={{
                            color: "#10b981",
                            fontWeight: "600",
                            fontSize: "1.1rem",
                          }}
                        >
                          {booking.pricing?.total_amount
                            ? formatCurrency(booking.pricing.total_amount)
                            : "TBD"}
                        </div>
                        <div
                          style={{
                            color: "#6b7280",
                            fontSize: "0.9rem",
                            marginTop: "0.25rem",
                          }}
                        >
                          Mã: {booking.booking_number || booking._id?.slice(-6)}
                        </div>
                      </div>

                      {/* Status & Attendance */}
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            display: "inline-block",
                            padding: "0.5rem 1rem",
                            borderRadius: "20px",
                            background: getStatusColor(booking.status),
                            color: "white",
                            fontWeight: "600",
                            fontSize: "0.9rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {getStatusLabel(booking.status)}
                        </div>
                        <div
                          style={{
                            display: "inline-block",
                            padding: "0.4rem 0.8rem",
                            borderRadius: "20px",
                            background: getAttendanceColor(
                              booking.attendance_status
                            ),
                            color: "white",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                          }}
                        >
                          {getAttendanceLabel(booking.attendance_status)}
                        </div>
                        {booking.checked_in_at && (
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#6b7280",
                              marginTop: "0.25rem",
                            }}
                          >
                            Check-in:{" "}
                            {new Date(booking.checked_in_at).toLocaleString(
                              "vi-VN"
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        marginTop: "1rem",
                        paddingTop: "1rem",
                        borderTop: "1px solid #e5e7eb",
                      }}
                    >
                      {canCheckIn(booking) && (
                        <button
                          onClick={() => handleCheckIn(booking._id)}
                          disabled={isProcessing}
                          style={{
                            flex: 1,
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            border: "none",
                            background: "#10b981",
                            color: "white",
                            fontWeight: "600",
                            cursor: isProcessing ? "not-allowed" : "pointer",
                            opacity: isProcessing ? 0.6 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                          }}
                        >
                          {isProcessing ? (
                            <>⏳ Đang xử lý...</>
                          ) : (
                            <>
                              <CheckCircle size={18} />
                              Check-in
                            </>
                          )}
                        </button>
                      )}
                      {canMarkNoShow(booking) && (
                        <button
                          onClick={() => handleMarkNoShow(booking._id)}
                          disabled={isProcessing}
                          style={{
                            flex: 1,
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            border: "none",
                            background: "#dc2626",
                            color: "white",
                            fontWeight: "600",
                            cursor: isProcessing ? "not-allowed" : "pointer",
                            opacity: isProcessing ? 0.6 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                          }}
                        >
                          {isProcessing ? (
                            <>⏳ Đang xử lý...</>
                          ) : (
                            <>
                              <XCircle size={18} />
                              Đánh dấu không đến
                            </>
                          )}
                        </button>
                      )}
                      {booking.attendance_status === "attended" && (
                        <div
                          style={{
                            flex: 1,
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            background: "#d1fae5",
                            color: "#065f46",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <CheckCircle size={18} />
                          Đã check-in
                        </div>
                      )}
                      {booking.attendance_status === "no-show" && (
                        <div
                          style={{
                            flex: 1,
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            background: "#fee2e2",
                            color: "#991b1b",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <AlertCircle size={18} />
                          Không đến
                        </div>
                      )}
                    </div>

                    {/* Special Requests */}
                    {booking.special_requests && (
                      <div
                        style={{
                          marginTop: "1rem",
                          padding: "1rem",
                          background: "#fef3c7",
                          border: "1px solid #f59e0b",
                          borderRadius: "8px",
                        }}
                      >
                        <strong>Yêu cầu đặc biệt:</strong>{" "}
                        {booking.special_requests}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourBookingsPage;
