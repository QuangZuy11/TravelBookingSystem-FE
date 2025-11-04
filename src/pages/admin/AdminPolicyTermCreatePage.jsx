import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import policyTermsService from "../../services/policyTermsService";
import "./Admin.css";
import "./PolicyTerms.css";

const INITIAL_FORM = {
  policyType: "TOUR",
  title: "",
  description: "",
};

const AdminPolicyTermCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Tiêu đề không được để trống.");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description không được để trống.");
      return;
    }

    setIsSubmitting(true);
    try {
      await policyTermsService.create({
        policyType: formData.policyType,
        title: formData.title.trim(),
        description: formData.description,
      });
      toast.success("Tạo điều khoản thành công");
      navigate("/admin/terms-policies");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Không thể tạo điều khoản quảng cáo.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page-container policy-terms-page">
      <header className="admin-page-header">
        <div>
          <h1>Tạo điều khoản quảng cáo</h1>
          <p>Nhập thông tin điều khoản mới cho khuyến mãi.</p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/admin/terms-policies")}
          disabled={isSubmitting}
        >
          Huỷ
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
            placeholder="Nhập nội dung điều khoản"
            rows={10}
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/admin/terms-policies")}
            disabled={isSubmitting}
          >
            Huỷ
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPolicyTermCreatePage;
