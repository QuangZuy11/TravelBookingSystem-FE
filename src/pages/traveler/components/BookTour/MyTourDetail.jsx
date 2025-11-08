import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import "./BookTourDetail.css";
import { AiTwotoneEdit } from "react-icons/ai";
import { MdOutlineDeleteOutline } from "react-icons/md";

const MyTourDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  // Feedback states
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    comment: "",
    rating: 5,
  });

  const fetchBookingData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch booking details
      const bookingResponse = await fetch(
        `http://localhost:3000/api/traveler/tour-bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!bookingResponse.ok) {
        throw new Error("Không thể tải thông tin booking");
      }

      const bookingResult = await bookingResponse.json();

      if (bookingResult.success && bookingResult.data) {
        const bookingData = bookingResult.data;
        setBooking(bookingData);
        setTour(bookingData.tour_id);

        // Fetch tour details to get full tour data including itineraries and feedbacks
        if (bookingData.tour_id?._id || bookingData.tour_id) {
          let tourId = bookingData.tour_id._id || bookingData.tour_id;
          // Convert to string if needed
          if (tourId && typeof tourId !== "string") {
            tourId = tourId.toString();
          }
          const tourResponse = await fetch(
            `http://localhost:3000/api/traveler/tours/${tourId}`
          );

          if (tourResponse.ok) {
            const tourResult = await tourResponse.json();
            if (tourResult.success && tourResult.data) {
              // Update tour state with complete tour data (including itineraries)
              const fullTourData = tourResult.data;
              setTour(fullTourData);

              // Set feedbacks if available
              if (fullTourData.feedbacks) {
                setFeedbacks(fullTourData.feedbacks);
              }

              // Debug log
              console.log("✅ Tour data loaded:", {
                tourId: fullTourData._id || fullTourData.id,
                hasItineraries: !!fullTourData.itineraries,
                feedbacksCount: fullTourData.feedbacks?.length || 0,
              });
            }
          } else {
            console.warn(
              "⚠️ Failed to fetch tour details:",
              tourResponse.status
            );
          }
        }
      } else {
        throw new Error("Dữ liệu booking không hợp lệ");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching booking:", err);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchBookingData();
  }, [bookingId, user, navigate, fetchBookingData]);

  const handleCancelTour = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy tour này?")) {
      return;
    }

    setIsCancelling(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/traveler/tour-bookings/${bookingId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        alert("✅ Đã hủy tour thành công!");
        navigate("/my-tours");
      } else {
        throw new Error(result.message || "Không thể hủy tour");
      }
    } catch (err) {
      console.error("Error cancelling tour:", err);
      alert(err.message || "Có lỗi xảy ra khi hủy tour");
    } finally {
      setIsCancelling(false);
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
    };

    const config = statusConfig[status] || {
      label: status,
      color: "#6b7280",
    };

    return (
      <span
        style={{
          backgroundColor: `${config.color}15`,
          color: config.color,
          padding: "6px 16px",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        {config.label}
      </span>
    );
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star empty"}>
        ★
      </span>
    ));
  };

  // Feedback handlers
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Vui lòng đăng nhập để đánh giá tour");
      return;
    }

    // Lấy tourId từ nhiều nguồn có thể
    let tourId = null;

    // Ưu tiên lấy từ tour state
    if (tour) {
      if (typeof tour === "string") {
        tourId = tour;
      } else if (tour._id) {
        tourId = tour._id;
      } else if (tour.id) {
        tourId = tour.id;
      }
    }

    // Nếu không có từ tour, thử lấy từ booking
    if (!tourId && booking) {
      if (booking.tour_id) {
        if (typeof booking.tour_id === "string") {
          tourId = booking.tour_id;
        } else if (booking.tour_id._id) {
          tourId = booking.tour_id._id;
        } else if (booking.tour_id.id) {
          tourId = booking.tour_id.id;
        } else {
          tourId = booking.tour_id;
        }
      }
    }

    // Convert to string if needed (MongoDB ObjectId)
    if (tourId) {
      if (typeof tourId !== "string") {
        tourId = tourId.toString();
      }
      // Validate ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(tourId)) {
        console.error("Invalid tourId format:", tourId);
        alert("Tour ID không hợp lệ. Vui lòng tải lại trang.");
        return;
      }
    }

    if (!tourId) {
      alert("Không tìm thấy thông tin tour. Vui lòng tải lại trang.");
      console.error("Tour ID not found. Tour:", tour, "Booking:", booking);
      return;
    }

    console.log("✅ Using tourId for feedback:", tourId);

    try {
      const token = localStorage.getItem("token");
      const url = editingFeedback
        ? `http://localhost:3000/api/traveler/feedbacks/${editingFeedback.id}`
        : "http://localhost:3000/api/traveler/feedbacks";

      const method = editingFeedback ? "PUT" : "POST";
      const body = editingFeedback
        ? { comment: feedbackForm.comment, rating: feedbackForm.rating }
        : {
            tour_id: tourId,
            comment: feedbackForm.comment,
            rating: feedbackForm.rating,
          };

      console.log("📤 Submitting feedback:", { tourId, url, body });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      console.log("📥 Feedback response:", result);

      if (result.success) {
        // Reload tour data để lấy feedbacks mới
        const tourResponse = await fetch(
          `http://localhost:3000/api/traveler/tours/${tourId}`
        );
        const tourResult = await tourResponse.json();
        if (tourResult.success && tourResult.data) {
          setTour(tourResult.data);
          setFeedbacks(tourResult.data.feedbacks || []);
        }

        setFeedbackForm({ comment: "", rating: 5 });
        setShowFeedbackForm(false);
        setEditingFeedback(null);
        alert(
          editingFeedback
            ? "Cập nhật đánh giá thành công!"
            : "Đánh giá đã được gửi!"
        );
      } else {
        alert(result.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Có lỗi xảy ra khi gửi đánh giá: " + err.message);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      return;
    }

    // Lấy tourId từ nhiều nguồn có thể
    let tourId = null;
    if (tour) {
      tourId = tour._id || tour.id || (typeof tour === "string" ? tour : null);
    }

    // Nếu không có từ tour, thử lấy từ booking
    if (!tourId && booking) {
      if (booking.tour_id) {
        tourId = booking.tour_id._id || booking.tour_id.id || booking.tour_id;
      }
    }

    // Convert to string if needed
    if (tourId && typeof tourId !== "string") {
      tourId = tourId.toString();
    }

    if (!tourId) {
      alert("Không tìm thấy thông tin tour. Vui lòng tải lại trang.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/traveler/feedbacks/${feedbackId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        // Reload tour data
        const tourResponse = await fetch(
          `http://localhost:3000/api/traveler/tours/${tourId}`
        );
        const tourResult = await tourResponse.json();
        if (tourResult.success && tourResult.data) {
          setTour(tourResult.data);
          setFeedbacks(tourResult.data.feedbacks || []);
        }
        alert("Đã xóa đánh giá thành công!");
      } else {
        alert(result.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error("Error deleting feedback:", err);
      alert("Có lỗi xảy ra khi xóa đánh giá");
    }
  };

  const handleEditFeedback = (feedback) => {
    setEditingFeedback(feedback);
    setFeedbackForm({
      comment: feedback.comment,
      rating: feedback.rating,
    });
    setShowFeedbackForm(true);
  };

  const isMyFeedback = (feedback) => {
    if (!user) return false;

    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      // Decode JWT token để lấy user_id
      const base64Url = token.split(".")[1];
      if (!base64Url) return false;

      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const decoded = JSON.parse(jsonPayload);

      // Lấy user_id từ token (hỗ trợ nhiều format)
      const currentUserId =
        decoded.user?._id || decoded.user?.id || decoded._id || decoded.id;

      // Lấy user_id từ feedback (hỗ trợ nhiều format)
      const feedbackUserId =
        feedback.user_id?._id ||
        feedback.user_id ||
        feedback.user_id_populated?._id ||
        null;

      if (!currentUserId || !feedbackUserId) {
        return false;
      }

      // So sánh (cả hai đều convert sang string để đảm bảo)
      const isMine = currentUserId.toString() === feedbackUserId.toString();
      return isMine;
    } catch (err) {
      console.error("Error decoding token:", err);
      return false;
    }
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

  if (error || !booking || !tour) {
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
              onClick={() => navigate("/my-tours")}
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
              Quay lại danh sách tour
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pricing = booking.pricing || {};
  const contactInfo = booking.contact_info || {};
  const emergencyContact = contactInfo.emergency_contact || {};

  return (
    <div className="book-tour-page">
      <div className="container">
        <div className="tour-content">
          {/* Left Column - Tour Info */}
          <div className="tour-info-section">
            {/* Booking Status Card */}
            <div className="tour-card">
              <div className="booking-number-header">
                <div>
                  <h2 className="booking-number-label">Mã đặt tour</h2>
                  <p className="booking-number-value">
                    {booking.booking_number}
                  </p>
                </div>
                {getStatusBadge(booking.status)}
              </div>
            </div>

            {/* Tour Image Card */}
            <div className="tour-card">
              <div className="tour-image-wrapper">
                <img
                  src={
                    tour.image ||
                    "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800"
                  }
                  alt={tour.title || tour.name}
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
                <h1 className="tour-title">{tour.title || tour.name}</h1>

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
                        : tour.location || "Chưa có địa điểm"}
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Ngày khởi hành: {formatDate(booking.tour_date)}</span>
                  </div>
                  <div className="meta-item">
                    <svg
                      className="icon star-icon"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="rating">{tour.rating || 0}</span>
                    <span className="reviews">
                      ({tour.total_rating || 0} đánh giá)
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

                {/* Meeting Point Section */}
                {tour.meeting_point && (
                  <div className="meeting-point-section">
                    <div className="meeting-point-item-inline">
                      <div className="meeting-point-label-inline">
                        <svg
                          className="meeting-point-icon-inline"
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
                        <span className="meeting-point-title">
                          Điểm tập trung:
                        </span>
                      </div>
                      <div className="meeting-point-value-inline">
                        <div className="meeting-point-address">
                          {tour.meeting_point.address || "Chưa có thông tin"}
                        </div>
                        {tour.meeting_point.instructions && (
                          <div className="meeting-point-instructions">
                            <svg
                              className="meeting-point-icon-small"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>{tour.meeting_point.instructions}</span>
                          </div>
                        )}
                      </div>
                    </div>
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
                    <p>Lịch trình đang được cập nhật</p>
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
              <div className="card-title-wrapper">
                <h2 className="card-title">Đánh giá từ khách hàng</h2>
                {user && (
                  <button
                    className="add-feedback-btn"
                    onClick={() => {
                      setShowFeedbackForm(!showFeedbackForm);
                      setEditingFeedback(null);
                      setFeedbackForm({ comment: "", rating: 5 });
                    }}
                  >
                    {showFeedbackForm ? "Hủy" : "+ Thêm đánh giá"}
                  </button>
                )}
              </div>

              {/* Feedback Form */}
              {showFeedbackForm && user && (
                <div className="feedback-form-wrapper">
                  <form
                    onSubmit={handleFeedbackSubmit}
                    className="feedback-form"
                  >
                    <div className="feedback-form-group">
                      <label className="feedback-label">Đánh giá của bạn</label>
                      <div className="rating-input">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`star-btn ${
                              feedbackForm.rating >= star ? "active" : ""
                            }`}
                            onClick={() =>
                              setFeedbackForm({ ...feedbackForm, rating: star })
                            }
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="feedback-form-group">
                      <label className="feedback-label">Bình luận</label>
                      <textarea
                        className="feedback-textarea"
                        value={feedbackForm.comment}
                        onChange={(e) =>
                          setFeedbackForm({
                            ...feedbackForm,
                            comment: e.target.value,
                          })
                        }
                        placeholder="Chia sẻ trải nghiệm của bạn..."
                        rows={4}
                        required
                      />
                    </div>
                    <div className="feedback-form-actions">
                      <button type="submit" className="submit-feedback-btn">
                        {editingFeedback ? "Cập nhật" : "Gửi đánh giá"}
                      </button>
                      {editingFeedback && (
                        <button
                          type="button"
                          className="cancel-feedback-btn"
                          onClick={() => {
                            setShowFeedbackForm(false);
                            setEditingFeedback(null);
                            setFeedbackForm({ comment: "", rating: 5 });
                          }}
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* Feedbacks List */}
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
                        {isMyFeedback(feedback) && (
                          <div className="feedback-actions">
                            <button
                              className="edit-feedback-btn"
                              onClick={() => handleEditFeedback(feedback)}
                              title="Sửa"
                            >
                              <AiTwotoneEdit />
                            </button>
                            <button
                              className="delete-feedback-btn"
                              onClick={() =>
                                handleDeleteFeedback(
                                  feedback.id || feedback._id
                                )
                              }
                              title="Xóa"
                            >
                              <MdOutlineDeleteOutline />
                            </button>
                          </div>
                        )}
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
                    Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá tour
                    này!
                  </p>
                </div>
              )}

              {!user && (
                <div className="feedback-login-prompt">
                  <p>
                    <a
                      href="/auth"
                      style={{ color: "#06b6d4", textDecoration: "underline" }}
                    >
                      Đăng nhập
                    </a>{" "}
                    để thêm đánh giá của bạn
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Info */}
          <div className="booking-section">
            <div className="booking-card sticky">
              <div className="booking-header">
                <h2 className="booking-title">Thông tin đặt tour</h2>
                <p className="booking-subtitle">Chi tiết booking của bạn</p>
              </div>

              <div className="booking-info-readonly">
                <div className="form-group">
                  <label className="form-label">Số khách</label>
                  <div className="readonly-field">
                    {booking.total_participants || 1} người
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ngày khởi hành</label>
                  <div className="readonly-field">
                    {formatDate(booking.tour_date)}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Họ và tên</label>
                  <div className="readonly-field">
                    {contactInfo.contact_name ||
                      contactInfo.name ||
                      contactInfo.contactName ||
                      "N/A"}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="readonly-field">
                    {contactInfo.email || "N/A"}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <div className="readonly-field">
                    {contactInfo.phone || "N/A"}
                  </div>
                </div>

                {emergencyContact.name && (
                  <div className="form-group">
                    <label className="form-label">Liên hệ khẩn cấp</label>
                    <div className="readonly-field">
                      {emergencyContact.name}
                      {emergencyContact.phone && ` - ${emergencyContact.phone}`}
                    </div>
                  </div>
                )}

                {booking.special_requests && (
                  <div className="form-group">
                    <label className="form-label">Yêu cầu đặc biệt</label>
                    <div className="readonly-field">
                      {booking.special_requests}
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                <div className="price-summary">
                  <div className="price-row">
                    <span>
                      Giá tour ({booking.total_participants || 1} khách)
                    </span>
                    <span>
                      {formatPrice(
                        pricing.subtotal ||
                          tour.price * (booking.total_participants || 1)
                      )}
                    </span>
                  </div>
                  {pricing.discount > 0 && (
                    <div className="price-row discount">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(pricing.discount)}</span>
                    </div>
                  )}
                  <div className="separator"></div>
                  <div className="price-row total">
                    <span>Tổng cộng</span>
                    <span className="total-price">
                      {formatPrice(pricing.total_amount || tour.price)}
                    </span>
                  </div>
                </div>

                {/* Cancel Button */}
                {booking.status !== "cancelled" &&
                  booking.status !== "completed" && (
                    <button
                      type="button"
                      className="submit-button cancel-button"
                      onClick={handleCancelTour}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Hủy tour
                        </>
                      )}
                    </button>
                  )}

                {booking.status === "cancelled" && (
                  <div className="status-message status-message-cancelled">
                    Tour này đã bị hủy
                  </div>
                )}

                {booking.status === "completed" && (
                  <div className="status-message status-message-completed">
                    Tour đã hoàn thành
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default MyTourDetail;
