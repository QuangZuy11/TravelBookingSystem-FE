import React, { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../../services/authService";
import "./ForgotReset.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [devResetLink, setDevResetLink] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");
    setDevResetLink("");

    try {
      const { data } = await authService.forgotPassword(email.trim());
      setSuccessMsg(data?.message || "Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu.");
      if (data?.resetLink) setDevResetLink(data.resetLink);
    } catch (err) {
      const msg = err?.response?.data?.message || "Lỗi gửi yêu cầu đặt lại mật khẩu";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-title">Quên mật khẩu</div>
        <div className="auth-desc">Nhập email để nhận liên kết đặt lại mật khẩu.</div>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="row-actions">
            <button type="button" className="btn-secondary" onClick={() => setEmail("")} disabled={submitting}>
              Xóa
            </button>
            <button type="submit" className="btn-primary" disabled={submitting || !email.trim()}>
              {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </div>
        </form>

        <div className="note" style={{ marginTop: 10 }}>
          <Link to="/auth" className="link">Quay lại đăng nhập</Link>
        </div>

        {devResetLink && (
          <div className="dev-box">
            Dev mode: Reset link
            <div>
              <a className="link" href={devResetLink}>Mở trang đặt lại mật khẩu</a>
            </div>
            <div>{devResetLink}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;