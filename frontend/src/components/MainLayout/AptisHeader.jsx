import React from "react";
import {
  Menu,
  User,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";

const AptisHeader = ({
  pageTitle,
  sidebarOpen,
  setSidebarOpen,
  profileOpen,
  setProfileOpen,
  profileRef,
  user,
  handleLogout
}) => {

  return (
    <header
      className="
      h-20
      bg-linear-to-r
      from-emerald-200
      via-teal-200
      to-sky-200
      border-b border-white/40
      flex items-center justify-between
      px-6
      sticky top-0 z-30
    "
    >
      {/* LEFT: Menu Button & Dynamic Page Title */}
      <div className="flex items-center gap-6">
        
        {/* MOBILE MENU BUTTON */}
        <button
          className="
          md:hidden
          p-2
          rounded-lg
          bg-white/40
          hover:bg-white/60
          transition
          "
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={20} className="text-slate-800" />
        </button>

        {/* DYNAMIC PAGE TITLE */}
        <h1 className="text-lg font-bold text-slate-800">
          {pageTitle || "Aptis Dashboard"}
        </h1>
      </div>

      {/* RIGHT: Profile Section */}
      <div
        className="flex items-center gap-4 relative"
        ref={profileRef}
      >
        {/* PROFILE INFO (Hidden on mobile) */}
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-slate-800">
            {user?.full_name || "Aptis Student"}
          </p>
          <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
            Student Account
          </p>
        </div>

        {/* AVATAR BUTTON */}
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="
          w-10 h-10
          rounded-full
          bg-indigo-500
          text-white
          flex items-center
          justify-center
          font-bold
          shadow-md
          hover:ring-4 hover:ring-indigo-200
          transition-all
          "
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            user?.full_name?.charAt(0).toUpperCase() || "U"
          )}
        </button>

        {/* PROFILE DROPDOWN */}
        {profileOpen && (
          <div
            className="
            absolute right-0 top-14
            w-64
            bg-white
            border border-slate-100
            rounded-2xl
            shadow-xl
            overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-200
            "
          >
            {/* Dropdown Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user?.full_name || "Anonymous User"}
              </p>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {user?.email || "No email provided"}
              </p>
            </div>

            {/* Dropdown Actions */}
            <div className="p-2 flex flex-col gap-1">
              <Link
                to="/aptis/profile"
                onClick={() => setProfileOpen(false)}
                className="
                flex items-center gap-3
                px-3 py-2.5
                text-sm font-medium text-slate-700
                rounded-xl
                hover:bg-indigo-50 hover:text-indigo-600
                transition-colors
                "
              >
                <User size={16} />
                Profile Settings
              </Link>

              <button
                onClick={handleLogout}
                className="
                w-full
                flex items-center gap-3
                px-3 py-2.5
                text-sm font-medium text-red-600
                rounded-xl
                hover:bg-red-50
                transition-colors
                text-left
                "
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AptisHeader;