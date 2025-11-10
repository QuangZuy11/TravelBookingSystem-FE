import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../../contexts/AuthContext";
import {
  List,
  Bookmark,
  XCircle,
  MapPin,
  Calendar,
  DollarSign,
  Info,
  X,
  Building,
  Bed,
  Clock,
} from "lucide-react";
import { getProxiedGoogleDriveUrl } from "../../../../../utils/googleDriveImageHelper";
import "./MyBookedHotels.css";

const MyBookedHotels = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Define fetchBookings BEFORE useEffect to avoid initialization error
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Bạn cần đăng nhập để xem danh sách khách sạn đã đặt");
      }

      // Map filter status to API status
      let apiStatus = null;
      if (filterStatus === "booked") {
        apiStatus = "reserved,confirmed";
      } else if (filterStatus === "cancelled") {
        apiStatus = "cancelled";
      }

      const url = `http://localhost:3000/api/traveler/bookings?${apiStatus ? `status=${apiStatus}&` : ""
        }page=1&limit=100`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Không thể tải danh sách khách sạn đã đặt";

        if (response.status === 401) {
          errorMessage = "Bạn cần đăng nhập để xem danh sách khách sạn đã đặt";
        } else if (response.status === 500) {
          errorMessage = "Lỗi server. Vui lòng thử lại sau.";
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const bookingsData = result.data.bookings || [];
        setBookings(bookingsData);
        setError(null);
      } else {
        throw new Error(result.message || "Lỗi khi tải danh sách");
      }
    } catch (err) {
      setError(err.message || "Không thể tải danh sách khách sạn đã đặt");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchBookings();
  }, [user, filterStatus, fetchBookings, navigate]);

  const formatPrice = (price) => {
    // Handle Decimal128, string, or number
    let numericPrice = price;

    if (price && typeof price === 'object' && price.$numberDecimal) {
      // MongoDB Decimal128 format
      numericPrice = parseFloat(price.$numberDecimal);
    } else if (typeof price === 'string') {
      numericPrice = parseFloat(price);
    } else if (typeof price === 'number') {
      numericPrice = price;
    } else {
      // Fallback to 0 if price is invalid
      numericPrice = 0;
    }

    // Check if numericPrice is valid
    if (isNaN(numericPrice) || numericPrice < 0) {
      return "0 VNĐ";
    }

    return new Intl.NumberFormat("vi-VN").format(numericPrice) + " VNĐ";
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

  const formatAddress = (address) => {
    if (!address) return "Địa chỉ khách sạn";
    if (typeof address === "string") return address;

    const parts = [
      address.street,
      address.state,
      address.city,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "Địa chỉ khách sạn";
  };

  const getRoomTypeName = (type) => {
    const typeMap = {
      single: "Phòng Đơn",
      double: "Phòng Đôi",
      twin: "Phòng 2 Giường",
      suite: "Phòng Suite",
      deluxe: "Phòng Deluxe",
      family: "Phòng Gia Đình",
    };
    return typeMap[type] || "Phòng Tiêu Chuẩn";
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      reserved: { label: "Đã đặt", color: "#3b82f6", icon: Bookmark },
      confirmed: { label: "Đã xác nhận", color: "#10b981", icon: Bookmark },
      cancelled: { label: "Đã hủy", color: "#ef4444", icon: XCircle },
      completed: { label: "Hoàn thành", color: "#8b5cf6", icon: Bookmark },
    };

    const config = statusConfig[status] || {
      label: status,
      color: "#6b7280",
      icon: Bookmark,
    };

    const Icon = config.icon;

    return (
      <span
        className="my-booked-hotels-status-badge"
        style={{
          backgroundColor: `${config.color}15`,
          color: config.color,
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "13px",
          fontWeight: "600",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCancelBooking = async (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!selectedBooking) return;

    try {
      setCancelling(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/traveler/bookings/${selectedBooking._id}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setShowCancelModal(false);
        setSelectedBooking(null);
        fetchBookings(); // Refresh list
      } else {
        alert(result.message || "Không thể hủy đặt phòng");
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Có lỗi xảy ra khi hủy đặt phòng");
    } finally {
      setCancelling(false);
    }
  };

  // Bookings are already filtered by API, no need to filter again on frontend
  const filteredBookings = bookings;

  if (loading) {
    return (
      <div className="my-booked-hotels-container">
        <div className="my-booked-hotels-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách khách sạn đã đặt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-booked-hotels-container">
        <div className="my-booked-hotels-error">
          <p>{error}</p>
          <button onClick={fetchBookings} className="btn-retry">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-booked-hotels-container">
      <div className="my-booked-hotels-header">
        <h1>Khách sạn đã đặt của tôi</h1>
        <p>Quản lý và xem chi tiết các khách sạn bạn đã đặt</p>
      </div>

      <div className="my-booked-hotels-filters">
        <button
          className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          <List size={18} />
          Tất cả
        </button>
        <button
          className={`filter-btn ${filterStatus === "booked" ? "active" : ""}`}
          onClick={() => setFilterStatus("booked")}
        >
          <Bookmark size={18} />
          Đã đặt
        </button>
        <button
          className={`filter-btn ${filterStatus === "cancelled" ? "active" : ""}`}
          onClick={() => setFilterStatus("cancelled")}
        >
          <XCircle size={18} />
          Đã hủy
        </button>
      </div>

      <div className="my-booked-hotels-list">
        {filteredBookings.length === 0 ? (
          <div className="my-booked-hotels-empty">
            <Building size={64} color="#9ca3af" />
            <h3>Chưa có khách sạn nào được đặt</h3>
            <p>Hãy bắt đầu đặt phòng khách sạn của bạn ngay hôm nay!</p>
            <button
              className="btn-primary"
              onClick={() => navigate("/hotel-list")}
            >
              Tìm khách sạn
            </button>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const hotel = booking.hotel_room_id?.hotelId;
            const room = booking.hotel_room_id;

            return (
              <div
                key={booking._id}
                className={`my-booked-hotels-card ${booking.booking_status === "cancelled" ? "cancelled" : ""
                  }`}
              >
                <div className="booking-card-image">
                  {hotel?.images && hotel.images.length > 0 ? (
                    <img
                      src={getProxiedGoogleDriveUrl(hotel.images[0])}
                      alt={hotel.name || "Khách sạn"}
                      onError={(e) => {
                        // Fallback to unsplash image if proxy fails
                        e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop";
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="booking-card-image-placeholder">
                      <Building size={48} color="#9ca3af" />
                    </div>
                  )}
                </div>

                <div className="booking-card-content">
                  <h3 className="booking-card-title">
                    {hotel?.name || "Tên khách sạn"}
                  </h3>

                  <div className="booking-card-details">
                    <div className="booking-card-detail-item">
                      <MapPin size={16} color="#666" />
                      <span>{formatAddress(hotel?.address)}</span>
                    </div>

                    <div className="booking-card-detail-item">
                      <Calendar size={16} color="#666" />
                      <span>
                        {formatDate(booking.booking_date || booking.created_at)}
                      </span>
                    </div>

                    <div className="booking-card-detail-item">
                      <Bed size={16} color="#666" />
                      <span>
                        Phòng #{room?.roomNumber || "N/A"} -{" "}
                        {getRoomTypeName(room?.type)}
                      </span>
                    </div>

                    <div className="booking-card-detail-item">
                      <Clock size={16} color="#666" />
                      <span>
                        {formatDate(booking.check_in_date)} -{" "}
                        {formatDate(booking.check_out_date)}
                      </span>
                    </div>

                    <div className="booking-card-detail-item">
                      <DollarSign size={16} color="#666" />
                      <span className="booking-card-price">
                        {formatPrice(booking.total_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="booking-card-status">
                    {getStatusBadge(booking.booking_status)}
                  </div>
                </div>

                <div className="booking-card-actions">
                  <button
                    className="btn-details"
                    onClick={() => handleViewDetails(booking)}
                  >
                    <Info size={18} />
                    Chi Tiết
                  </button>

                  {booking.booking_status !== "cancelled" &&
                    booking.booking_status !== "completed" && (
                      <button
                        className="btn-cancel"
                        onClick={() => handleCancelBooking(booking)}
                      >
                        <X size={18} />
                        Hủy phòng
                      </button>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Details Modal - Matching Mockup */}
      {selectedBooking && (
        <div
          className="booking-details-modal-overlay"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="booking-details-modal"
            style={{ maxWidth: "800px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="booking-details-modal-header">
              <h2>Thông tin phòng đã đặt</h2>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedBooking(null)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="booking-details-modal-content" style={{ padding: "0" }}>
              {/* Hotel Image and Details Card */}
              <div
                style={{
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                  padding: "24px",
                  margin: "24px",
                  display: "flex",
                  gap: "24px",
                }}
              >
                {/* Left: Hotel Image */}
                <div
                  style={{
                    width: "200px",
                    height: "200px",
                    minWidth: "200px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: "#e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {(() => {
                    const hotel = selectedBooking.hotel_room_id?.hotelId;
                    const room = selectedBooking.hotel_room_id;
                    // Prefer room image, fallback to hotel image
                    const imageUrl = (room?.images && room.images.length > 0)
                      ? room.images[0]
                      : (hotel?.images && hotel.images.length > 0)
                        ? hotel.images[0]
                        : null;

                    return imageUrl ? (
                      <img
                        src={getProxiedGoogleDriveUrl(imageUrl)}
                        alt={hotel?.name || "Khách sạn"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          height: "100%",
                          color: "#9ca3af",
                        }}
                      >
                        <Building size={64} />
                      </div>
                    );
                  })()}
                </div>

                {/* Right: Room Details */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {/* Loại phòng */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Bed size={20} color="#666" />
                    <div>
                      <strong>Loại phòng:</strong>{" "}
                      {getRoomTypeName(selectedBooking.hotel_room_id?.type)}
                    </div>
                  </div>

                  {/* Số Phòng */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <MapPin size={20} color="#666" />
                    <div>
                      <strong>Số Phòng:</strong>{" "}
                      {selectedBooking.hotel_room_id?.roomNumber || "N/A"}
                    </div>
                  </div>

                  {/* Ngày nhận */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Calendar size={20} color="#666" />
                    <div>
                      <strong>Ngày nhận:</strong>{" "}
                      {formatDate(selectedBooking.check_in_date)}
                    </div>
                  </div>

                  {/* Ngày trả */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Calendar size={20} color="#666" />
                    <div>
                      <strong>Ngày trả:</strong>{" "}
                      {formatDate(selectedBooking.check_out_date)}
                    </div>
                  </div>

                  {/* Số đêm */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Clock size={20} color="#666" />
                    <div>
                      <strong>Số đêm:</strong>{" "}
                      {Math.ceil(
                        (new Date(selectedBooking.check_out_date) -
                          new Date(selectedBooking.check_in_date)) /
                        (1000 * 60 * 60 * 24)
                      )}{" "}
                      đêm
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div style={{ padding: "0 24px 24px 24px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <strong>Tên khách sạn:</strong>
                    <div style={{ marginTop: "4px", color: "#666" }}>
                      {selectedBooking.hotel_room_id?.hotelId?.name || "N/A"}
                    </div>
                  </div>
                  <div>
                    <strong>Địa chỉ:</strong>
                    <div style={{ marginTop: "4px", color: "#666" }}>
                      {formatAddress(
                        selectedBooking.hotel_room_id?.hotelId?.address
                      )}
                    </div>
                  </div>
                  <div>
                    <strong>Mã booking:</strong>
                    <div style={{ marginTop: "4px", color: "#666" }}>
                      {selectedBooking._id}
                    </div>
                  </div>
                  <div>
                    <strong>Trạng thái:</strong>
                    <div style={{ marginTop: "4px" }}>
                      {getStatusBadge(selectedBooking.booking_status)}
                    </div>
                  </div>
                  <div>
                    <strong>Tổng tiền:</strong>
                    <div
                      style={{
                        marginTop: "4px",
                        color: "#2d6a4f",
                        fontWeight: "600",
                      }}
                    >
                      {formatPrice(selectedBooking.total_amount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="booking-details-modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setSelectedBooking(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div
          className="booking-details-modal-overlay"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            className="booking-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="booking-details-modal-header">
              <h2>Xác nhận hủy đặt phòng</h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowCancelModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="booking-details-modal-content">
              <p>
                Bạn có chắc chắn muốn hủy đặt phòng này không? Hành động này
                không thể hoàn tác.
              </p>
            </div>

            <div className="booking-details-modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Không
              </button>
              <button
                className="btn-danger"
                onClick={confirmCancel}
                disabled={cancelling}
              >
                {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookedHotels;

