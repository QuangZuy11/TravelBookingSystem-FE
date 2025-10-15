import React, { useState, useEffect } from 'react';
import './Modal.css'; // Dùng chung file CSS cho Modal

const UserEditModal = ({ user, onClose, onSave }) => {
    // Khởi tạo state cho form, bao gồm cả password
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role_name: 'Traveler',
        status: 'active',
        password: '' // Chỉ dùng khi tạo mới
    });

    // Khi component nhận prop `user` (chế độ edit), cập nhật state của form
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                role_name: user.role?.role_name || 'Traveler',
                status: user.status || 'active',
                password: '' // Luôn để trống password khi edit
            });
        } else {
            // Reset form cho chế độ tạo mới
            setFormData({
                name: '', email: '', phone: '', role_name: 'Traveler', status: 'active', password: ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Tạo một bản sao của dữ liệu để gửi đi
        const dataToSave = { ...formData };

        // Nếu là chế độ edit và không nhập mật khẩu mới, thì không gửi trường password
        if (user && !dataToSave.password) {
            delete dataToSave.password;
        } 
        // Nếu là chế độ tạo mới và không nhập password
        else if (!user && !dataToSave.password) {
            alert('Vui lòng nhập mật khẩu khi tạo người dùng mới.');
            return;
        }
        
        onSave(dataToSave);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">{user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Họ tên:</label>
                        <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại:</label>
                        <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role_name">Vai trò:</label>
                        <select id="role_name" name="role_name" value={formData.role_name} onChange={handleChange}>
                            <option value="Traveler">Traveler</option>
                            <option value="ServiceProvider">Service Provider</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    {/* Chỉ hiển thị trường password khi tạo người dùng mới */}
                    {!user && (
                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu:</label>
                            <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                        </div>
                    )}
                    
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Hủy</button>
                        <button type="submit" className="btn-primary">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserEditModal;