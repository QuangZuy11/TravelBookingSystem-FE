import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const AdminPolicyTermsPage = () => {
  const navigate = useNavigate();
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTerms = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await policyTermsService.list();
      setTerms(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Không thể tải danh sách điều khoản quảng cáo.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  return (
    <div className="admin-page-container policy-terms-page">
      <header className="admin-page-header">
        <div>
          <h1>Điều khoản quảng cáo</h1>
          <p>Quản lý danh sách điều khoản áp dụng cho khuyến mãi.</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate("/admin/terms-policies/create")}
        >
          Tạo điều khoản
        </button>
      </header>

      <div className="policy-terms-card">
        {loading ? (
          <div className="policy-terms-status">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="policy-terms-status error">{error}</div>
        ) : terms.length === 0 ? (
          <div className="policy-terms-status">
            Chưa có điều khoản quảng cáo nào.
          </div>
        ) : (
          <div className="policy-terms-table-wrapper">
            <table className="policy-terms-table">
              <thead>
                <tr>
                  <th>TIÊU ĐỀ</th>
                  <th>LOẠI</th>
                  <th>NGÀY TẠO</th>
                  <th>NGÀY CẬP NHẬT</th>
                </tr>
              </thead>
              <tbody>
                {terms.map((term) => (
                  <tr
                    key={term.id || term._id}
                    className="policy-terms-row"
                    onClick={() =>
                      navigate(`/admin/terms-policies/${term.id || term._id}`)
                    }
                  >
                    <td>{term.title || term.category}</td>
                    <td>
                      <span className="policy-terms-badge">
                        {toTypeLabel(term.policyType || term.type)}
                      </span>
                    </td>
                    <td>{formatDateTime(term.createdAt)}</td>
                    <td>{formatDateTime(term.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPolicyTermsPage;
