import React from "react";
import { NavLink } from "react-router-dom";
import "./Admin.css";

const items = [
  { key: "dashboard", label: "Tổng quan", to: "dashboard", icon: "📊" },
  { key: "users", label: "Người dùng", to: "users", icon: "👥" },
  { key: "providers", label: "Service Provider", to: "providers", icon: "🏨" },
  { key: "terms", label: "Điều khoản", to: "terms-policies", icon: "📜" },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar-hotel">
      <div className="admin-sidebar-hotel__header">Quản trị</div>
      <nav className="admin-sidebar-hotel__nav">
        {items.map((it) => (
          <NavLink
            key={it.key}
            to={it.to}
            end={it.key === "dashboard"}
            className={({ isActive }) =>
              "admin-sidebar-hotel__item" + (isActive ? " active" : "")
            }
          >
            <span className="icon">{it.icon}</span>
            <span className="txt">{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}