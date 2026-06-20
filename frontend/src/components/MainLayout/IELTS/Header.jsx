import React, { useState } from "react";
import {
  Menu,
  User,
  LogOut,
  PenTool,
  Mic2,
  Zap,
  GraduationCap,
  ChevronDown,
  Bell
} from "lucide-react";
import { Link } from "react-router-dom";
import useUserUsage from "../../../hooks/MainLayout/useUserUsage";

const QuotaCard = ({ icon, title, value, color }) => {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 border-blue-100/50",
    pink: "text-pink-600 bg-pink-50 border-pink-100/50",
    purple: "text-purple-600 bg-purple-50 border-purple-100/50",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100/50"
  };

  return (
    <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl border ${colorMap[color]} shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:scale-105 cursor-default`}>
      <div className="p-1.5 bg-white rounded-xl shadow-sm">
        {icon && React.createElement(icon, { size: 14, strokeWidth: 2.5 })}
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-[9px] uppercase font-extrabold tracking-widest opacity-80 leading-none mb-0.5">{title}</span>
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold leading-none">{value}</span>
        </div>
      </div>
    </div>
  );
};

const Header = ({
  pageTitle,
  sidebarOpen,
  setSidebarOpen,
  profileOpen,
  setProfileOpen,
  profileRef,
  user,
  loadingUser,
  handleLogout
}) => {
  const { usage } = useUserUsage();

  return (
    <header className="h-[76px] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
      
      {/* LEFT AREA: MOBILE MENU, TITLE & QUOTAS */}
      <div className="flex items-center gap-4 md:gap-8">
        {/* MOBILE MENU */}
        <button
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={22} />
        </button>

        {/* PAGE TITLE */}
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight m-0">
          {pageTitle}
        </h1>

        {/* QUOTAS */}
        {!loadingUser && (
          <div className="hidden lg:flex items-center gap-3 border-l-2 border-slate-100 pl-8 ml-2">
            <QuotaCard
              icon={GraduationCap}
              title="Mock Exam"
              value={usage ? `${usage.exam_used}/${usage.exam_limit}` : "--/--"}
              color="indigo"
            />
            <QuotaCard
              icon={PenTool}
              title="Writing"
              value={usage ? `${usage.writing_used}/${usage.writing_limit}` : "--/--"}
              color="pink"
            />
            <QuotaCard
              icon={Mic2}
              title="Speaking"
              value={usage ? `${usage.speaking_used}/${usage.speaking_limit}` : "--/--"}
              color="purple"
            />
          </div>
        )}
      </div>

      {/* RIGHT AREA: NOTIFICATIONS & PROFILE */}
      <div className="flex items-center gap-4 md:gap-6 relative" ref={profileRef}>
        
        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

        {/* PROFILE INFO */}
        <div className="hidden sm:block text-right">
          <p className="text-[13px] font-bold text-slate-800 leading-tight">
            {user?.full_name || "IELTS Student"}
          </p>
          <p className="text-[11px] text-blue-600 font-extrabold uppercase tracking-wider mt-0.5">
            Student
          </p>
        </div>

        {/* AVATAR */}
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 overflow-hidden ring-2 ring-white">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              user?.full_name?.charAt(0).toUpperCase() || "U"
            )}
          </div>
          <ChevronDown size={14} strokeWidth={3} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* DROPDOWN */}
        {profileOpen && (
          <div className="absolute right-0 top-[calc(100%+8px)] w-60 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user?.full_name || "Student User"}
              </p>
              <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                {user?.email || "No email provided"}
              </p>
            </div>
            
            <div className="p-2 space-y-1">
              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <div className="p-1.5 bg-white rounded-lg shadow-sm text-blue-500"><User size={16} /></div>
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition-colors text-left"
              >
                <div className="p-1.5 bg-white rounded-lg shadow-sm text-red-500"><LogOut size={16} /></div>
                Sign out
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};

export default Header;