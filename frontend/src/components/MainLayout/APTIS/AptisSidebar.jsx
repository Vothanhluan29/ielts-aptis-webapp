import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookMarked,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  ClipboardList,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useSidebar } from "../../../hooks/MainLayout/useSidebar";

/* ================= MENU STRUCTURE ================= */
const SIDEBAR_GROUPS = [
  {
    title: "Main Menu",
    items: [
      { to: "/aptis/dashboard", label: "Dashboard", icon: LayoutDashboard }
    ]
  },
  {
    title: "Exams",
    items: [
      { to: "/aptis/exam", label: "Full Mock Test", icon: ClipboardList }
    ]
  },
  {
    title: "Practice Skills",
    items: [
      { to: "/aptis/grammar-vocab", label: "Grammar & Vocab", icon: BookMarked },
      { to: "/aptis/listening",    label: "Listening",        icon: Headphones  },
      { to: "/aptis/reading",      label: "Reading",          icon: BookOpen    },
      { to: "/aptis/writing",      label: "Writing",          icon: PenTool     },
      { to: "/aptis/speaking",     label: "Speaking",         icon: Mic         }
    ]
  },
  {
    title: "Account",
    items: [
      { to: "/aptis/profile", label: "Profile", icon: User }
    ]
  }
];

/* ================= SIDEBAR WIDTHS (CSS variables - no reflow) ================= */
const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

/* ================= MAIN SIDEBAR ================= */
const AptisSidebar = ({
  sidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  pathname,
  handleLogout
}) => {
  const { isActive } = useSidebar({ pathname });

  const width = sidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <aside
      style={{
        width: width,
        minWidth: width,
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "width"
      }}
      className={`
        fixed inset-y-0 left-0 z-50 flex flex-col
        bg-white border-r border-slate-100
        shadow-[2px_0_12px_rgba(99,102,241,0.06)]
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:relative md:flex
        overflow-hidden
      `}
    >
      {/* ===== LOGO ===== */}
      <div className="h-[64px] flex items-center shrink-0 relative border-b border-slate-100">
        <div
          className="flex items-center gap-2 absolute whitespace-nowrap"
          style={{
            left: sidebarCollapsed ? '50%' : '16px',
            transform: sidebarCollapsed ? 'translateX(-50%)' : 'none',
            transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-[11px] font-black tracking-tight">AP</span>
          </div>
          <span
            className="font-black text-[15px] text-indigo-700 tracking-wide overflow-hidden"
            style={{
              opacity: sidebarCollapsed ? 0 : 1,
              width: sidebarCollapsed ? 0 : '80px',
              transition: "opacity 0.2s, width 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            APTIS PRO
          </span>
        </div>

        {/* Toggle button — only visible on desktop */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`
            hidden md:flex items-center justify-center
            w-7 h-7 rounded-full bg-slate-50 border border-slate-200
            text-slate-400 hover:text-indigo-600 hover:border-indigo-300
            hover:bg-indigo-50 transition-all duration-200 shrink-0
            absolute right-3 z-10
          `}
          title={sidebarCollapsed ? "Expand" : "Collapse"}
        >
          {sidebarCollapsed
            ? <ChevronRight size={13} strokeWidth={2.5} />
            : <ChevronLeft  size={13} strokeWidth={2.5} />
          }
        </button>
      </div>

      {/* ===== NAVIGATION ===== */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-4 px-2">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.title} className="mb-5">
            {/* Group label */}
            {!sidebarCollapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-widest whitespace-nowrap m-0">
                {group.title}
              </p>
            )}
            {sidebarCollapsed && (
              <div className="mb-1.5 h-[1px] bg-slate-100 mx-2" />
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  Icon={item.icon}
                  active={isActive(item.to)}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ===== FOOTER ===== */}
      <div className="shrink-0 p-2 border-t border-slate-100">
        <button
          onClick={handleLogout}
          title={sidebarCollapsed ? "Sign Out" : ""}
          className={`
            flex items-center gap-3 w-full rounded-xl transition-all duration-200
            text-slate-500 hover:text-red-600 hover:bg-red-50
            ${sidebarCollapsed ? "justify-center h-11 w-11 mx-auto" : "px-3 py-2.5"}
          `}
        >
          <LogOut size={17} className="shrink-0" />
          {!sidebarCollapsed && (
            <span className="text-[14px] font-semibold whitespace-nowrap">Sign Out</span>
          )}
        </button>
      </div>
    </aside>
  );
};

/* ================= SIDEBAR LINK ================= */
const SidebarLink = ({ to, label, Icon, active, collapsed }) => {
  return (
    <Link
      to={to}
      title={collapsed ? label : ""}
      className={`
        flex items-center gap-3 rounded-xl font-medium transition-all duration-150 relative group
        ${collapsed ? "justify-center h-11 w-11 mx-auto" : "px-3 py-2.5"}
        ${active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }
      `}
    >
      {/* Active accent bar */}
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-500 rounded-r-full" />
      )}

      <Icon
        size={17}
        strokeWidth={active ? 2.5 : 2}
        className={`shrink-0 transition-colors duration-150 ${
          active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
        }`}
      />

      {!collapsed && (
        <span className="text-[14px] whitespace-nowrap">
          {label}
        </span>
      )}

      {/* Collapsed active dot */}
      {collapsed && active && (
        <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-l-full" />
      )}
    </Link>
  );
};

export default AptisSidebar;