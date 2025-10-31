import React, { useState, useEffect } from "react";
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

  // Feedback states
  const [feedbacks, setFeedbacks] = useState([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    comment: "",
    rating: 5,
  });

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

  const handleBooking = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const booking = {
      tourId: tour.id,
      tourName: tour.title,
      ...bookingData,
      totalPrice: tour.discount
        ? (tour.price * bookingData.guests * (100 - tour.discount)) / 100
        : tour.price * bookingData.guests,
      bookingDate: new Date().toISOString(),
      status: "pending",
    };
    console.log("Booking:", booking);
    setErrors({});
    alert("Đặt tour thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  };

  // Feedback handlers
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Vui lòng đăng nhập để đánh giá tour");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = editingFeedback
        ? `http://localhost:3000/api/traveler/feedbacks/${editingFeedback.id}`
        : "http://localhost:3000/api/traveler/feedbacks";

      const method = editingFeedback ? "PUT" : "POST";
      const body = editingFeedback
        ? { comment: feedbackForm.comment, rating: feedbackForm.rating }
        : {
            tour_id: id,
            comment: feedbackForm.comment,
            rating: feedbackForm.rating,
          };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        // Reload tour data để lấy feedbacks mới
        const tourResponse = await fetch(
          `http://localhost:3000/api/traveler/tours/${id}`
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
      alert("Có lỗi xảy ra khi gửi đánh giá");
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
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
          `http://localhost:3000/api/traveler/tours/${id}`
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
    // Lấy user_id từ token bằng cách decode JWT
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      // Decode JWT token (không verify, chỉ để lấy payload)
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const decoded = JSON.parse(jsonPayload);
      const userId =
        decoded.user?._id || decoded.user?.id || decoded._id || decoded.id;

      // So sánh với user_id trong feedback
      // Feedback có thể có user_id là ObjectId hoặc string
      const feedbackUserId =
        feedback.user_id?._id ||
        feedback.user_id ||
        feedback.user_id_populated?._id;

      return (
        userId &&
        feedbackUserId &&
        userId.toString() === feedbackUserId.toString()
      );
    } catch (err) {
      console.error("Error decoding token:", err);
      return false;
    }
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
                    <span>{tour.location}</span>
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
                              <span className="activity-text">{activity}</span>
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
                              ✏️
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
                              🗑️
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

                <button type="submit" className="submit-button">
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BookTourDetail;
