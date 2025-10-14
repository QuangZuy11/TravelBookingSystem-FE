import React, { useState } from 'react';
import './Modal.css'; 

const UserPasswordModal = ({ user, onClose, onSave }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!newPassword) {
            setError('Vui lòng nhập mật khẩu mới.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }
        onSave(newPassword);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Đổi mật khẩu cho người dùng</h2>
                
                <p className="modal-description">
                    Đặt lại mật khẩu cho tài khoản <strong>{user.name}</strong>.
                </p>

                <div className="form-group">
                    <label htmlFor="newPassword">Mật khẩu mới:</label>
                    <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu mới:</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                    />
                </div>

                {error && <p className="modal-error">{error}</p>}

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>Hủy</button>
                    <button className="btn-primary" onClick={handleSubmit}>Lưu mật khẩu mới</button>
                </div>
            </div>
        </div>
    );
};

export default UserPasswordModal;