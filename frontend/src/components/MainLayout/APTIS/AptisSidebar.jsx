import React from "react";
import { Link } from "react-router-dom";
import {
  DashboardOutlined,
  BookOutlined,
  CustomerServiceOutlined,
  EditOutlined,
  AudioOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  ReadOutlined
} from "@ant-design/icons";

// Nhúng Custom Hook
import { useSidebar } from "../../../hooks/MainLayout/useSidebar";

/* =========================
   MENU CONFIG
========================= */
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
      { to: "/aptis/exam", label: "Full Tests", icon: AppstoreOutlined }
    ]
  },
  {
    title: "Practice Skills",
    items: [
      { to: "/aptis/grammar-vocab", label: "Grammar & Vocab", icon: ReadOutlined },
      { to: "/aptis/listening", label: "Listening", icon: CustomerServiceOutlined },
      { to: "/aptis/reading", label: "Reading", icon: BookOutlined },
      { to: "/aptis/writing", label: "Writing", icon: EditOutlined },
      { to: "/aptis/speaking", label: "Speaking", icon: AudioOutlined }
    ]
  },
];

/* =========================
   MAIN SIDEBAR
========================= */
const AptisSidebar = ({
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
      className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-white border-r border-slate-100 flex flex-col transition-all duration-300 shadow-sm ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:relative`}
    >

      {/* LOGO */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-slate-100 shrink-0">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="w-8 h-8 object-contain rounded-md shadow-sm" />
            <span className="text-orange-600 font-black text-2xl tracking-tight">APTIS</span>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition text-slate-500 hover:text-slate-700"
        >
          {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {/* NAVIGATION (flex-1 sẽ đẩy Footer xuống đáy, space-y-6 dàn đều các nhóm) */}
      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto custom-scrollbar">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.title}>
            
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-[11px] font-bold uppercase text-slate-500 tracking-widest m-0">
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

      {/* FOOTER & LOGOUT (Được ghim ở đáy, có màu nền nhẹ và viền để phân tách) */}
      <div className="shrink-0 p-4 border-t border-slate-100 bg-white mt-auto">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full rounded-xl transition-colors ${
            sidebarCollapsed ? "justify-center h-12" : "px-4 py-2.5"
          } text-slate-600 hover:text-red-600 hover:bg-red-50 bg-white border border-slate-100 shadow-sm`}
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

/* =========================
   SIDEBAR LINK
========================= */
const SidebarLink = ({ to, label, icon, active, collapsed }) => {
  const baseStyle = "flex items-center gap-3 rounded-xl font-semibold transition-all relative overflow-hidden group";
  const sizeStyle = collapsed ? "justify-center h-11 w-11 mx-auto" : "px-3 py-3";
  
  const activeStyle = "bg-orange-600 text-white shadow-md";
  const inactiveStyle = "text-slate-500 hover:bg-slate-50 hover:text-slate-700";

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
        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-l-full" />
      )}
    </Link>
  );
};

export default AptisSidebar;