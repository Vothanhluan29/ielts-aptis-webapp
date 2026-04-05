import React from "react";
import { Link } from "react-router-dom";
import {
  DashboardOutlined,
  BookOutlined,
  CustomerServiceOutlined,
  EditOutlined,
  AudioOutlined,
  UserOutlined,
  LeftOutlined,
  RightOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  FontSizeOutlined
} from "@ant-design/icons";

// Nhúng chung Custom Hook dùng cho cả IELTS và Aptis
import { useSidebar } from "../../../hooks/MainLayout/useSidebar";

/* ================= MENU STRUCTURE ================= */
const SIDEBAR_GROUPS = [
  {
    title: "Main Menu",
    items: [
      { to: "/aptis/dashboard", label: "Dashboard", icon: DashboardOutlined }
    ]
  },
  {
    title: "Exams",
    items: [
      { to: "/aptis/exam", label: "Full Mock Test", icon: AppstoreOutlined }
    ]
  },
  {
    title: "Practice Skills",
    items: [
      { to: "/aptis/grammar-vocab", label: "Grammar & Vocab", icon: FontSizeOutlined },
      { to: "/aptis/listening", label: "Listening", icon: CustomerServiceOutlined },
      { to: "/aptis/reading", label: "Reading", icon: BookOutlined },
      { to: "/aptis/writing", label: "Writing", icon: EditOutlined },
      { to: "/aptis/speaking", label: "Speaking", icon: AudioOutlined }
    ]
  },
  {
    title: "Settings",
    items: [
      { to: "/aptis/profile", label: "Profile", icon: UserOutlined }
    ]
  }
];

/* ================= MAIN SIDEBAR ================= */
const AptisSidebar = ({
  sidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  pathname,
  handleLogout
}) => {
  // 🔥 Rút logic từ Hook dùng chung
  const { isActive } = useSidebar({ pathname });

  const sidebarWidth = sidebarCollapsed ? "w-20" : "w-64";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-linear-to-b from-emerald-200 via-teal-200 to-sky-200 text-slate-800 flex flex-col transition-all duration-300 shadow-xl ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:relative`}
    >

      {/* LOGO */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-white/40 shrink-0">
        {!sidebarCollapsed && (
          <h1 className="text-xl font-black tracking-wide text-teal-800 m-0">
            APTIS PRO
          </h1>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded-lg bg-white/30 hover:bg-white/60 transition text-teal-900 "
        >
          {sidebarCollapsed ? <RightOutlined /> : <LeftOutlined />}
        </button>
      </div>

      {/* NAVIGATION (flex-1 đẩy Footer xuống đáy) */}
      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto custom-scrollbar">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.title}>
            
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-[11px] font-bold uppercase text-teal-800/70 tracking-widest m-0">
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

      {/* FOOTER & LOGOUT (Ghim ở đáy với nền nhẹ phân tách) */}
      <div className="shrink-0 p-4 border-t border-white/40 bg-white/20 mt-auto">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full rounded-xl transition-colors ${
            sidebarCollapsed ? "justify-center h-12" : "px-4 py-2.5"
          } text-teal-900 hover:text-red-600 hover:bg-red-50 bg-white/40 border border-white/30 shadow-sm`}
        >
          <LogoutOutlined style={{ fontSize: 18 }} />
          {!sidebarCollapsed && (
            <span className="text-[15px] font-semibold">Sign Out</span>
          )}
        </button>
      </div>

    </aside>
  );
};

/* ================= SIDEBAR LINK ================= */
const SidebarLink = ({ to, label, icon, active, collapsed }) => {
  const baseStyle = "flex items-center gap-3 rounded-xl font-semibold transition-all relative overflow-hidden group";
  const sizeStyle = collapsed ? "justify-center h-11 w-11 mx-auto" : "px-3 py-2.5";
  
  const activeStyle = "bg-white text-teal-700 shadow-sm";
  const inactiveStyle = "text-teal-900 hover:bg-white/40 hover:text-teal-800";

  return (
    <Link
      to={to}
      title={collapsed ? label : ""}
      className={`${baseStyle} ${sizeStyle} ${active ? activeStyle : inactiveStyle}`}
    >
      {icon && React.createElement(icon, { 
        className: `text-lg transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`
      })}

      {!collapsed && (
        <span className="text-[15px] tracking-wide whitespace-nowrap">
          {label}
        </span>
      )}

      {/* Active Indicator */}
      {collapsed && active && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-teal-600 rounded-l-full" />
      )}
    </Link>
  );
};

export default AptisSidebar;