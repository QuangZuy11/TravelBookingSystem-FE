import React, { useCallback, useEffect, useState } from "react";
import hotelService from "../../../services/hotelService";
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

const formatAddress = (hotel) => {
  const raw = hotel.address || hotel.location?.address || hotel.location;
  if (!raw) return "Chưa cập nhật địa chỉ";

  if (typeof raw === "string") {
    return raw;
  }

  if (typeof raw === "object" && raw !== null) {
    const parts = [
      raw.street || raw.streetAddress,
      raw.ward,
      raw.district || raw.county,
      raw.city || raw.town,
      raw.state,
      raw.country,
      raw.zipCode || raw.postalCode,
    ]
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter(Boolean);

    if (parts.length) {
      return parts.join(", ");
    }
  }

  return "Chưa cập nhật địa chỉ";
};

const resolveHotelCoverImage = (hotel) => {
  const candidates = [
    hotel.coverImage,
    hotel.thumbnail,
    Array.isArray(hotel.images) ? hotel.images[0] : null,
    hotel.mainImage,
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

const HotelAdsPage = () => {
  const [providerId, setProviderId] = useState("");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [terms, setTerms] = useState([]);
  const [termsLoading, setTermsLoading] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingHotel, setPendingHotel] = useState(null);
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
      if (!types.includes("hotel")) {
        setError("Quyền truy cập bị từ chối. Tính năng này chỉ dành cho nhà cung cấp khách sạn.");
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

    const loadHotels = async () => {
      setLoading(true);
      try {
        const response = await hotelService.getProviderHotels(providerId, { limit: 100 });
        const data = response?.data?.data || response?.data?.hotels || response?.data || [];
        setHotels(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        console.error("Failed to fetch provider hotels", err);
        setError("Không thể tải danh sách khách sạn.");
      } finally {
        setLoading(false);
      }
    };

    loadHotels();
  }, [providerId]);

  useEffect(() => {
    const loadTerms = async () => {
      if (!isModalOpen || terms.length > 0 || termsLoading) return;
      setTermsLoading(true);
      setTermsError("");
      try {
        const data = await termsPolicyService.list({ target: "promotion_hotel" });
        setTerms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch hotel promotion terms", err);
        setTermsError("Không thể tải điều khoản quảng cáo cho khách sạn.");
      } finally {
        setTermsLoading(false);
      }
    };

    loadTerms();
  }, [isModalOpen, terms.length, termsLoading]);

  const openTermsModal = (hotel) => {
    setPendingHotel(hotel);
    setIsModalOpen(true);
    setSuccessMessage("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPendingHotel(null);
  };

  const handleConfirmAd = () => {
    if (!pendingHotel) {
      closeModal();
      return;
    }

    closeModal();
    setSuccessMessage(
      `Đã đăng ký quảng cáo thành công cho khách sạn "${pendingHotel.name || "Không tên"}".`
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
          <h1>Quảng cáo khách sạn</h1>
          <p>Chọn khách sạn bạn sở hữu để tạo chương trình quảng cáo nổi bật.</p>
        </div>
      </header>

      {successMessage && <div className="hotel-ads-success">{successMessage}</div>}

      {hotels.length === 0 ? (
        <div className="hotel-ads-status">
          Bạn chưa có khách sạn nào trong hệ thống. Hãy tạo khách sạn trước khi quảng cáo.
        </div>
      ) : (
        <div className="hotel-ads-grid">
          {hotels.map((hotel) => {
            const coverImage = resolveHotelCoverImage(hotel);
            return (
              <div key={hotel._id} className="hotel-ads-card">
                {coverImage ? (
                  <div className="hotel-ads-image-wrapper">
                    <img src={coverImage} alt={hotel.name} className="hotel-ads-image" />
                  </div>
                ) : (
                  <div className="hotel-ads-image-placeholder">Không có ảnh</div>
                )}
                <div className="hotel-ads-content">
                  <div className="hotel-ads-heading">
                    <h2>{hotel.name || "Khách sạn chưa đặt tên"}</h2>
                    {hotel.status && (
                      <span className={`hotel-status status-${hotel.status.toLowerCase()}`}>
                        {hotel.status}
                      </span>
                    )}
                  </div>
                  <p className="hotel-ads-address">{formatAddress(hotel)}</p>
                  <div className="hotel-ads-meta">
                    {hotel.city && <span>Thành phố: {hotel.city}</span>}
                    {hotel.rating && (
                      <span>
                        Đánh giá: {Number(hotel.rating).toFixed(1)}
                        /5
                      </span>
                    )}
                    {hotel.totalReviews && (
                      <span>Lượt đánh giá: {hotel.totalReviews}</span>
                    )}
                  </div>
                </div>
                <div className="hotel-ads-actions">
                  <button type="button" className="btn-primary" onClick={() => openTermsModal(hotel)}>
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
                  Hiện chưa có điều khoản quảng cáo dành cho khách sạn. Vui lòng liên hệ quản trị viên.
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

export default HotelAdsPage;
