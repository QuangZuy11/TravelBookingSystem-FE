import React, { useState } from "react";

const UpdateProfile = ({ profile }) => {
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    gender: profile?.gender || "",
    date_of_birth: profile?.date_of_birth
      ? profile.date_of_birth.split("T")[0]
      : "",
    city: profile?.city || "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  // =========================
  // Validate dữ liệu người dùng nhập
  // =========================
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Họ tên không được để trống";
    } else if (formData.name.length < 2) {
      newErrors.name = "Họ tên quá ngắn";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải gồm 10 chữ số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // Xử lý thay đổi input
  // =========================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // =========================
  // Cập nhật hồ sơ
  // =========================
  const handleUpdate = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem("token");
    setLoading(true);

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
        setMessage(data.success ? "Cập nhật thành công!" : "Cập nhật thất bại!");
      })
      .catch(() => {
        setLoading(false);
        setMessage("Lỗi server!");
      });
  };

  // =========================
  // Đổi mật khẩu
  // =========================
  const handleChangePassword = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!oldPassword.trim() || !newPassword.trim()) {
      setPasswordMsg("Vui lòng nhập đầy đủ mật khẩu cũ và mới!");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg("Mật khẩu mới phải có ít nhất 6 ký tự!");
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

  return (
    <div className="card update-form">
      <h2>Cập nhật hồ sơ</h2>
      <form onSubmit={handleUpdate}>
        <div className="form-group">
          <label>Họ tên:</label>
          <input name="name" value={formData.name} onChange={handleChange} />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input name="email" value={formData.email} onChange={handleChange} />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Số điện thoại:</label>
          <input name="phone" value={formData.phone} onChange={handleChange} />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        {/* ✅ Thêm 3 trường mới */}
        <div className="form-group">
          <label>Giới tính:</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
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
          <input name="city" value={formData.city} onChange={handleChange} />
        </div>

        <button type="submit" className="btn-update" disabled={loading}>
          {loading ? "Đang cập nhật..." : "Cập nhật"}
        </button>
      </form>

      {message && (
        <div className={`alert ${message.includes("thành công") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      <h2 style={{ marginTop: "30px" }}>Đổi mật khẩu</h2>
      <form onSubmit={handleChangePassword}>
        <div className="form-group">
          <label>Mật khẩu cũ:</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Mật khẩu mới:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-update">
          Đổi mật khẩu
        </button>
      </form>
      {passwordMsg && (
        <div className={`alert ${passwordMsg.includes("thành công") ? "success" : "error"}`}>
          {passwordMsg}
        </div>
      )}
    </div>
  );
};

export default UpdateProfile;