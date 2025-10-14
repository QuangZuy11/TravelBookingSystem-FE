import React from "react";
import "./Profile.css";

const PersonalInfo = ({ profile }) => {
  const traveler = profile?.traveler || {};
  const formattedDob = traveler.date_of_birth
    ? new Date(traveler.date_of_birth).toLocaleDateString("vi-VN")
    : "Chưa cập nhật";

  return (
    <div className="card">
      <h2>Thông tin cá nhân</h2>
      <p>
        <strong>Họ tên:</strong> {profile.name}
      </p>
      <p>
        <strong>Email:</strong> {profile.email}
      </p>
      <p>
        <strong>Số điện thoại:</strong> {traveler.phone || "Chưa cập nhật"}
      </p>
      <p>
        <strong>Giới tính:</strong> {traveler.gender || "Chưa cập nhật"}
      </p>
      <p>
        <strong>Ngày sinh:</strong> {formattedDob}
      </p>
      <p>
        <strong>Thành phố:</strong> {traveler.city || "Chưa cập nhật"}
      </p>
      <p>
        <strong>Số hộ chiếu:</strong>{" "}
        {traveler.passport_number || "Chưa cập nhật"}
      </p>
      <p>
        <strong>Quốc tịch:</strong> {traveler.nationality || "Chưa cập nhật"}
      </p>
      <p>
        <strong>Vai trò:</strong> {profile.role?.role_name}
      </p>
    </div>
  );
};

export default PersonalInfo;
