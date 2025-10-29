import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import authService from "../../services/authService";

const RequestPasswordResetButton = ({ email: emailProp }) => {
  const { user } = useAuth?.() || {};
  const email = emailProp || user?.email || JSON.parse(localStorage.getItem("user") || "{}")?.email;

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [link, setLink] = useState("");

  const handleRequest = async () => {
    if (!email) return alert("Không tìm thấy email tài khoản.");
    setLoading(true);
    setMsg("");
    setLink("");
    try {
      const { data } = await authService.forgotPassword(email);
      setMsg(data?.message || "Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu.");
      if (data?.resetLink) setLink(data.resetLink);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Lỗi gửi yêu cầu đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="btn-primary" onClick={handleRequest} disabled={loading}>
        {loading ? "Đang gửi..." : "Đổi mật khẩu (gửi email)"}
      </button>
      {msg && <div style={{ marginTop: 8, fontSize: 12 }}>{msg}</div>}
      {link && (
        <div style={{ marginTop: 6 }}>
          <a href={link} style={{ color: "#4f46e5", fontSize: 12 }}>Mở liên kết đặt lại mật khẩu (DEV)</a>
        </div>
      )}
    </div>
  );
};

export default RequestPasswordResetButton;