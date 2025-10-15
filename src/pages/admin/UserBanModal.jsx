import React, { useState } from 'react';
import './Modal.css'; // Dùng chung file CSS

const UserBanModal = ({ user, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const isBanning = user.status !== 'banned'; // Xác định hành động là ban hay unban

    const handleSubmit = () => {
        if (isBanning && !reason.trim()) {
            alert('Vui lòng nhập lý do ban người dùng.');
            return;
        }
        onConfirm(isBanning ? 'ban' : 'unban', reason);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">
                    {isBanning ? 'Xác nhận Ban người dùng' : 'Xác nhận Unban người dùng'}
                </h2>
                
                <p className="modal-description">
                    Bạn có chắc chắn muốn {isBanning ? 'ban' : 'unban'} tài khoản <strong>{user.name}</strong> ({user.email})?
                </p>

                {isBanning && (
                    <div className="form-group">
                        <label htmlFor="reason">Lý do Ban (bắt buộc):</label>
                        <textarea
                            id="reason"
                            rows="3"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="VD: Vi phạm chính sách cộng đồng..."
                        />
                    </div>
                )}

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>Hủy</button>
                    <button 
                        className={isBanning ? 'btn-danger' : 'btn-success'}
                        onClick={handleSubmit}
                    >
                        {isBanning ? 'Xác nhận Ban' : 'Xác nhận Unban'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserBanModal;