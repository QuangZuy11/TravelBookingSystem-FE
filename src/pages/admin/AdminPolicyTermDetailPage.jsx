import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import policyTermsService from "../../services/policyTermsService";
import "./Admin.css";
import "./PolicyTerms.css";

const formatDateTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("vi-VN", { hour12: false });
};

const toTypeLabel = (value) => {
  if (!value) return "--";
  const normalized = value.toString().trim().toUpperCase();
  if (normalized === "HOTEL") return "Hotel";
  if (normalized === "TOUR") return "Tour";
  if (normalized === "TRAVELER") return "Traveler";
  return value;
};

const AdminPolicyTermDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [term, setTerm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await policyTermsService.getById(id);
        if (!isMounted) return;

        if (!data) {
          setError("Không tìm thấy điều khoản quảng cáo.");
        } else {
          setTerm(data);
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err?.response?.data?.message ||
            "Không thể tải chi tiết điều khoản quảng cáo.";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchDetail();
    } else {
      setError("Thiếu mã điều khoản quảng cáo.");
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm("Bạn chắc chắn muốn xóa điều khoản này?");
    if (!confirmed) return;

    try {
      await policyTermsService.remove(id);
      toast.success("Đã xóa điều khoản.");
      navigate("/admin/terms-policies");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Không thể xóa điều khoản quảng cáo.";
      toast.error(message);
    }
  };

  return (
    <div className="admin-page-container policy-terms-page">
      <header className="admin-page-header">
        <div>
          <h1>Chi tiết điều khoản</h1>
          <p>Xem thông tin điều khoản quảng cáo đã tạo.</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/admin/terms-policies")}
          >
            Quay lại danh sách
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate(`/admin/terms-policies/${id}/edit`)}
          >
            Chỉnh sửa
          </button>
          <button
            type="button"
            className="btn-danger-solid"
            onClick={handleDelete}
          >
            Xóa
          </button>
        </div>
      </header>

      <div className="policy-terms-card">
        {loading ? (
          <div className="policy-terms-status">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="policy-terms-status error">{error}</div>
        ) : !term ? (
          <div className="policy-terms-status">
            Không tìm thấy điều khoản quảng cáo.
          </div>
        ) : (
          <div className="policy-term-detail">
            <div className="policy-term-meta">
              <div>
                <span className="meta-label">Tiêu đề</span>
                <h2 className="meta-value">{term.title || term.category}</h2>
              </div>
              <div>
                <span className="meta-label">Loại</span>
                <span className="policy-terms-badge large">
                  {toTypeLabel(term.policyType || term.type)}
                </span>
              </div>
            </div>

            <div className="policy-term-meta">
              <div>
                <span className="meta-label">Ngày tạo</span>
                <p className="meta-value">{formatDateTime(term.createdAt)}</p>
              </div>
              <div>
                <span className="meta-label">Ngày cập nhật</span>
                <p className="meta-value">{formatDateTime(term.updatedAt)}</p>
              </div>
            </div>

            <div className="policy-term-description">
              <span className="meta-label">Description</span>
              <div
                className="description-content"
                dangerouslySetInnerHTML={{
                  __html: term.description || "<em>Không có mô tả.</em>",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPolicyTermDetailPage;
