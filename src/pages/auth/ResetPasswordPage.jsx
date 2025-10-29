import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import authService from "../../services/authService";
import "./ForgotReset.css";

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const email = useMemo(() => params.get("email") || "", [params]);
  const token = useMemo(() => params.get("token") || "", [params]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const valid = email && token && password.length >= 6 && password === confirm;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { data } = await authService.resetPassword({
        email,
        token,
        newPassword: password,
      });
      setSuccessMsg(data?.message || "Đặt lại mật khẩu thành công.");
      setTimeout(() => navigate("/auth"), 900);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Lỗi đặt lại mật khẩu. Vui lòng thử lại.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const missing = !email || !token;

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-title">Đặt lại mật khẩu</div>
        <div className="auth-desc">Nhập mật khẩu mới cho tài khoản của bạn.</div>

        {missing && (
          <div className="alert alert-error">
            Thiếu thông tin token hoặc email. Vui lòng mở lại liên kết từ email.
          </div>
        )}

        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-row">
            <label>Email</label>
            <input type="email" value={email} readOnly />
          </div>
          <div className="form-row">
            <label>Mật khẩu mới (lớn hơn hoặc bằng 6 ký tự)</label>
            <input
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div className="form-row">
            <label>Nhập lại mật khẩu</label>
            <input
              type="password"
              placeholder="••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className="row-actions">
            <Link to="/auth" className="btn-secondary">Hủy</Link>
            <button type="submit" className="btn-primary" disabled={!valid || submitting || missing}>
              {submitting ? "Đang lưu..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;