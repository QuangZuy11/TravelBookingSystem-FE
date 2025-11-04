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
        setError("Quyền truy cập bị từ chối. Tính năng này chỉ dành cho nhà cung cấp tour.");
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
        const response = await tourApi.getProviderTours(providerId, { limit: 100 });
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
        const data = await termsPolicyService.list({ target: "promotion_tour" });
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

  const handleConfirmAd = () => {
    if (!pendingTour) {
      closeModal();
      return;
    }

    closeModal();
    setSuccessMessage(
      `Đã đăng ký quảng cáo thành công cho tour "${pendingTour.title || "Không tên"}".`
    );
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

      {successMessage && <div className="hotel-ads-success">{successMessage}</div>}

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
                    <img src={coverImage} alt={tour.title} className="hotel-ads-image" />
                  </div>
                ) : (
                  <div className="hotel-ads-image-placeholder">Không có ảnh</div>
                )}
                <div className="hotel-ads-content">
                  <div className="hotel-ads-heading">
                    <h2>{tour.title || "Tour chưa đặt tên"}</h2>
                    {tour.status && (
                      <span className={`hotel-status status-${tour.status.toLowerCase()}`}>
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
                  <button type="button" className="btn-primary" onClick={() => openTermsModal(tour)}>
                    Quảng cáo ngay
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="hotel-ads-modal-backdrop" role="dialog" aria-modal="true">
          <div className="hotel-ads-modal">
            <div className="hotel-ads-modal-header">
              <h2>Điều khoản quảng cáo</h2>
              <button type="button" className="modal-close-btn" onClick={closeModal} aria-label="Đóng">
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
                  Hiện chưa có điều khoản quảng cáo dành cho tour. Vui lòng liên hệ quản trị viên.
                </div>
              ) : (
                <div className="hotel-ads-terms-list">
                  {terms.map((policy) => (
                    <article key={policy.id || policy._id} className="hotel-ads-term-card">
                      <h3>{policy.title || policy.category}</h3>
                      <div
                        className="hotel-ads-term-description"
                        dangerouslySetInnerHTML={{ __html: policy.description || "" }}
                      />
                    </article>
                  ))}
                </div>
              )}
            </div>
            <div className="hotel-ads-modal-actions">
              <button type="button" className="btn-secondary" onClick={closeModal}>
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
    </div>
  );
};

export default TourAdsPage;
