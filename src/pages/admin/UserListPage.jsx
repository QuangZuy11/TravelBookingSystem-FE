import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import adminService from "../../services/adminService";
import toast from "react-hot-toast";

import UserEditModal from "../../pages/admin/UserEditModal";
import UserBanModal from "../../pages/admin/UserBanModal";
import UserPasswordModal from "../../pages/admin/UserPasswordModal";
import "./Admin.css";

const UserListPage = () => {
  const [randomSeed, setRandomSeed] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: "",
    status: "",
    search: "",
    sort: "random", // Mặc định là 'random'
    seed: null,
  });

  // State để quản lý các modal
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Hàm fetch dữ liệu
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers(filters);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error("Không thể tải danh sách người dùng.");
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Debounce search input to avoid excessive API calls
    const handler = setTimeout(() => {
      fetchUsers();
    }, 500); // Chờ 500ms sau khi người dùng ngừng gõ
    return () => clearTimeout(handler);
  }, [filters, refreshTrigger]);
  useEffect(() => {
    const initialSeed = Date.now();
    setRandomSeed(initialSeed);
    setFilters((prev) => ({ ...prev, seed: initialSeed }));
  }, []); // Mảng rỗng đảm bảo nó chỉ chạy 1 lần

  // ---- Handlers cho các hành động ----
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };
  const handlePrevPage = () => {
    if (pagination.has_prev) {
      setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.has_next) {
      setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const openBanModal = (user) => {
    setSelectedUser(user);
    setIsBanModalOpen(true);
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const openDeleteConfirm = (user) => {
    setSelectedUser(user);
    setIsDeleteConfirmOpen(true);
  };

  // Hàm xử lý submit từ các modal
  const handleSaveUser = async (userData) => {
    try {
      if (selectedUser) {
        // Edit mode
        await adminService.updateUser(selectedUser._id, userData);
        toast.success("Cập nhật người dùng thành công!");
      } else {
        // Create mode
        await adminService.createUser(userData);
        toast.success("Tạo người dùng thành công!");
      }
      setIsEditModalOpen(false);
      setRefreshTrigger((t) => t + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const handleBanUser = async (action, reason) => {
    try {
      await adminService.banOrUnbanUser(selectedUser._id, action, reason);
      toast.success(`Đã ${action} người dùng thành công!`);
      setIsBanModalOpen(false);
      setRefreshTrigger((t) => t + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const handleChangePassword = async (newPassword) => {
    try {
      await adminService.changeUserPassword(selectedUser._id, newPassword);
      toast.success("Đổi mật khẩu thành công!");
      setIsPasswordModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await adminService.deleteUser(selectedUser._id);
      toast.success("Xóa người dùng thành công!");
      setIsDeleteConfirmOpen(false);
      setSelectedUser(null); // Reset selected user
      setRefreshTrigger((t) => t + 1); // Tải lại dữ liệu
    } catch (err) {
      toast.error(err.response?.data?.message || "Xóa thất bại!");
    }
  };

  return (
    <>
      <div className="admin-page-container">
        <header className="admin-page-header">
          <div className="header-left">
            <h1>Quản lý người dùng</h1>
            <p>Tổng số: {pagination.total_users || 0} tài khoản</p>
          </div>
          <div className="header-right">
            <button onClick={() => openEditModal(null)} className="btn-primary">
              + Thêm người dùng
            </button>
          </div>
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
          <select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Tất cả vai trò</option>
            <option value="Admin">Admin</option>
            <option value="ServiceProvider">Service Provider</option>
            <option value="Traveler">Traveler</option>
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Active</option>
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
            {/* ================================================= */}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="table-loading">
                    Đang tải...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                // Thêm cả trường hợp không có dữ liệu
                <tr>
                  <td colSpan="6" className="table-no-data">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`badge role-${user.role?.role_name?.toLowerCase()}`}
                      >
                        {user.role?.role_name || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge status-${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      {new Date(
                        user.createdAt || user.created_at
                      ).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => openEditModal(user)}
                        className="btn-action btn-edit"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => openPasswordModal(user)}
                        className="btn-action btn-password"
                      >
                        Đổi MK
                      </button>
                      <button
                        onClick={() => openBanModal(user)}
                        className="btn-action btn-ban"
                      >
                        Ban/Unban
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(user)}
                        className="btn-action btn-delete"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination.total_users > 0 && (
          <div className="pagination-container">
            <button
              onClick={handlePrevPage}
              disabled={!pagination.has_prev || loading}
              className="pagination-button"
            >
              ← Previous
            </button>
            <span className="pagination-info">
              Page {pagination.current_page} of {pagination.total_pages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!pagination.has_next || loading}
              className="pagination-button"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Các Modal sẽ được render ở đây */}
      {isEditModalOpen && (
        <UserEditModal
          user={selectedUser}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveUser}
        />
      )}
      {isBanModalOpen && (
        <UserBanModal
          user={selectedUser}
          onClose={() => setIsBanModalOpen(false)}
          onConfirm={handleBanUser}
        />
      )}
      {isPasswordModalOpen && (
        <UserPasswordModal
          user={selectedUser}
          onClose={() => setIsPasswordModalOpen(false)}
          onSave={handleChangePassword}
        />
      )}
      {isDeleteConfirmOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsDeleteConfirmOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Xác nhận Xóa</h2>
            <p className="modal-description">
              Bạn có chắc chắn muốn xóa người dùng{" "}
              <strong>{selectedUser?.name}</strong>? Hành động này không thể
              hoàn tác.
            </p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Hủy
              </button>
              <button className="btn-danger" onClick={handleDeleteUser}>
                Xác nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserListPage;
