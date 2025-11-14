import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "./Admin.css";

const AdminLayout = () => {
  return (
    <div className="dashboard-container">
      <AdminSidebar />
      <main className="dashboard-main">
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;