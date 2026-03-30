import React from "react";
import { Link } from "react-router-dom";

import {
  ChevronRight,
  ChevronLeft,
  LogOut,
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  UserCog,
  ClipboardCheck
} from "lucide-react";

const SideBar = ({ layoutProps }) => {

  const {
    isCollapsed,
    openSkills,
    toggleSidebar,
    toggleSkills,
    logout,
    isActive
  } = layoutProps;

  return (
    <aside
      className={`
        ${isCollapsed ? "w-20" : "w-64"}

        bg-linear-to-b
        from-slate-950
        via-indigo-950
        to-slate-950

        text-slate-200
        flex flex-col

        transition-all duration-300 ease-in-out

        border-r border-slate-800
        shadow-2xl
      `}
    >

      {/* LOGO */}

      <div
        className="
        h-20
        flex items-center justify-between
        px-5
        border-b border-slate-800
        "
      >

        {!isCollapsed && (

          <h1
            className="
            text-lg
            font-extrabold
            uppercase
            tracking-tight
            "
          >

            <span className="text-indigo-400">
              Admin
            </span>{" "}

            <span className="text-white">
              Panel
            </span>

          </h1>

        )}

        <button
          onClick={toggleSidebar}
          className="
          p-2
          rounded-lg
          bg-slate-800
          hover:bg-slate-700
          text-slate-400
          hover:text-white
          transition
          "
        >

          {isCollapsed
            ? <ChevronRight size={18} />
            : <ChevronLeft size={18} />
          }

        </button>

      </div>

      {/* NAVIGATION */}

      <nav
        className="
        flex-1
        p-4
        space-y-4
        overflow-y-auto
        "
      >

        {!isCollapsed && (
          <p className="
            text-[11px]
            font-bold
            text-slate-400
            uppercase
            ml-2
            tracking-widest
          ">
            Dashboard
          </p>
        )}

        <SidebarLink
          to="/admin/dashboard"
          label="Dashboard"
          icon={LayoutDashboard}
          isActive={isActive("/admin/dashboard")}
          isCollapsed={isCollapsed}
        />

        {!isCollapsed && (
          <p className="
            text-[11px]
            font-bold
            text-slate-400
            uppercase
            ml-2
            mt-4
            tracking-widest
          ">
            User Management
          </p>
        )}

        <SidebarLink
          to="/admin/users"
          label="Users"
          icon={Users}
          isActive={isActive("/admin/users")}
          isCollapsed={isCollapsed}
        />

        {!isCollapsed && (
          <p className="
            text-[11px]
            font-bold
            text-slate-400
            uppercase
            ml-2
            mt-4
            tracking-widest
          ">
            Grading & Review
          </p>
        )}

        <SidebarLink
          to="/admin/submissions"
          label="Submissions"
          icon={ClipboardCheck}
          isActive={isActive("/admin/submissions")}
          isCollapsed={isCollapsed}
        />

        {!isCollapsed && (
          <p className="
            text-[11px]
            font-bold
            text-slate-400
            uppercase
            ml-2
            mt-4
            tracking-widest
          ">
            Mock Exams
          </p>
        )}

        <SidebarLink
          to="/admin/full-tests"
          label="Full Tests"
          icon={FileText}
          isActive={isActive("/admin/full-tests")}
          isCollapsed={isCollapsed}
        />

        {/* SKILLS */}

        {!isCollapsed && (
          <p className="
            text-[11px]
            font-bold
            text-slate-400
            uppercase
            ml-2
            mt-4
            tracking-widest
          ">
            Skills Content
          </p>
        )}

        <button
          onClick={toggleSkills}
          className={`
            w-full
            flex items-center
            justify-between
            px-3.5
            py-3
            rounded-xl
            font-semibold
            transition

            ${
              openSkills
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }
          `}
        >

          <div className="
            flex items-center gap-3
          ">

            {React.createElement(
              BookOpen,
              { size: 20 }
            )}

            {!isCollapsed && (
              <span className="text-sm">
                Skills Library
              </span>
            )}

          </div>

          {!isCollapsed && (

            <ChevronRight
              size={16}
              className={`
                transition-transform
                ${
                  openSkills
                    ? "rotate-90 text-indigo-400"
                    : "opacity-40"
                }
              `}
            />

          )}

        </button>

        {!isCollapsed && openSkills && (

          <div className="
            ml-5
            mt-1
            space-y-1
            border-l border-slate-700
            pl-4
          ">

            {[
              "reading",
              "listening",
              "writing",
              "speaking"
            ].map(skill => (

              <Link
                key={skill}
                to={`/admin/skills/${skill}`}
                className={`
                  block
                  px-3
                  py-2
                  rounded-lg
                  text-sm
                  font-medium
                  transition

                  ${
                    isActive(`/admin/skills/${skill}`)
                      ? "text-white bg-indigo-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }
                `}
              >

                {skill.charAt(0).toUpperCase() +
                  skill.slice(1)}

              </Link>

            ))}

          </div>

        )}

        {!isCollapsed && (
          <p className="
            text-[11px]
            font-bold
            text-slate-400
            uppercase
            ml-2
            mt-4
            tracking-widest
          ">
            Account
          </p>
        )}

        <SidebarLink
          to="/admin/profile"
          label="Profile"
          icon={UserCog}
          isActive={isActive("/admin/profile")}
          isCollapsed={isCollapsed}
        />

      </nav>

      {/* LOGOUT */}

      <div
        className="
        p-4
        border-t border-slate-800
        "
      >

        <button
          onClick={logout}
          className="
            flex items-center gap-3
            w-full
            px-4 py-3
            rounded-xl

            text-slate-400
            hover:text-rose-400
            hover:bg-rose-500/10

            transition
          "
        >

          <LogOut size={18} />

          {!isCollapsed && (

            <span
              className="
              text-xs
              font-bold
              uppercase
              tracking-widest
              "
            >
              Log out
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
  isActive,
  isCollapsed
}) => (

  <Link
    to={to}
    className={`
      group
      flex items-center gap-3
      px-3.5 py-3
      rounded-xl
      font-semibold
      transition-all duration-200

      ${
        isActive
          ? "bg-indigo-600 text-white shadow-md"
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      }
    `}
  >

    {icon &&
      React.createElement(
        icon,
        {
          size: 20,
          className:
            "group-hover:scale-110 transition"
        }
      )
    }

    {!isCollapsed && (
      <span className="text-sm">
        {label}
      </span>
    )}

  </Link>

);

export default SideBar;