import React from "react";

const PersonalInfo = ({ profile }) => {
  return (
    <div className="card">
      <h2>Thông tin cá nhân</h2>
      <p><strong>Họ tên:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Số điện thoại:</strong> {profile.phone || "Chưa có"}</p>
      <p><strong>Vai trò:</strong> {profile.role?.role_name}</p>
    </div>
  );
};

export default PersonalInfo;
