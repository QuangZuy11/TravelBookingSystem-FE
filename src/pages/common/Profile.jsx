import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../../components/layout/Header/Header";
import "./Profile.css";

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // state đổi mật khẩu
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:3000/api/profiles/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setProfile(data.data);
          setFormData({
            name: data.data?.name || "",
            email: data.data?.email || "",
            phone: data.data?.phone || "",
          });
        })
        .catch((err) => console.error("Lỗi khi lấy profile:", err));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setLoading(true);
    setMessage("");

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
        if (data.success) {
          setProfile(data.data);
          setMessage("Cập nhật thành công!");
        } else {
          setMessage("Cập nhật thất bại!");
        }
      })
      .catch((err) => {
        console.error("Lỗi khi cập nhật profile:", err);
        setLoading(false);
        setMessage("Lỗi server!");
      });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

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
        if (data.success) {
          setPasswordMsg("Đổi mật khẩu thành công!");
          setOldPassword("");
          setNewPassword("");
        } else {
          setPasswordMsg(data.message || "Đổi mật khẩu thất bại!");
        }
      })
      .catch(() => setPasswordMsg("Lỗi server!"));
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
        {/* Sidebar */}
        <div className="sidebar">
          <ul>
            <li
              className={activeTab === "info" ? "active" : ""}
              onClick={() => setActiveTab("info")}
            >
              Thông tin cá nhân
            </li>
            <li
              className={activeTab === "update" ? "active" : ""}
              onClick={() => setActiveTab("update")}
            >
              Cập nhật hồ sơ
            </li>
            <li onClick={logout} className="logout-btn">
              Đăng xuất
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="content">
          {activeTab === "info" && profile && (
            <div className="card">
              <h2>Thông tin cá nhân</h2>
              <p>
                <strong>Họ tên:</strong> {profile.name}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <p>
                <strong>Số điện thoại:</strong>{" "}
                {profile.phone || "Chưa có"}
              </p>
              <p>
                <strong>Vai trò:</strong> {profile.role?.role_name}
              </p>
            </div>
          )}

          {activeTab === "update" && (
            <div className="card update-form">
              {/* Cập nhật thông tin */}
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
                <button type="submit" className="btn-update" disabled={loading}>
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </form>

              {message && (
                <div
                  className={`alert ${
                    message.includes("thành công") ? "success" : "error"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Đổi mật khẩu */}
              <h2 style={{ marginTop: "30px" }}>Đổi mật khẩu</h2>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>Mật khẩu cũ:</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu cũ"
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu mới:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
                <button type="submit" className="btn-update">
                  Đổi mật khẩu
                </button>
              </form>
              {passwordMsg && (
                <div
                  className={`alert ${
                    passwordMsg.includes("thành công") ? "success" : "error"
                  }`}
                >
                  {passwordMsg}
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

