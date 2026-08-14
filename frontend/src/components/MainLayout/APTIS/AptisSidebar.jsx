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
  ReadOutlined,
  MessageOutlined,
  BulbOutlined
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
  {
    title: "Support",
    items: [
      { to: "/aptis/tips", label: "Exam Tips & Guide", icon: BulbOutlined },
      { to: "/feedback", label: "Feedback & Help", icon: MessageOutlined }
    ]
  }
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
      className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-[#F8FAFC] text-slate-800 flex flex-col transition-all duration-300 shadow-xl shadow-slate-200/50 border-r border-slate-200 md:rounded-r-[2rem] ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:relative`}
    >
      {/* LOGO AREA */}
      <div className="h-20 flex items-center justify-between px-5 shrink-0 border-b border-slate-200">
        {!sidebarCollapsed && (
          <Link to="/aptis/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
              <img src="/logo.jpg" alt="APTIS Logo" className="w-6 h-6 object-contain rounded" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-800 font-black text-xl tracking-tight leading-none">
                APTIS
              </span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase mt-0.5">
                Learning Hub
              </span>
            </div>
          </Link>
        )}

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 transition-all ${
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
              <p className="px-3 mb-2 text-[11px] font-black uppercase text-slate-400 tracking-wider m-0">
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
      <div className="shrink-0 p-4 mt-auto border-t border-slate-200">
        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full rounded-2xl transition-all ${
            sidebarCollapsed ? "justify-center h-11" : "px-4 py-2.5"
          } text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 shadow-sm`}
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

  // Active style: Vibrant navy background with white text
  const activeStyle =
    "!bg-[#1E3A8A] !text-white shadow-md shadow-[#1E3A8A]/20 font-extrabold scale-[1.02] transform";
  const inactiveStyle =
    "!text-slate-600 hover:bg-slate-200/50 hover:!text-slate-900 font-medium";

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
            active ? "scale-110 !text-white" : "group-hover:scale-110 text-slate-400"
          }`
        })}

      {!collapsed && (
        <span className="text-[14px] tracking-wide whitespace-nowrap">
          {label}
        </span>
      )}

      {/* Active Indicator bar */}
      {collapsed && active && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-l-full" />
      )}
    </Link>
  );
};

export default AptisSidebar;