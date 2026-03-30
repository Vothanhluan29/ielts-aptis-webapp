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

/* =========================
   MENU CONFIG
========================= */

const SIDEBAR_GROUPS = [
  {
    title: "Main Menu",
    items: [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: DashboardOutlined
      }
    ]
  },
  {
    title: "Exams",
    items: [
      {
        to: "/exam",
        label: "Full Tests",
        icon: AppstoreOutlined
      }
    ]
  },
  {
    title: "Practice Skills",
    items: [
      {
        to: "/listening",
        label: "Listening",
        icon: CustomerServiceOutlined
      },
      {
        to: "/reading",
        label: "Reading",
        icon: BookOutlined
      },
      {
        to: "/writing",
        label: "Writing",
        icon: EditOutlined
      },
      {
        to: "/speaking",
        label: "Speaking",
        icon: AudioOutlined
      }
    ]
  },
  {
    title: "Settings",
    items: [
      {
        to: "/profile",
        label: "Profile",
        icon: UserOutlined
      }
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

      bg-linear-to-b
      from-blue-100
      via-sky-50
      to-white

      border-r border-slate-200
      flex flex-col
      transition-all duration-300
      shadow-lg

      ${sidebarOpen
        ? "translate-x-0"
        : "-translate-x-full"}

      md:translate-x-0
      md:relative
      `}
    >

      {/* LOGO */}

      <div
        className="
        h-20
        flex items-center justify-between
        px-5
        border-b border-slate-200
        "
      >

        {!sidebarCollapsed && (
          <h1
            className="
            text-xl
            font-black
            tracking-wide
            text-blue-700
            "
          >
            IELTS PRO
          </h1>
        )}

        <button
          onClick={() =>
            setSidebarCollapsed(
              !sidebarCollapsed
            )
          }
          className="
          p-2
          rounded-lg
          bg-white
          border border-slate-200
          hover:bg-sky-100
          transition
          "
        >

          {sidebarCollapsed
            ? <MenuUnfoldOutlined />
            : <MenuFoldOutlined />
          }

        </button>

      </div>

      {/* NAVIGATION */}

      <nav
        className="
        flex-1
        p-4
        space-y-6
        overflow-y-auto
        "
      >

        {SIDEBAR_GROUPS.map(
          (group) => (
            <div key={group.title}>

              {!sidebarCollapsed && (
                <p
                  className="
                  px-3
                  mb-3
                  text-xs
                  font-bold
                  uppercase
                  text-slate-500
                  tracking-widest
                  "
                >
                  {group.title}
                </p>
              )}

              <div className="space-y-1">

                {group.items.map(
                  (item) => (
                    <SidebarLink
                      key={item.to}
                      to={item.to}
                      label={item.label}
                      icon={item.icon}
                      active={
                        isActive(item.to)
                      }
                      collapsed={
                        sidebarCollapsed
                      }
                    />
                  )
                )}

              </div>

            </div>
          )
        )}

      </nav>

      {/* LOGOUT */}

      <div
        className="
        p-4
        border-t border-slate-200
        "
      >

        <button
          onClick={handleLogout}
          className={`
          flex items-center gap-3
          w-full
          rounded-lg
          transition

          ${sidebarCollapsed
            ? "justify-center h-12"
            : "px-4 py-3"}

          text-slate-600
          hover:text-red-600
          hover:bg-red-100
          `}
        >

          <LogoutOutlined />

          {!sidebarCollapsed && (
            <span
              className="
              text-sm
              font-semibold
              "
            >
              Sign Out
            </span>
          )}

        </button>

      </div>

    </aside>
  );
};

/* =========================
   SIDEBAR LINK
========================= */

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
    "bg-blue-500 text-white shadow";

  const inactiveStyle =
    "text-slate-700 hover:bg-sky-200 hover:text-blue-700";

  return (
    <Link
      to={to}
      title={collapsed ? label : ""}
      className={`
        ${base}
        ${size}
        ${active
          ? activeStyle
          : inactiveStyle}
      `}
    >

      {icon &&
        React.createElement(
          icon,
          {
            style: {
              fontSize: 18
            }
          }
        )
      }

      {!collapsed && (
        <span className="text-sm">
          {label}
        </span>
      )}

      {collapsed && active && (
        <span
          className="
          absolute
          right-0
          top-1/2
          -translate-y-1/2
          w-1.5
          h-8
          bg-blue-500
          rounded-l-full
          "
        />
      )}

    </Link>
  );
};

export default Sidebar;