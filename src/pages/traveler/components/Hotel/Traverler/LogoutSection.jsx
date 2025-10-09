import React from "react";

const LogoutSection = ({ logout }) => {
  return (
    <div className="card">
      <h2>Đăng xuất tài khoản</h2>
      <p>Bạn có chắc chắn muốn đăng xuất?</p>
      <button
        className="btn-update"
        onClick={logout}
        style={{ background: "red", marginTop: "15px" }}
      >
        Đăng xuất
      </button>
    </div>
  );
};

export default LogoutSection;