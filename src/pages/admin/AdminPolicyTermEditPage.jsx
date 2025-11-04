import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import policyTermsService from "../../services/policyTermsService";
import "./Admin.css";
import "./PolicyTerms.css";

const EMPTY_FORM = {
  policyType: "TOUR",
  title: "",
  description: "",
};

const AdminPolicyTermEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadDetail = async () => {
      if (!id) {
        toast.error("Thiếu mã điều khoản.");
        navigate("/admin/terms-policies");
        return;
      }

      setLoading(true);
      try {
        const data = await policyTermsService.getById(id);
        if (!isMounted) return;

        if (!data) {
          toast.error("Không tìm thấy điều khoản.");
          navigate("/admin/terms-policies");
          return;
        }

        setFormData({
          policyType: (data.policyType || data.type || "TOUR").toUpperCase(),
          title: data.title || data.category || "",
          description: data.description || "",
        });
      } catch (error) {
        if (isMounted) {
          const message =
            error?.response?.data?.message ||
            "Không thể tải điều khoản quảng cáo.";
          toast.error(message);
          navigate("/admin/terms-policies");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!id) return;

    if (!formData.title.trim()) {
      toast.error("Tiêu đề không được để trống.");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description không được để trống.");
      return;
    }

    setSubmitting(true);
    try {
      await policyTermsService.update(id, {
        policyType: formData.policyType,
        title: formData.title.trim(),
        description: formData.description,
      });
      toast.success("Cập nhật điều khoản thành công");
      navigate(`/admin/terms-policies/${id}`);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Không thể cập nhật điều khoản quảng cáo.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page-container policy-terms-page">
        <div className="policy-terms-status">Đang tải điều khoản...</div>
      </div>
    );
  }

  return (
    <div className="admin-page-container policy-terms-page">
      <header className="admin-page-header">
        <div>
          <h1>Chỉnh sửa điều khoản quảng cáo</h1>
          <p>Cập nhật nội dung và loại áp dụng cho điều khoản.</p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate(`/admin/terms-policies/${id}`)}
          disabled={submitting}
        >
          Hủy
        </button>
      </header>

      <form className="policy-terms-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="policyType">Loại</label>
          <select
            id="policyType"
            name="policyType"
            value={formData.policyType}
            onChange={handleChange}
          >
            <option value="TOUR">Tour</option>
            <option value="HOTEL">Hotel</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="title">Tiêu đề</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Nhập tiêu đề điều khoản"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Nhập nội dung mô tả (có thể chứa HTML)"
            rows={10}
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(`/admin/terms-policies/${id}`)}
            disabled={submitting}
          >
            Hủy
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPolicyTermEditPage;
