import React, { useCallback, useEffect, useState } from "react";
import tourApi from "../../../api/tourApi";
import termsPolicyService from "../../../services/termsPolicyService";
import { getProxiedGoogleDriveUrl } from "../../../utils/googleDriveImageHelper";
import "./HotelAdsPage.css";

const normalizeProviderTypes = (provider) => {
  if (provider?.licenses && Array.isArray(provider.licenses)) {
    return [...new Set(provider.licenses.map((item) => item.service_type))];
  }
  if (Array.isArray(provider?.type)) {
    return provider.type;
  }
  return [];
};

const resolveProviderId = (provider) => {
  if (provider?._id) return provider._id;
  if (provider?.provider_id) return provider.provider_id;
  if (provider?.provider?._id) return provider.provider._id;
  return "";
};

const formatLocation = (tour) => {
  const raw = tour.location;
  if (!raw) return "Chưa cập nhật địa điểm";

  if (typeof raw === "string") {
    return raw;
  }

  if (typeof raw === "object" && raw !== null) {
    const parts = [
      raw.address,
      raw.district,
      raw.city,
      raw.province || raw.state,
      raw.country,
    ]
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter(Boolean);

    if (parts.length) {
      return parts.join(", ");
    }
  }

  return "Chưa cập nhật địa điểm";
};

const resolveCoverImage = (tour) => {
  const candidates = [
    tour.coverImage,
    tour.thumbnail,
    tour.image,
    Array.isArray(tour.images) ? tour.images[0] : null,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    if (typeof candidate === "string") {
      return getProxiedGoogleDriveUrl(candidate);
    }

    if (typeof candidate === "object" && candidate !== null) {
      const nested =
        candidate.url ||
        candidate.imageUrl ||
        candidate.image ||
        candidate.src ||
        candidate.fileUrl;
      if (nested) {
        return getProxiedGoogleDriveUrl(nested);
      }
    }
  }

  return "";
};

