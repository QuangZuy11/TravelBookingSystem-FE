import React from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, Users, Building2, FileText } from "lucide-react";
import "./Admin.css";

const items = [
  {
    key: "dashboard",
    label: "Tổng quan",
    to: "dashboard",
    icon: BarChart3
  },
  {
    key: "users",
    label: "Người dùng",
    to: "users",
    icon: Users
  },
  {
    key: "providers",
    label: "Xét duyệt",
    to: "providers",
    icon: Building2
  },
  {
    key: "terms",
    label: "Điều khoản",
    to: "terms-policies",
    icon: FileText
  },
];

export default function AdminSidebar() {
  return (
    <aside className="dashboard-sidebar">
      <nav className="sidebar-nav">
        {items.map((it) => {
          const IconComponent = it.icon;
          return (
            <NavLink
              key={it.key}
              to={it.to}
              end={it.key === "dashboard"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <IconComponent className="nav-icon" size={20} strokeWidth={2} />
              <span className="nav-label">{it.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}