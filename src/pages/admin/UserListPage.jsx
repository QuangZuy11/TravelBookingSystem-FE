import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import './Admin.css'; // Sử dụng file CSS chung

const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        role: '',
        status: '',
        search: ''
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminService.getAllUsers(filters);
            setUsers(response.data.data.users);
            setPagination(response.data.data.pagination);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            try {
                await adminService.deleteUser(userId);
                alert('Xóa người dùng thành công!');
                fetchUsers(); // Tải lại danh sách
            } catch (err) {
                alert('Xóa thất bại: ' + (err.response?.data?.message || err.message));
            }
        }
    };
    
    // Bạn có thể mở Modal Form từ đây
    const handleEdit = (user) => alert(`Mở form sửa cho user: ${user.name}`);

    return (
        <div className="admin-page-container">
            <header className="admin-page-header">
                <h1>Quản lý người dùng</h1>
                <p>Tổng số: {pagination.total_users || 0} tài khoản</p>
            </header>

            <div className="filters-container">
                <input
                    type="text"
                    name="search"
                    placeholder="Tìm theo tên hoặc email..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="filter-search"
                />
                <select name="role" value={filters.role} onChange={handleFilterChange} className="filter-select">
                    <option value="">Tất cả vai trò</option>
                    <option value="Admin">Admin</option>
                    <option value="ServiceProvider">Service Provider</option>
                    <option value="Traveler">Traveler</option>
                </select>
                <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                </select>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="table-loading">Đang tải...</td></tr>
                        ) : users.map(user => (
                            <tr key={user._id}>
                                <td><strong>{user.name}</strong></td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`badge role-${user.role?.role_name?.toLowerCase()}`}>
                                        {user.role?.role_name}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge status-${user.status}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <button onClick={() => handleEdit(user)} className="btn-edit">Sửa</button>
                                    <button onClick={() => handleDelete(user._id)} className="btn-delete">Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination Controls có thể thêm ở đây */}
        </div>
    );
};

export default UserListPage;