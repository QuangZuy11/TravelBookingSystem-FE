import React, { useState, useEffect } from "react";

const UpdateProfile = ({ profile, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    city: "",
    passport_number: "",
    nationality: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  useEffect(() => {
    if (!profile) return;
    const traveler = profile?.traveler || {};
    setFormData({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: traveler.phone || "",
      gender: traveler.gender || "",
      date_of_birth: traveler.date_of_birth
        ? traveler.date_of_birth.substring(0, 10)
        : "",
      city: traveler.city || "",
      passport_number: traveler.passport_number || "",
      nationality: traveler.nationality || "",
    });
  }, [profile]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Họ tên không được để trống.";
    } else if (formData.name.length < 2) {
      newErrors.name = "Họ tên quá ngắn.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống.";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải gồm 10 chữ số.";
    }

    const travelerFieldsFilled =
      formData.passport_number ||
      formData.nationality ||
      formData.gender ||
      formData.date_of_birth ||
      profile?.traveler;

    if (travelerFieldsFilled) {
      if (!formData.gender) {
        newErrors.gender = "Vui lòng chọn giới tính (bắt buộc cho traveler).";
      }
      if (!formData.passport_number.trim()) {
        newErrors.passport_number = "Vui lòng nhập số hộ chiếu.";
      }
      if (!formData.nationality.trim()) {
        newErrors.nationality = "Vui lòng nhập quốc tịch.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
    setErrors({
      ...errors,
      [event.target.name]: "",
    });
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem("token");
    setLoading(true);
    setMessage("");

    const payload = {};
    [
      "name",
      "email",
      "phone",
      "gender",
      "date_of_birth",
      "city",
      "passport_number",
      "nationality",
    ].forEach((key) => {
      const value = formData[key];
      if (value && value.trim && value.trim() !== "") {
        payload[key] = value;
      } else if (value && typeof value !== "string") {
        payload[key] = value;
      }
    });

    fetch("http://localhost:3000/api/profiles/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (!data?.success) {
          setMessage(data?.message || "Cập nhật thất bại!");
          return;
        }

        setMessage("Cập nhật thành công!");
        if (typeof onProfileUpdated === "function") {
          onProfileUpdated(data.data);
        }
      })
      .catch(() => {
        setLoading(false);
        setMessage("Lỗi server!");
      });
  };

  const handleChangePassword = (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    setPasswordMsg("");

    if (!oldPassword.trim() || !newPassword.trim()) {
      setPasswordMsg("Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới.");
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

        <div className="form-group">
          <label>Giới tính:</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Chọn giới tính</option>
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
            <option value="Other">Khác</option>
          </select>
          {errors.gender && <span className="error-text">{errors.gender}</span>}
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

        <div className="form-group">
          <label>Số hộ chiếu:</label>
          <input
            name="passport_number"
            value={formData.passport_number}
            onChange={handleChange}
          />
          {errors.passport_number && (
            <span className="error-text">{errors.passport_number}</span>
          )}
        </div>

        <div className="form-group">
          <label>Quốc tịch:</label>
          <input
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
          />
          {errors.nationality && (
            <span className="error-text">{errors.nationality}</span>
          )}
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
            onChange={(event) => setOldPassword(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Mật khẩu mới:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
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
