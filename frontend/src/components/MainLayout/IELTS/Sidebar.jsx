import React from "react";
import { Link } from "react-router-dom";
import {
  DashboardOutlined,
  BookOutlined,
  CustomerServiceOutlined,
  EditOutlined,
  AudioOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  PlusOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";

// Nhúng Custom Hook
import { useSidebar } from "../../../hooks/MainLayout/useSidebar";

/* =========================
   MENU CONFIG (PRESERVED EXACTLY)
========================= */
const SIDEBAR_GROUPS = [
  {
    title: "Main Menu",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: DashboardOutlined }
    ]
  },
  {
    title: "Exams",
    items: [
      { to: "/exam", label: "Full Tests", icon: AppstoreOutlined }
    ]
  },
  {
    title: "Practice Skills",
    items: [
      { to: "/listening", label: "Listening", icon: CustomerServiceOutlined },
      { to: "/reading", label: "Reading", icon: BookOutlined },
      { to: "/writing", label: "Writing", icon: EditOutlined },
      { to: "/speaking", label: "Speaking", icon: AudioOutlined }
    ]
  }
];

/* =========================
   MAIN SIDEBAR
========================= */
const Sidebar = ({
  sidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  pathname,
  handleLogout
}) => {
  const { isActive } = useSidebar({ pathname });
  const sidebarWidth = sidebarCollapsed ? "w-20" : "w-64";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-gradient-to-b from-[#1859f5] via-[#1651e5] to-[#1143c7] text-white flex flex-col transition-all duration-300 shadow-xl shadow-blue-900/20 md:rounded-r-[2rem] ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:relative`}
    >
      {/* LOGO AREA */}
      <div className="h-20 flex items-center justify-between px-5 shrink-0 border-b border-white/10">
        {!sidebarCollapsed && (
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-blue-900/30 group-hover:scale-105 transition-transform">
              <img src="/logo.jpg" alt="IELTS Logo" className="w-6 h-6 object-contain rounded" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-xl tracking-tight leading-none">
                IELTS
              </span>
              <span className="text-[10px] text-blue-200/80 font-semibold tracking-widest uppercase mt-0.5">
                Prep Academy
              </span>
            </div>
          </Link>
        )}

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all ${
            sidebarCollapsed ? "mx-auto" : ""
          }`}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-6 space-y-5 overflow-y-auto custom-scrollbar">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.title}>
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-[11px] font-black uppercase text-blue-200/60 tracking-wider m-0">
                {group.title}
              </p>
            )}

            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  active={isActive(item.to)}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* BOTTOM FOOTER / LOGOUT */}
      <div className="shrink-0 p-4 mt-auto border-t border-white/10">
        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full rounded-2xl transition-all ${
            sidebarCollapsed ? "justify-center h-11" : "px-4 py-2.5"
          } text-blue-100 hover:text-white hover:bg-white/15 border border-white/10 shadow-sm`}
        >
          <LogoutOutlined style={{ fontSize: 16 }} />
          {!sidebarCollapsed && (
            <span className="text-[14px] font-bold">Sign Out</span>
          )}
        </button>
      </div>
    </aside>
  );
};

/* =========================
   SIDEBAR LINK
========================= */
const SidebarLink = ({ to, label, icon, active, collapsed }) => {
  const baseStyle =
    "flex items-center gap-3 rounded-2xl font-bold transition-all duration-200 relative overflow-hidden group";
  const sizeStyle = collapsed
    ? "justify-center h-11 w-11 mx-auto"
    : "px-3.5 py-2.5";

  const activeStyle =
    "bg-white/20 text-white shadow-sm backdrop-blur-md border border-white/20 font-extrabold";
  const inactiveStyle =
    "text-blue-100/80 hover:bg-white/10 hover:text-white font-medium";

  return (
    <Link
      to={to}
      title={collapsed ? label : ""}
      className={`${baseStyle} ${sizeStyle} ${
        active ? activeStyle : inactiveStyle
      }`}
    >
      {icon &&
        React.createElement(icon, {
          className: `text-lg transition-transform duration-300 ${
            active ? "scale-110 text-white" : "group-hover:scale-110 text-blue-200"
          }`
        })}

      {!collapsed && (
        <span className="text-[14px] tracking-wide whitespace-nowrap">
          {label}
        </span>
      )}

      {/* Active Indicator */}
      {collapsed && active && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-l-full" />
      )}
    </Link>
  );
};

export default Sidebar;