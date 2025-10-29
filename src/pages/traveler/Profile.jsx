import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../../components/layout/Header/Header";
import "./Profile.css";
import RequestPasswordResetButton from "../../components/common/RequestPasswordResetButton";

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  gender: "",
  date_of_birth: "",
  city: "",
  passport_number: "",
  nationality: "",
};

const mapProfileToForm = (profile) => ({
  name: profile?.name || "",
  email: profile?.email || "",
  phone: profile?.traveler?.phone || "",
  gender: profile?.traveler?.gender || "",
  date_of_birth: profile?.traveler?.date_of_birth
    ? profile.traveler.date_of_birth.substring(0, 10)
    : "",
  city: profile?.traveler?.city || "",
  passport_number: profile?.traveler?.passport_number || "",
  nationality: profile?.traveler?.nationality || "",
});

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileMessageType, setProfileMessageType] = useState(null);
  const [loading, setLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordMessageType, setPasswordMessageType] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setProfileMessage("");
    setProfileMessageType(null);

    fetch("http://localhost:3000/api/profiles/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.success) {
          setProfileMessage(data?.message || "Không thể tải thông tin cá nhân.");
          setProfileMessageType("error");
          return;
        }

        setProfile(data.data);
        setFormData(mapProfileToForm(data.data));
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        setProfileMessage("Lỗi server!");
        setProfileMessageType("error");
      });
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "update") {
      setProfileMessage("");
      setProfileMessageType(null);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setProfileMessage("");
    setProfileMessageType(null);

    fetch("http://localhost:3000/api/profiles/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);

        if (!data?.success) {
          setProfileMessage(data?.message || "Cập nhật thất bại!");
          setProfileMessageType("error");
          return;
        }

        setProfile(data.data);
        setFormData(mapProfileToForm(data.data));
        setProfileMessage("Cập nhật thành công!");
        setProfileMessageType("success");
        setActiveTab("info");
      })
      .catch((err) => {
        console.error("Failed to update profile:", err);
        setLoading(false);
        setProfileMessage("Lỗi server!");
        setProfileMessageType("error");
      });
  };

  const handleChangePassword = (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    setPasswordMessage("");
    setPasswordMessageType(null);

    if (!oldPassword.trim() || !newPassword.trim()) {
      setPasswordMessage(
        "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới."
      );
      setPasswordMessageType("error");
      return;
    }

    fetch("http://localhost:3000/api/profiles/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.success) {
          setPasswordMessage(data?.message || "Đổi mật khẩu thất bại!");
          setPasswordMessageType("error");
          return;
        }

        setPasswordMessage("Đổi mật khẩu thành công!");
        setPasswordMessageType("success");
        setOldPassword("");
        setNewPassword("");
      })
      .catch((err) => {
        console.error("Failed to change password:", err);
        setPasswordMessage("Lỗi server!");
        setPasswordMessageType("error");
      });
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="profile-page">
          <h2>Bạn cần đăng nhập để xem thông tin cá nhân.</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="profile-page">
        <div className="sidebar">
          <ul>
            <li
              className={activeTab === "info" ? "active" : ""}
              onClick={() => handleTabChange("info")}
            >
              Thông tin cá nhân
            </li>
            <li
              className={activeTab === "update" ? "active" : ""}
              onClick={() => handleTabChange("update")}
            >
              Cập nhật hồ sơ
            </li>
            <li className="logout-btn" onClick={logout}>
              Đăng xuất
            </li>
          </ul>
        </div>

        <div className="content">
          {activeTab === "info" && (
            <div className="card">
              <h2>Thông tin cá nhân</h2>

              {profileMessage && (
                <div
                  className={`alert ${
                    profileMessageType === "success" ? "success" : "error"
                  }`}
                >
                  {profileMessage}
                </div>
              )}

              {profile ? (
                <>
                  <p>
                    <strong>Họ tên:</strong> {profile.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {profile.email}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong>{" "}
                    {profile.traveler?.phone || "Chưa cập nhật"}
                  </p>
                  <p>
                    <strong>Giới tính:</strong>{" "}
                    {profile.traveler?.gender || "Chưa cập nhật"}
                  </p>
                  <p>
                    <strong>Ngày sinh:</strong>{" "}
                    {profile.traveler?.date_of_birth
                      ? new Date(
                          profile.traveler.date_of_birth
                        ).toLocaleDateString("vi-VN")
                      : "Chưa cập nhật"}
                  </p>
                  <p>
                    <strong>Thành phố:</strong>{" "}
                    {profile.traveler?.city || "Chưa cập nhật"}
                  </p>
                  <p>
                    <strong>Số hộ chiếu:</strong>{" "}
                    {profile.traveler?.passport_number || "Chưa cập nhật"}
                  </p>
                  <p>
                    <strong>Quốc tịch:</strong>{" "}
                    {profile.traveler?.nationality || "Chưa cập nhật"}
                  </p>
                  <p>
                    <strong>Vai trò:</strong> {profile.role?.role_name}
                  </p>
                </>
              ) : (
                <p>Không có dữ liệu thông tin cá nhân.</p>
              )}
            </div>
          )}

          {activeTab === "update" && (
            <div className="card update-form">
              <h2>Cập nhật hồ sơ</h2>
              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label>Họ tên:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập email"
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại:</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="form-group">
                  <label>Giới tính:</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ngày sinh:</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Thành phố:</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Nhập thành phố"
                  />
                </div>
                <div className="form-group">
                  <label>Số hộ chiếu:</label>
                  <input
                    type="text"
                    name="passport_number"
                    value={formData.passport_number}
                    onChange={handleChange}
                    placeholder="Nhập số hộ chiếu"
                  />
                </div>
                <div className="form-group">
                  <label>Quốc tịch:</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    placeholder="Nhập quốc tịch"
                  />
                </div>
                <button type="submit" className="btn-update" disabled={loading}>
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </form>

              {profileMessage && (
                <div
                  className={`alert ${
                    profileMessageType === "success" ? "success" : "error"
                  }`}
                >
                  {profileMessage}
                </div>
              )}

              {/* Gửi email đặt lại mật khẩu (quên/đổi mật khẩu) */}
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #eee" }}>
                <h3 style={{ margin: 0, marginBottom: 8 }}>Đổi mật khẩu qua email</h3>
                <RequestPasswordResetButton email={formData.email || profile?.email} />
              </div>

              <h2 style={{ marginTop: "30px" }}>Đổi mật khẩu</h2>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>Mật khẩu cũ:</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(event) => setOldPassword(event.target.value)}
                    placeholder="Nhập mật khẩu cũ"
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu mới:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
                <button type="submit" className="btn-update">
                  Đổi mật khẩu
                </button>
              </form>

              {passwordMessage && (
                <div
                  className={`alert ${
                    passwordMessageType === "success" ? "success" : "error"
                  }`}
                >
                  {passwordMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
