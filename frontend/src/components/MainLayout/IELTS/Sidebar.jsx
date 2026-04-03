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
  AppstoreOutlined
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
  },
  {
    title: "Settings",
    items: [
      { to: "/profile", label: "Profile", icon: UserOutlined }
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
      className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-linear-to-b from-blue-100 via-sky-50 to-white border-r border-slate-200 flex flex-col transition-all duration-300 shadow-lg ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:relative`}
    >

      {/* LOGO */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-slate-200 shrink-0">
        {!sidebarCollapsed && (
          <h1 className="text-xl font-black tracking-wide text-blue-700 m-0">
            IELTS PRO
          </h1>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-sky-100 transition text-slate-600 mx-auto"
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
      <div className="shrink-0 p-4 border-t border-slate-200 bg-slate-50/50 mt-auto">
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
  const sizeStyle = collapsed ? "justify-center h-11 w-11 mx-auto" : "px-3 py-2.5";
  
  const activeStyle = "bg-blue-600 text-white shadow-sm";
  const inactiveStyle = "text-slate-600 hover:bg-sky-100 hover:text-blue-700";

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
        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-l-full" />
      )}
    </Link>
  );
};

export default Sidebar;