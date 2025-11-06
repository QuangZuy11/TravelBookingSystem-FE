import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import "./BookTourDetail.css";
const BookTourDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({});

  // Feedback states (read-only)
  const [feedbacks, setFeedbacks] = useState([]);

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [bookingCreated, setBookingCreated] = useState(null);
  const [countdown, setCountdown] = useState(120);

  const [bookingData, setBookingData] = useState({
    guests: 1,
    startDate: "",
    specialRequests: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3000/api/traveler/tours/${id}`
        );

        if (!response.ok) {
          throw new Error("Không thể tải thông tin tour");
        }

        const result = await response.json();

        if (result.success && result.data) {
          setTour(result.data);
          // Set feedbacks từ tour data
          if (result.data.feedbacks) {
            setFeedbacks(result.data.feedbacks);
          }
        } else {
          throw new Error("Dữ liệu tour không hợp lệ");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching tour:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTourData();
    }
  }, [id]);

  const validateForm = () => {
    const newErrors = {};

    if (!bookingData.startDate) {
      newErrors.startDate = "Vui lòng chọn ngày khởi hành";
    }

    if (!bookingData.contactName.trim()) {
      newErrors.contactName = "Vui lòng nhập họ và tên";
    }

    if (!bookingData.contactEmail.trim()) {
      newErrors.contactEmail = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.contactEmail)) {
      newErrors.contactEmail = "Email không hợp lệ";
    }

    if (!bookingData.contactPhone.trim()) {
      newErrors.contactPhone = "Vui lòng nhập số điện thoại";
    } else if (
      !/^[0-9]{10}$/.test(bookingData.contactPhone.replace(/\s/g, ""))
    ) {
      newErrors.contactPhone = "Số điện thoại không hợp lệ";
    }

    if (!acceptedTerms) {
      newErrors.terms = "Vui lòng đồng ý với điều khoản dịch vụ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      alert("Vui lòng đăng nhập để đặt tour");
      return;
    }

    setIsCreatingBooking(true);
    setErrors({});

    try {
      const token = localStorage.getItem("token");

      // Step 1: Tạo tour booking
      const bookingResponse = await fetch(
        "http://localhost:3000/api/traveler/tour-bookings/reserve",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tour_id: id,
            tour_date: bookingData.startDate,
            guests: bookingData.guests,
            contactName: bookingData.contactName,
            contactEmail: bookingData.contactEmail,
            contactPhone: bookingData.contactPhone,
            emergencyContact: bookingData.emergencyContact,
            emergencyPhone: bookingData.emergencyPhone,
            specialRequests: bookingData.specialRequests,
          }),
        }
      );

      // Kiểm tra content-type trước khi parse JSON
      const contentType = bookingResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Server trả về lỗi (${bookingResponse.status}). Vui lòng kiểm tra backend server có đang chạy không.`
        );
      }

      const bookingResult = await bookingResponse.json();

      if (!bookingResponse.ok || !bookingResult.success) {
        throw new Error(
          bookingResult.message ||
            `Lỗi ${bookingResponse.status}: Không thể tạo booking`
        );
      }

      setBookingCreated(bookingResult.data);

      // Step 2: Tạo payment link ngay sau khi booking thành công
      await handleCreatePayment(bookingResult.data.bookingId);
    } catch (error) {
      console.error("Error creating booking:", error);
      alert(error.message || "Có lỗi xảy ra khi đặt tour");
      setIsCreatingBooking(false);
    }
  };

  // Handle create PayOS payment
  const handleCreatePayment = async (bookingId) => {
    setIsCreatingPayment(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/traveler/tour-payments/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            booking_id: bookingId,
          }),
        }
      );

      // Kiểm tra content-type trước khi parse JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Server trả về lỗi (${response.status}). Vui lòng kiểm tra backend server.`
        );
      }

      const result = await response.json();

      if (response.ok && result.success) {
        setPaymentData({
          paymentId: result.data.payment_id,
          qrCode: result.data.qr_code_base64 || result.data.qr_code,
          qrCodeString: result.data.qr_code,
          checkoutUrl: result.data.checkout_url,
          amount: result.data.amount,
          expiredAt: result.data.expired_at,
          orderCode: result.data.order_code,
        });

        // Tính countdown từ expired_at
        const expiredAt = new Date(result.data.expired_at);
        const now = new Date();
        const remainingSeconds = Math.floor((expiredAt - now) / 1000);
        setCountdown(Math.max(0, remainingSeconds));

        // Hiển thị modal payment
        setShowPaymentModal(true);

        // Start polling payment status
        startPaymentStatusPolling(result.data.payment_id);
      } else {
        throw new Error(result.message || "Không thể tạo thanh toán");
      }
    } catch (error) {
      console.error("Payment creation error:", error);
      alert(
        "Đặt tour thành công nhưng không thể tạo thanh toán. Vui lòng thử lại sau."
      );
    } finally {
      setIsCreatingPayment(false);
      setIsCreatingBooking(false);
    }
  };

  // Poll payment status every 3 seconds
  const startPaymentStatusPolling = (paymentId) => {
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:3000/api/traveler/tour-payments/${paymentId}/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Kiểm tra content-type
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Non-JSON response from payment status endpoint");
          return;
        }

        const result = await response.json();

        if (result.success) {
          const status = result.data.status;

          if (status === "completed") {
            clearInterval(pollInterval);
            alert("✅ Thanh toán thành công! Booking đã được xác nhận.");
            setShowPaymentModal(false);
            // Reload page or navigate
            window.location.reload();
          } else if (["failed", "cancelled", "expired"].includes(status)) {
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error("Poll error:", error);
      }
    }, 3000);

    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 120000);
  };

  // Handle cancel payment
  const handleCancelPayment = useCallback(async () => {
    if (!paymentData?.paymentId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/traveler/tour-payments/${paymentData.paymentId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Không cần parse response nếu chỉ cancel
      if (!response.ok) {
        console.warn("Failed to cancel payment:", response.status);
      }
    } catch (error) {
      console.error("Error cancelling payment:", error);
    }

    // Cancel booking if exists
    if (bookingCreated?.bookingId) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:3000/api/traveler/tour-bookings/${bookingCreated.bookingId}/cancel`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          console.warn("Failed to cancel booking:", response.status);
        }
      } catch (error) {
        console.error("Error cancelling booking:", error);
      }
    }

    setShowPaymentModal(false);
    setPaymentData(null);
    setBookingCreated(null);
  }, [paymentData, bookingCreated]);

  // Countdown timer effect
  useEffect(() => {
    if (showPaymentModal && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleCancelPayment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showPaymentModal, countdown, handleCancelPayment]);

  // Format countdown time
  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star empty"}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="book-tour-page">
        <div className="container">
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
              Đang tải thông tin tour...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="book-tour-page">
        <div className="container">
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
              Không thể tải thông tin tour
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              {error || "Vui lòng thử lại sau"}
            </p>
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

  const totalPrice = tour.price * bookingData.guests;
  const maxGuests = 20;

  return (
    <div className="book-tour-page">
      <div className="container">
        <div className="tour-content">
          {/* Left Column - Tour Info */}
          <div className="tour-info-section">
            {/* Tour Image Card */}
            <div className="tour-card">
              <div className="tour-image-wrapper">
                <img
                  src={
                    tour.image ||
                    "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800"
                  }
                  alt={tour.title}
                  className="tour-image"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800";
                  }}
                />
                {tour.discount && (
                  <div className="discount-badge">Giảm {tour.discount}%</div>
                )}
              </div>

              <div className="tour-details">
                <h1 className="tour-title">{tour.name}</h1>

                <div className="tour-meta">
                  <div className="meta-item">
                    <svg
                      className="icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>
                      {tour.destinations && tour.destinations.length > 0
                        ? tour.destinations
                            .map((dest) => dest.name || dest)
                            .join(", ")
                        : Array.isArray(tour.destination_id) &&
                          tour.destination_id.length > 0
                        ? tour.destination_id
                            .map((dest) =>
                              typeof dest === "object" ? dest.name : dest
                            )
                            .join(", ")
                        : tour.name || "Chưa có địa điểm"}
                    </span>
                  </div>
                  <div className="meta-item">
                    <svg
                      className="icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{tour.duration}</span>
                  </div>
                  <div className="meta-item">
                    <svg
                      className="icon"
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
                    <span>Tối đa {maxGuests} khách</span>
                  </div>
                  <div className="meta-item">
                    <svg
                      className="icon star-icon"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="rating">{tour.rating}</span>
                    <span className="reviews">
                      ({tour.total_rating} đánh giá)
                    </span>
                  </div>
                </div>

                <p className="tour-description">{tour.description}</p>

                {tour.highlights && tour.highlights.length > 0 && (
                  <div className="tour-highlights-detail">
                    {tour.highlights.map((highlight, index) => (
                      <span key={index} className="highlight-badge">
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Itinerary Card */}
            <div className="tour-card">
              <h2 className="card-title">Lịch trình tour</h2>
              {tour.itineraries && tour.itineraries.length > 0 ? (
                <div className="itinerary-list">
                  {tour.itineraries.map((day, index) => (
                    <div key={day._id || index} className="itinerary-day">
                      <h3 className="day-title">
                        Ngày {day.day}
                        {day.title && (
                          <span className="day-subtitle"> - {day.title}</span>
                        )}
                      </h3>
                      {day.activities && day.activities.length > 0 && (
                        <div>
                          {day.activities.map((activity, activityIndex) => (
                            <div key={activityIndex} className="activity-item">
                              <span className="activity-bullet"></span>
                              <span className="activity-text">
                                {activity.time && activity.action
                                  ? `${activity.time}: ${activity.action}`
                                  : activity.activity_name
                                  ? `${activity.start_time || ""} - ${
                                      activity.end_time || ""
                                    }: ${activity.activity_name}`
                                  : activity}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-itinerary">
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#6b7280",
                    }}
                  >
                    <svg
                      style={{
                        width: "48px",
                        height: "48px",
                        margin: "0 auto 16px",
                        color: "#d1d5db",
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "8px",
                      }}
                    >
                      Lịch trình đang được cập nhật
                    </h3>
                    <p style={{ fontSize: "14px", marginBottom: "0" }}>
                      Lịch trình chi tiết của tour này sẽ được cập nhật sớm
                      nhất. Vui lòng liên hệ với chúng tôi để biết thêm thông
                      tin.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* What's Included Card */}
            {tour.included_services && tour.included_services.length > 0 && (
              <div className="tour-card">
                <h2 className="card-title">Dịch vụ bao gồm</h2>
                <ul className="included-list">
                  {tour.included_services.map((item, index) => (
                    <li key={index} className="included-item">
                      <span className="included-bullet"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Feedbacks Card */}
            <div className="tour-card">
              <h2 className="card-title">Đánh giá từ khách hàng</h2>
              {feedbacks && feedbacks.length > 0 ? (
                <div className="feedbacks-list">
                  {feedbacks.map((feedback) => (
                    <div
                      key={feedback.id || feedback._id}
                      className="feedback-item"
                    >
                      <div className="feedback-header">
                        <div className="feedback-user-info">
                          <div className="feedback-user-avatar">
                            {feedback.user
                              ? feedback.user.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                          <div className="feedback-user-details">
                            <div className="feedback-user-name">
                              {feedback.user || "Người dùng ẩn danh"}
                            </div>
                            <div className="feedback-date">
                              {formatDate(feedback.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="feedback-rating">
                        {renderStars(feedback.rating)}
                      </div>
                      <div className="feedback-comment">{feedback.comment}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-feedbacks">
                  <p>
                    Chưa có đánh giá nào. Hãy đặt tour và trải nghiệm để đánh
                    giá!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="booking-section">
            <div className="booking-card sticky">
              <div className="booking-header">
                <h2 className="booking-title">Đặt tour ngay</h2>
                <p className="booking-subtitle">
                  Điền thông tin để đặt tour du lịch
                </p>
              </div>

              <form onSubmit={handleBooking} className="booking-form">
                <div className="form-group">
                  <label htmlFor="guests" className="form-label">
                    Số khách
                  </label>
                  <select
                    id="guests"
                    className="form-select"
                    value={bookingData.guests}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        guests: Number(e.target.value),
                      })
                    }
                  >
                    {[...Array(maxGuests)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} khách
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="startDate" className="form-label">
                    Ngày khởi hành <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    className="form-input"
                    style={
                      errors.startDate
                        ? { borderColor: "#ef4444", borderWidth: "2px" }
                        : {}
                    }
                    value={bookingData.startDate}
                    onChange={(e) => {
                      setBookingData({
                        ...bookingData,
                        startDate: e.target.value,
                      });
                      if (errors.startDate) {
                        setErrors({ ...errors, startDate: null });
                      }
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                  {errors.startDate && (
                    <span
                      style={{
                        color: "#ef4444",
                        fontSize: "14px",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      {errors.startDate}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="contactName" className="form-label">
                    Họ và tên <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    className="form-input"
                    style={
                      errors.contactName
                        ? { borderColor: "#ef4444", borderWidth: "2px" }
                        : {}
                    }
                    value={bookingData.contactName}
                    onChange={(e) => {
                      setBookingData({
                        ...bookingData,
                        contactName: e.target.value,
                      });
                      if (errors.contactName) {
                        setErrors({ ...errors, contactName: null });
                      }
                    }}
                    placeholder="Nhập họ và tên"
                    required
                  />
                  {errors.contactName && (
                    <span
                      style={{
                        color: "#ef4444",
                        fontSize: "14px",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      {errors.contactName}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="contactEmail" className="form-label">
                    Email <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    className="form-input"
                    style={
                      errors.contactEmail
                        ? { borderColor: "#ef4444", borderWidth: "2px" }
                        : {}
                    }
                    value={bookingData.contactEmail}
                    onChange={(e) => {
                      setBookingData({
                        ...bookingData,
                        contactEmail: e.target.value,
                      });
                      if (errors.contactEmail) {
                        setErrors({ ...errors, contactEmail: null });
                      }
                    }}
                    placeholder="example@email.com"
                    required
                  />
                  {errors.contactEmail && (
                    <span
                      style={{
                        color: "#ef4444",
                        fontSize: "14px",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      {errors.contactEmail}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="contactPhone" className="form-label">
                    Số điện thoại <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    id="contactPhone"
                    type="tel"
                    className="form-input"
                    style={
                      errors.contactPhone
                        ? { borderColor: "#ef4444", borderWidth: "2px" }
                        : {}
                    }
                    value={bookingData.contactPhone}
                    onChange={(e) => {
                      setBookingData({
                        ...bookingData,
                        contactPhone: e.target.value,
                      });
                      if (errors.contactPhone) {
                        setErrors({ ...errors, contactPhone: null });
                      }
                    }}
                    placeholder="0912345678"
                    required
                  />
                  {errors.contactPhone && (
                    <span
                      style={{
                        color: "#ef4444",
                        fontSize: "14px",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      {errors.contactPhone}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyContact" className="form-label">
                    Liên hệ khẩn cấp
                  </label>
                  <input
                    id="emergencyContact"
                    type="text"
                    className="form-input"
                    placeholder="Tên người liên hệ"
                    value={bookingData.emergencyContact}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        emergencyContact: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyPhone" className="form-label">
                    SĐT khẩn cấp
                  </label>
                  <input
                    id="emergencyPhone"
                    type="tel"
                    className="form-input"
                    placeholder="Số điện thoại khẩn cấp"
                    value={bookingData.emergencyPhone}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        emergencyPhone: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="specialRequests" className="form-label">
                    Yêu cầu đặc biệt
                  </label>
                  <textarea
                    id="specialRequests"
                    className="form-textarea"
                    placeholder="Ví dụ: ăn chay, dị ứng thực phẩm..."
                    value={bookingData.specialRequests}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        specialRequests: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="terms-acceptance-wrapper">
                  <label className="terms-acceptance-label">
                    <input
                      type="checkbox"
                      className="terms-acceptance-checkbox"
                      style={
                        errors.terms
                          ? { outlineColor: "#ef4444", outline: "2px solid" }
                          : {}
                      }
                      checked={acceptedTerms}
                      onChange={(e) => {
                        setAcceptedTerms(e.target.checked);
                        if (errors.terms) {
                          setErrors({ ...errors, terms: null });
                        }
                      }}
                      required
                    />
                    <span className="terms-acceptance-text">
                      Tôi đã đọc và đồng ý với{" "}
                      <a
                        href="/terms-of-service"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="terms-acceptance-link"
                      >
                        Điều khoản dịch vụ
                      </a>
                      <span style={{ color: "#ef4444" }}> *</span>
                    </span>
                  </label>
                  {errors.terms && (
                    <span
                      style={{
                        color: "#ef4444",
                        fontSize: "14px",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      {errors.terms}
                    </span>
                  )}
                </div>

                {/* Price Summary */}
                <div className="price-summary">
                  <div className="price-row">
                    <span>Giá tour ({bookingData.guests} khách)</span>
                    <span>{formatPrice(tour.price * bookingData.guests)}</span>
                  </div>
                  {tour.discount && (
                    <div className="price-row discount">
                      <span>Giảm giá</span>
                      <span>
                        -
                        {formatPrice(
                          (tour.price * bookingData.guests * tour.discount) /
                            100
                        )}
                      </span>
                    </div>
                  )}
                  <div className="separator"></div>
                  <div className="price-row total">
                    <span>Tổng cộng</span>
                    <span className="total-price">
                      {formatPrice(
                        tour.discount
                          ? (tour.price *
                              bookingData.guests *
                              (100 - tour.discount)) /
                              100
                          : totalPrice
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={isCreatingBooking || isCreatingPayment}
                >
                  {isCreatingBooking || isCreatingPayment ? (
                    <>
                      <svg
                        className="button-icon spinner"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ animation: "spin 1s linear infinite" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <svg
                        className="button-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Đặt tour ngay
                    </>
                  )}
                </button>

                <div className="secure-payment">
                  <svg
                    className="secure-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>Thanh toán an toàn & bảo mật</span>
                </div>
              </form>
            </div>

            {/* Contact Info Card */}
            <div className="contact-card">
              <h3 className="contact-title">Cần hỗ trợ?</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <svg
                    className="contact-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>Hotline: 1900-1234</span>
                </div>

                <div className="contact-item">
                  <svg
                    className="contact-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>info@viettravel.com</span>
                </div>
                <p className="contact-note">Hỗ trợ 24/7 - Tư vấn miễn phí</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="payment-modal-overlay" onClick={handleCancelPayment}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header">
              <h3>
                Thanh toán tour
                <span className="countdown-timer">
                  ⏱️ {formatCountdown(countdown)}
                </span>
              </h3>
              <button className="modal-close-btn" onClick={handleCancelPayment}>
                ×
              </button>
            </div>

            <div className="payment-modal-content">
              {isCreatingPayment ? (
                <div className="payment-loading">
                  <div className="spinner"></div>
                  <p>Đang tạo mã thanh toán...</p>
                </div>
              ) : paymentData ? (
                <>
                  {/* Booking Summary */}
                  {bookingCreated && (
                    <div className="booking-summary-card">
                      <h4>Thông tin đặt tour</h4>
                      <div className="summary-row">
                        <span>Mã đặt tour:</span>
                        <strong>
                          {bookingCreated.bookingNumber ||
                            bookingCreated.bookingId}
                        </strong>
                      </div>
                      <div className="summary-row">
                        <span>Tour:</span>
                        <span>{tour?.name || tour?.title}</span>
                      </div>
                      <div className="summary-row">
                        <span>Số khách:</span>
                        <span>{bookingData.guests} người</span>
                      </div>
                      <div className="summary-row">
                        <span>Ngày khởi hành:</span>
                        <span>
                          {new Date(bookingData.startDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      <div className="summary-row total">
                        <span>Tổng tiền:</span>
                        <strong>{formatPrice(paymentData.amount)}</strong>
                      </div>
                    </div>
                  )}

                  {/* QR Code Section */}
                  <div className="qr-code-section">
                    <h4>Quét mã QR để thanh toán</h4>
                    {paymentData.qrCode &&
                    paymentData.qrCode.startsWith("data:image") ? (
                      <div className="qr-code-container">
                        <img
                          src={paymentData.qrCode}
                          alt="PayOS QR Code"
                          className="qr-code-image"
                        />
                        <div className="qr-instructions">
                          <p>📱 Quét mã QR bằng ứng dụng ngân hàng</p>
                          <p className="amount-text">
                            Số tiền:{" "}
                            <strong>{formatPrice(paymentData.amount)}</strong>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="qr-fallback">
                        <p>Không thể hiển thị QR code</p>
                        <a
                          href={paymentData.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="checkout-link-btn"
                        >
                          Mở trang thanh toán PayOS
                        </a>
                      </div>
                    )}

                    {/* Payment Info */}
                    <div className="payment-info-card">
                      <div className="info-row">
                        <span>Mã giao dịch:</span>
                        <span>#{paymentData.orderCode}</span>
                      </div>
                      <div className="info-row">
                        <span>Hết hạn lúc:</span>
                        <span>
                          {new Date(paymentData.expiredAt).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="payment-error">
                  <p>Không thể tạo mã thanh toán</p>
                </div>
              )}
            </div>

            <div className="payment-modal-footer">
              <button className="btn-cancel" onClick={handleCancelPayment}>
                Hủy thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BookTourDetail;