const TourAdsPage = () => {
  const [providerId, setProviderId] = useState("");
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [terms, setTerms] = useState([]);
  const [termsLoading, setTermsLoading] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingTour, setPendingTour] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isCreatingAd, setIsCreatingAd] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [adBookingCreated, setAdBookingCreated] = useState(null);
  const [countdown, setCountdown] = useState(120);

  const initializeProvider = useCallback(() => {
    const providerStr = localStorage.getItem("provider");
    if (!providerStr) {
      setError("Không tìm thấy thông tin nhà cung cấp.");
      setLoading(false);
      return;
    }

    try {
      const provider = JSON.parse(providerStr);
      const types = normalizeProviderTypes(provider);
      if (!types.includes("tour")) {
        setError(
          "Quyền truy cập bị từ chối. Tính năng này chỉ dành cho nhà cung cấp tour."
        );
        setLoading(false);
        return;
      }

      const id = resolveProviderId(provider);
      if (!id) {
        setError("Không xác định được mã nhà cung cấp.");
        setLoading(false);
        return;
      }

      setProviderId(id);
    } catch (err) {
      console.error("Failed to parse provider info", err);
      setError("Không thể đọc thông tin nhà cung cấp.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeProvider();
  }, [initializeProvider]);

  useEffect(() => {
    if (!providerId) return;

    const loadTours = async () => {
      setLoading(true);
      try {
        const response = await tourApi.getProviderTours(providerId, {
          limit: 100,
        });
        const data = response?.data?.data || response?.data || [];
        setTours(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        console.error("Failed to fetch provider tours", err);
        setError("Không thể tải danh sách tour.");
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, [providerId]);

  useEffect(() => {
    const loadTerms = async () => {
      if (!isModalOpen || terms.length > 0 || termsLoading) return;
      setTermsLoading(true);
      setTermsError("");
      try {
        const data = await termsPolicyService.list({
          target: "promotion_tour",
        });
        setTerms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch tour promotion terms", err);
        setTermsError("Không thể tải điều khoản quảng cáo cho tour.");
      } finally {
        setTermsLoading(false);
      }
    };

    loadTerms();
  }, [isModalOpen, terms.length, termsLoading]);

  const openTermsModal = (tour) => {
    setPendingTour(tour);
    setIsModalOpen(true);
    setSuccessMessage("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPendingTour(null);
  };

  const handleConfirmAd = async () => {
    if (!pendingTour) {
      closeModal();
      return;
    }

    setIsCreatingAd(true);
    closeModal();

    try {
      const token = localStorage.getItem("token");

      // Tạo ad booking
      const response = await fetch(
        "http://localhost:3000/api/ad-bookings/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tour_id: pendingTour._id || pendingTour.id,
          }),
        }
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Server trả về lỗi (${response.status}). Vui lòng kiểm tra backend server.`
        );
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Lỗi ${response.status}: Không thể tạo quảng cáo`
        );
      }

      setAdBookingCreated(result.data);
      setPaymentData(result.data.payment);

      // Tính countdown từ expired_at
      const expiredAt = new Date(result.data.payment.expired_at);
      const now = new Date();
      const remainingSeconds = Math.floor((expiredAt - now) / 1000);
      setCountdown(Math.max(0, remainingSeconds));

      // Hiển thị modal payment
      setShowPaymentModal(true);

      // Start polling payment status
      startPaymentStatusPolling(result.data.payment.payment_id);
    } catch (error) {
      console.error("Error creating ad booking:", error);
      alert(error.message || "Có lỗi xảy ra khi tạo quảng cáo");
    } finally {
      setIsCreatingAd(false);
    }
  };

  // Poll payment status every 3 seconds
  const startPaymentStatusPolling = (paymentId) => {
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:3000/api/ad-bookings/payments/${paymentId}/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
            alert("✅ Thanh toán thành công! Quảng cáo đã được kích hoạt.");
            setShowPaymentModal(false);
            setSuccessMessage(
              `Đã đăng ký quảng cáo thành công cho tour "${
                pendingTour?.title || "Không tên"
              }".`
            );
            // Reload tours
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
  const handleCancelPayment = async () => {
    if (!paymentData?.payment_id) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/ad-bookings/payments/${paymentData.payment_id}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        console.warn("Failed to cancel payment:", response.status);
      }
    } catch (error) {
      console.error("Error cancelling payment:", error);
    }

    setShowPaymentModal(false);
    setPaymentData(null);
    setAdBookingCreated(null);
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPaymentModal, countdown]);

  // Format countdown time
  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  };

  if (loading) {
    return <div className="hotel-ads-status">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="hotel-ads-status error">{error}</div>;
  }

  return (
    <div className="hotel-ads-page">
      <header className="hotel-ads-header">
        <div>
          <h1>Quảng cáo tour</h1>
          <p>Chọn tour bạn sở hữu để tạo chương trình quảng cáo nổi bật.</p>
        </div>
      </header>

      {successMessage && (
        <div className="hotel-ads-success">{successMessage}</div>
      )}

      {tours.length === 0 ? (
        <div className="hotel-ads-status">
          Bạn chưa có tour nào trong hệ thống. Hãy tạo tour trước khi quảng cáo.
        </div>
      ) : (
        <div className="hotel-ads-grid">
          {tours.map((tour) => {
            const coverImage = resolveCoverImage(tour);
            return (
              <div key={tour._id} className="hotel-ads-card">
                {coverImage ? (
                  <div className="hotel-ads-image-wrapper">
                    <img
                      src={coverImage}
                      alt={tour.title}
                      className="hotel-ads-image"
                    />
                  </div>
                ) : (
                  <div className="hotel-ads-image-placeholder">
                    Không có ảnh
                  </div>
                )}
                <div className="hotel-ads-content">
                  <div className="hotel-ads-heading">
                    <h2>{tour.title || "Tour chưa đặt tên"}</h2>
                    {tour.status && (
                      <span
                        className={`hotel-status status-${tour.status.toLowerCase()}`}
                      >
                        {tour.status}
                      </span>
                    )}
                  </div>
                  <p className="hotel-ads-address">{formatLocation(tour)}</p>
                  <div className="hotel-ads-meta">
                    {tour.duration && <span>Thời lượng: {tour.duration}</span>}
                    {tour.price && (
                      <span>
                        Giá từ:{" "}
                        {Number(tour.price).toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="hotel-ads-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => openTermsModal(tour)}
                  >
                    Quảng cáo ngay
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div
          className="hotel-ads-modal-backdrop"
          role="dialog"
          aria-modal="true"
        >
          <div className="hotel-ads-modal">
            <div className="hotel-ads-modal-header">
              <h2>Điều khoản quảng cáo</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
            <div className="hotel-ads-modal-body">
              {termsLoading ? (
                <div className="hotel-ads-status">Đang tải điều khoản...</div>
              ) : termsError ? (
                <div className="hotel-ads-status error">{termsError}</div>
              ) : terms.length === 0 ? (
                <div className="hotel-ads-status">
                  Hiện chưa có điều khoản quảng cáo dành cho tour. Vui lòng liên
                  hệ quản trị viên.
                </div>
              ) : (
                <div className="hotel-ads-terms-list">
                  {terms.map((policy) => (
                    <article
                      key={policy.id || policy._id}
                      className="hotel-ads-term-card"
                    >
                      <h3>{policy.title || policy.category}</h3>
                      <div
                        className="hotel-ads-term-description"
                        dangerouslySetInnerHTML={{
                          __html: policy.description || "",
                        }}
                      />
                    </article>
                  ))}
                </div>
              )}
            </div>
            <div className="hotel-ads-modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={closeModal}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleConfirmAd}
                disabled={termsLoading || !!termsError || terms.length === 0}
              >
                Tôi đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="hotel-ads-modal-backdrop" onClick={handleCancelPayment}>
          <div className="hotel-ads-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hotel-ads-modal-header">
              <h2>
                Thanh toán quảng cáo tour
                <span
                  style={{
                    marginLeft: "16px",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  ⏱️ {formatCountdown(countdown)}
                </span>
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCancelPayment}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
            <div className="hotel-ads-modal-body">
              {isCreatingPayment ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
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
                  <p>Đang tạo mã thanh toán...</p>
                </div>
              ) : paymentData ? (
                <>
                  {/* Booking Summary */}
                  {adBookingCreated && (
                    <div
                      style={{
                        marginBottom: "24px",
                        padding: "16px",
                        background: "#f9fafb",
                        borderRadius: "8px",
                      }}
                    >
                      <h4 style={{ marginBottom: "12px" }}>
                        Thông tin quảng cáo
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <span>Tour:</span>
                        <strong>{pendingTour?.title || "Không tên"}</strong>
                      </div>
                      {adBookingCreated.schedule && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <span>Ngày bắt đầu:</span>
                            <span>
                              {new Date(
                                adBookingCreated.schedule.start_date
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>Ngày kết thúc:</span>
                            <span>
                              {new Date(
                                adBookingCreated.schedule.end_date
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "12px",
                          paddingTop: "12px",
                          borderTop: "1px solid #e5e7eb",
                        }}
                      >
                        <span>Tổng tiền:</span>
                        <strong>{formatPrice(paymentData.amount)}</strong>
                      </div>
                    </div>
                  )}

                  {/* QR Code Section */}
                  <div style={{ textAlign: "center" }}>
                    <h4 style={{ marginBottom: "16px" }}>
                      Quét mã QR để thanh toán
                    </h4>
                    {paymentData.qr_code_base64 &&
                    paymentData.qr_code_base64.startsWith("data:image") ? (
                      <div>
                        <img
                          src={paymentData.qr_code_base64}
                          alt="PayOS QR Code"
                          style={{
                            maxWidth: "300px",
                            margin: "0 auto 16px",
                            display: "block",
                          }}
                        />
                        <p>📱 Quét mã QR bằng ứng dụng ngân hàng</p>
                        <p style={{ marginTop: "8px" }}>
                          Số tiền:{" "}
                          <strong>{formatPrice(paymentData.amount)}</strong>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p>Không thể hiển thị QR code</p>
                        <a
                          href={paymentData.checkout_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-block",
                            marginTop: "16px",
                            padding: "12px 24px",
                            background: "#06b6d4",
                            color: "white",
                            borderRadius: "8px",
                            textDecoration: "none",
                          }}
                        >
                          Mở trang thanh toán PayOS
                        </a>
                      </div>
                    )}

                    {/* Payment Info */}
                    <div
                      style={{
                        marginTop: "24px",
                        padding: "16px",
                        background: "#f9fafb",
                        borderRadius: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <span>Mã giao dịch:</span>
                        <span>#{paymentData.order_code}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Hết hạn lúc:</span>
                        <span>
                          {new Date(paymentData.expired_at).toLocaleTimeString(
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
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p>Không thể tạo mã thanh toán</p>
                </div>
              )}
            </div>
            <div className="hotel-ads-modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancelPayment}
              >
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
      `}</style>
    </div>
  );
};

export default TourAdsPage;
