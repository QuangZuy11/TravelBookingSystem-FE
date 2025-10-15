import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../../contexts/AuthContext";
import Header from "../../../../../components/layout/Header/Header";
import TopBar from "../../../../../components/layout/Topbar/Topbar";
import "./Profile.css";

import PersonalInfo from "./PersonalInfo";
import UpdateProfile from "./UpdateProfile";
import LogoutSection from "./LogoutSection";

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:3000/api/profiles/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setProfile(data.data))
        .catch((err) => console.error("Lỗi khi lấy profile:", err));
    }
  }, []);

  const handleProfileUpdated = (updatedProfile) => {
    if (updatedProfile) {
      setProfile(updatedProfile);
    }
    setActiveTab("info");
  };

  if (!user) {
    return (
      <>
        <TopBar />
        <Header />
        <div className="profile-page">
          <h2>Bạn cần đăng nhập để xem thông tin cá nhân.</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar />
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
            <li
              className={activeTab === "logout" ? "active" : ""}
              onClick={() => setActiveTab("logout")}
            >
              Đăng xuất
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="content">
          {activeTab === "info" && profile && <PersonalInfo profile={profile} />}
          {activeTab === "update" && (
            <UpdateProfile profile={profile} onProfileUpdated={handleProfileUpdated} />
          )}
          {activeTab === "logout" && <LogoutSection logout={logout} />}
        </div>
      </div>
    </>
  );
};

export default Profile;
