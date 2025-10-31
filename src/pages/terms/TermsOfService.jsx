import React, { useEffect, useMemo, useState } from "react";
import {
  XCircle,
  Calendar,
  Users,
  Shield,
  CreditCard,
  FileText,
  Info,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import TopBar from "../../components/layout/Topbar/Topbar";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import "./TermsOfService.css";
import { useAuth } from "../../contexts/AuthContext";
import termsPolicyService from "../../services/termsPolicyService";

const normalizeIconKey = (key) => {
  if (typeof key !== "string") {
    return "";
  }

  return key.toUpperCase().replace(/[^A-Z0-9]/g, "");
};

const ICON_MAP = {
  CREDITCARD: CreditCard,
  PAYMENT: CreditCard,
  REFUND: CreditCard,
  XCIRCLE: XCircle,
  CANCEL: XCircle,
  CANCELLATION: XCircle,
  CALENDAR: Calendar,
  SCHEDULE: Calendar,
  USERS: Users,
  CUSTOMER: Users,
  TRAVELER: Users,
  SHIELD: Shield,
  SECURITY: Shield,
  PROTECTION: Shield,
  FILE: FileText,
  DOCUMENT: FileText,
  FILETEXT: FileText,
  INFO: Info,
  INFORMATION: Info,
  ALERT: AlertTriangle,
  WARNING: AlertTriangle,
  ALERTTRIANGLE: AlertTriangle,
  CHECK: CheckCircle,
  CONFIRM: CheckCircle,
  CHECKCIRCLE: CheckCircle,
  PHONE: Phone,
  CONTACT: Phone,
  MAIL: Mail,
  EMAIL: Mail,
  CLOCK: Clock,
  TIME: Clock,
};

const resolveIcon = (key, className = "w-5 h-5") => {
  const IconComponent = ICON_MAP[normalizeIconKey(key)] || FileText;
  return <IconComponent className={className} />;
};

const resolveItemIcon = (tone) => {
  switch ((tone || "").toLowerCase()) {
    case "warning":
    case "critical":
      return AlertTriangle;
    case "success":
      return CheckCircle;
    case "info":
    case "note":
    default:
      return Info;
  }
};

const derivePrimaryTarget = (user) => {
  if (!user || !user.role) {
    return "traveler";
  }

  const role = user.role.toString().trim().toLowerCase();

  if (role === "traveler") {
    return "traveler";
  }

  if (role === "serviceprovider" || role === "service_provider") {
    const providerType = user.provider?.type;
    if (providerType) {
      return `${providerType.toLowerCase()}_provider`;
    }
    return "service_provider";
  }

  return "traveler";
};

const resolveItemTone = (item) => {
  if (!item) return "info";
  if (item.tone) return item.tone.toLowerCase();
  if (item.important) return "warning";
  return "info";
};

export default function TermsAndConditions() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTerms = async () => {
      setLoading(true);
      setError(null);

      try {
        let data = [];
        const targetOverride = derivePrimaryTarget(user);

        if (user?.role) {
          try {
            data = await termsPolicyService.listForCurrentUser({
              includeCommon: true,
              target: targetOverride,
            });
          } catch (err) {
            const status = err?.response?.status;
            if (!status || (status !== 401 && status !== 403)) {
              throw err;
            }
          }
        }

        if (!data.length) {
          const fallbackParams = {
            includeCommon: true,
            target: targetOverride || "traveler",
          };

          data = await termsPolicyService.list(fallbackParams);
        }

        if (isMounted) {
          const normalizedData = Array.isArray(data)
            ? data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            : [];
          setTerms(normalizedData);
          setActiveTab(0);
        }
      } catch (err) {
        console.error("Failed to load terms & policies", err);
        if (isMounted) {
          setError(
            "Không thể tải điều khoản & chính sách. Vui lòng thử lại sau."
          );
          setTerms([]);
          setActiveTab(0);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTerms();

    return () => {
      isMounted = false;
    };
  }, [user?.role, user?.provider?.type]);

  const activeTerm = useMemo(() => {
    if (!terms.length) {
      return null;
    }

    const safeIndex = Math.min(activeTab, terms.length - 1);
    return terms[safeIndex];
  }, [terms, activeTab]);

  const sortedItems = useMemo(() => {
    if (!activeTerm || !Array.isArray(activeTerm.items)) {
      return [];
    }

    return [...activeTerm.items].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
  }, [activeTerm]);

  return (
    <div className="terms-container">
      <TopBar />
      <Header />

      <div className="hero-section">
        <div className="hero-pattern"></div>
        <div className="hero-content">
          <h1 className="hero-title">Điều Khoản &amp; Chính Sách</h1>
          <p className="hero-subtitle">
            Trải nghiệm du lịch được cá nhân hóa với công nghệ AI tiên tiến
          </p>
          <p className="hero-date">Cập nhật: Tháng 10, 2025</p>
        </div>
      </div>

      <div className="alert-wrapper">
        <div className="alert-box">
          <div className="alert-content">
            <div className="alert-icon">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="alert-text">
              <h3 className="alert-title">Lưu Ý Quan Trọng</h3>
              <p className="alert-description">
                Sau khi đặt tour và thanh toán thành công, quý khách sẽ{" "}
                <span className="alert-highlight">KHÔNG được hoàn tiền</span>{" "}
                trong trường hợp hủy tour. Vui lòng cân nhắc kỹ trước khi xác
                nhận đặt tour.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="terms-content">
        <div className="terms-grid">
          <div className="sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">Danh Mục</h3>
              <div className="sidebar-menu">
                {terms.map((term, idx) => (
                  <button
                    key={term._id || term.id || idx}
                    onClick={() => setActiveTab(idx)}
                    className={`menu-item ${activeTab === idx ? "active" : ""}`}
                    type="button"
                  >
                    {resolveIcon(term.iconKey)}
                    <span className="menu-text">
                      {term.category || term.title || "Danh mục"}
                    </span>
                  </button>
                ))}
                {!terms.length && !loading && !error && (
                  <div className="menu-empty">
                    Chưa có điều khoản phù hợp.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="content-area">
            <div className="content-card">
              {loading ? (
                <div className="empty-state">Đang tải điều khoản...</div>
              ) : error ? (
                <div className="empty-state error">{error}</div>
              ) : !activeTerm ? (
                <div className="empty-state">
                  Chưa có điều khoản cho vai trò này.
                </div>
              ) : (
                <>
                  <div className="content-header">
                    <div className="content-icon">
                      {resolveIcon(activeTerm.iconKey, "w-5 h-5")}
                    </div>
                    <h2 className="content-title">
                      {activeTerm.category || activeTerm.title}
                    </h2>
                  </div>

                  {activeTerm.description && (
                    <p className="content-description">
                      {activeTerm.description}
                    </p>
                  )}

                  <div className="items-list">
                    {sortedItems.length ? (
                      sortedItems.map((item, idx) => {
                        const tone = resolveItemTone(item);
                        const ItemIcon = resolveItemIcon(tone);
                        return (
                          <div
                            key={`${item.text}-${idx}`}
                            className={`item tone-${tone}${
                              item.important ? " important" : ""
                            }`}
                          >
                            <div className="item-icon">
                              <ItemIcon className="w-5 h-5" />
                            </div>
                            <p className="item-text">{item.text}</p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="item tone-info">
                        <div className="item-icon">
                          <Info className="w-5 h-5" />
                        </div>
                        <p className="item-text">
                          Điều khoản đang được cập nhật. Vui lòng quay lại sau.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
