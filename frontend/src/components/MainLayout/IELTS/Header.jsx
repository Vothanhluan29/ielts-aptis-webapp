import React, { useState } from "react";
import {
  Menu,
  User,
  LogOut,
  PenTool,
  Mic2,
  GraduationCap,
  ChevronDown,
  Search,
  HelpCircle,
  Settings,
  ArrowRightLeft
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useUserUsage from "../../../hooks/MainLayout/useUserUsage";
import NotificationBell from "../../common/NotificationBell";

const QuotaCard = ({ icon, title, value, color }) => {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50/80 border-blue-100",
    pink: "text-pink-600 bg-pink-50/80 border-pink-100",
    purple: "text-purple-600 bg-purple-50/80 border-purple-100",
    indigo: "text-indigo-600 bg-indigo-50/80 border-indigo-100"
  };

  return (
    <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border ${colorMap[color]} shadow-xs transition-all hover:scale-105 cursor-default`}>
      <div className="p-1 bg-white rounded-xl shadow-xs">
        {icon && React.createElement(icon, { size: 13, strokeWidth: 2.5 })}
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-[9px] uppercase font-black tracking-widest opacity-80 leading-none mb-0.5">{title}</span>
        <div className="flex items-center gap-1">
          <span className="text-xs font-black leading-none">{value}</span>
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
  handleLogout,
  onSwitchMode
}) => {
  const { usage } = useUserUsage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/exam?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-[76px] bg-white/90 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-xs">
      
      {/* LEFT AREA: MOBILE MENU, TITLE & QUOTAS */}
      <div className="flex items-center gap-4 md:gap-6 shrink-0">
        {/* MOBILE MENU */}
        <button
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={22} />
        </button>

        {/* PAGE TITLE */}
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight m-0 hidden sm:block">
          {pageTitle}
        </h1>

        {/* QUOTAS (PRESERVED) */}
        {!loadingUser && (
          <div className="hidden xl:flex items-center gap-2.5 border-l-2 border-slate-100 pl-6 ml-2">
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

      {/* RIGHT AREA: UTILITY ICONS & PROFILE */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0 relative" ref={profileRef}>
        {/* Notification Bell */}
        <NotificationBell />

        <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

        {/* AVATAR & USER BUTTON */}
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2.5 p-1 pr-2 rounded-full hover:bg-slate-100/80 transition-colors outline-none group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 overflow-hidden ring-2 ring-white group-hover:scale-105 transition-transform shrink-0">
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
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-[13px] font-bold text-slate-800 leading-tight">
              {user?.full_name || "IELTS Student"}
            </span>
            <span className="text-[10px] text-blue-600 font-black uppercase tracking-wider">
              Student
            </span>
          </div>
          <ChevronDown size={14} strokeWidth={3} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* DROPDOWN */}
        {profileOpen && (
          <div className="absolute right-0 top-[calc(100%+8px)] w-60 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 bg-slate-50/70 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900 truncate m-0">
                {user?.full_name || "Student User"}
              </p>
              <p className="text-xs font-medium text-slate-500 truncate m-0 mt-0.5">
                {user?.email || "No email provided"}
              </p>
            </div>
            
            <div className="p-2 space-y-1">
              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <div className="p-1.5 bg-slate-100 rounded-lg text-blue-600"><User size={16} /></div>
                Profile Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition-colors text-left"
              >
                <div className="p-1.5 bg-white rounded-lg shadow-xs text-red-500"><LogOut size={16} /></div>
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