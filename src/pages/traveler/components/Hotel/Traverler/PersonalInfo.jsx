import React from "react";
import "./Profile.css";
const PersonalInfo = ({ profile }) => {
  return (
    <div className="card">
      <h2>Thông tin cá nhân</h2>
      <p><strong>Họ tên:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Số điện thoại:</strong> {profile.phone || "Chưa có"}</p>
      <p><strong>Giới tính:</strong> {profile.gender || "Chưa cập nhật"}</p>
      <p>
        <strong>Ngày sinh:</strong>{" "}
        {profile.date_of_birth
          ? new Date(profile.date_of_birth).toLocaleDateString("vi-VN")
          : "Chưa cập nhật"}
      </p>
      <p><strong>Thành phố:</strong> {profile.city || "Chưa cập nhật"}</p>
      <p><strong>Vai trò:</strong> {profile.role?.role_name}</p>
    </div>
  );
};

export default PersonalInfo;
