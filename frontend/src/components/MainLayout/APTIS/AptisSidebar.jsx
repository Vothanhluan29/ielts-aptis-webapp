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

/* ================= MENU STRUCTURE ================= */

const SIDEBAR_GROUPS = [
  {
    title: "Main Menu",
    items: [
      {
        to: "/aptis/dashboard",
        label: "Dashboard",
        icon: DashboardOutlined
      }
    ]
  },
  {
    title: "Exams",
    items: [
      {
        to: "/aptis/exam",
        label: "Full Mock Test",
        icon: AppstoreOutlined
      }
    ]
  },
  {
    title: "Practice Skills",
    items: [
      {
        to: "/aptis/grammar-vocab",
        label: "Grammar & Vocab",
        icon: FontSizeOutlined
      },
      {
        to: "/aptis/listening",
        label: "Listening",
        icon: CustomerServiceOutlined
      },
      {
        to: "/aptis/reading",
        label: "Reading",
        icon: BookOutlined
      },
      {
        to: "/aptis/writing",
        label: "Writing",
        icon: EditOutlined
      },
      {
        to: "/aptis/speaking",
        label: "Speaking",
        icon: AudioOutlined
      }
    ]
  },
  {
    title: "Settings",
    items: [
      {
        to: "/aptis/profile",
        label: "Profile",
        icon: UserOutlined
      }
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

  const sidebarWidth =
    sidebarCollapsed
      ? "w-20"
      : "w-72";

  const isActive = (path) =>
    pathname.startsWith(path);

  return (
    <aside
      className={`
      fixed inset-y-0 left-0 z-50 ${sidebarWidth}
      bg-linear-to-b from-emerald-200 via-teal-200 to-sky-200
      text-slate-800
      flex flex-col
      transition-all duration-300
      shadow-xl
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      md:translate-x-0 md:relative
      `}
    >

      {/* LOGO */}

      <div className="h-20 flex items-center justify-between px-5 border-b border-white/40">

        {!sidebarCollapsed && (
          <h1 className="text-xl font-black tracking-wide text-teal-700">
            APTIS PRO
          </h1>
        )}

        <button
          onClick={() =>
            setSidebarCollapsed(!sidebarCollapsed)
          }
          className="p-2 rounded-lg bg-white/40 hover:bg-white/60 transition"
        >
          {sidebarCollapsed
            ? <RightOutlined />
            : <LeftOutlined />
          }
        </button>

      </div>

      {/* NAVIGATION */}

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">

        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.title}>

            {!sidebarCollapsed && (
              <p className="px-3 mb-3 text-xs font-bold uppercase text-teal-600 tracking-widest">
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

      {/* LOGOUT */}

      <div className="p-4 border-t border-white/40">

        <button
          onClick={handleLogout}
          className={`
          flex items-center gap-3 w-full rounded-lg transition
          ${sidebarCollapsed
            ? "justify-center h-12"
            : "px-4 py-3"}
          text-slate-600 hover:text-red-600 hover:bg-red-100
          `}
        >

          <LogoutOutlined style={{ fontSize: 18 }} />

          {!sidebarCollapsed && (
            <span className="font-semibold text-sm">
              Sign Out
            </span>
          )}

        </button>

      </div>

    </aside>
  );
};

/* ================= SIDEBAR LINK ================= */

const SidebarLink = ({
  to,
  label,
  icon,
  active,
  collapsed
}) => {

  const base =
    "flex items-center gap-3 rounded-lg font-semibold transition relative";

  const size =
    collapsed
      ? "justify-center h-12 w-12 mx-auto"
      : "px-4 py-3";

  const activeStyle =
    "bg-white text-teal-700 shadow";

  const inactiveStyle =
    "text-slate-700 hover:bg-white/50 hover:text-teal-700";

  return (
    <Link
      to={to}
      title={collapsed ? label : ""}
      className={`${base} ${size} ${active ? activeStyle : inactiveStyle}`}
    >

      {icon &&
        React.createElement(icon, {
          style: { fontSize: 18 }
        })
      }

      {!collapsed && (
        <span className="text-sm">
          {label}
        </span>
      )}

      {collapsed && active && (
        <span
          className="
          absolute right-0 top-1/2 -translate-y-1/2
          w-1.5 h-8 bg-teal-600 rounded-l-full
          "
        />
      )}

    </Link>
  );
};

export default AptisSidebar;