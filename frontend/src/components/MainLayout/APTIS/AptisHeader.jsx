import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, User, LogOut, ChevronDown, Bell } from "lucide-react";

/* ================= PAGE TITLE MAP ================= */
const PAGE_TITLES = {
  '/aptis/dashboard':     'Dashboard',
  '/aptis/exam':          'Full Mock Test',
  '/aptis/grammar-vocab': 'Grammar & Vocabulary',
  '/aptis/listening':     'Listening Practice',
  '/aptis/reading':       'Reading Practice',
  '/aptis/writing':       'Writing Practice',
  '/aptis/speaking':      'Speaking Practice',
  '/aptis/profile':       'Account Settings',
};

const AptisHeader = ({
  sidebarOpen,
  setSidebarOpen,
  profileOpen,
  setProfileOpen,
  profileRef,
  user,
  handleLogout
}) => {
  const location = useLocation();

  const dynamicPageTitle = useMemo(() => {
    const exactMatch = PAGE_TITLES[location.pathname];
    if (exactMatch) return exactMatch;

    const partialKey = Object.keys(PAGE_TITLES).find(k => location.pathname.startsWith(k));
    return partialKey ? PAGE_TITLES[partialKey] : 'APTIS';
  }, [location.pathname]);

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header className="h-[76px] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
      {/* ===== LEFT: Mobile menu + Page title ===== */}
      <div className="flex items-center gap-4 md:gap-8">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-all duration-150"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={22} />
        </button>

        {/* Page title */}
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight m-0">
          {dynamicPageTitle}
        </h1>
      </div>

      {/* ===== RIGHT: Profile area ===== */}
      <div className="relative flex items-center gap-4 md:gap-6" ref={profileRef}>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:text-orange-600 transition-colors rounded-full hover:bg-orange-50">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

        {/* User info */}
        <div className="hidden sm:block text-right">
          <p className="text-[13px] font-bold text-slate-800 leading-tight m-0">
            {user?.full_name || "Aptis Student"}
          </p>
          <p className="text-[11px] text-orange-600 font-extrabold uppercase tracking-wider m-0 mt-0.5">
            Student
          </p>
        </div>

        {/* Avatar button */}
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-50 transition-colors outline-none"
        >
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/20 shrink-0 ring-2 ring-white bg-gradient-to-br from-orange-400 to-orange-600"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <ChevronDown
            size={14}
            strokeWidth={3}
            className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* ===== DROPDOWN ===== */}
        {profileOpen && (
          <div
            className="absolute right-0 top-[calc(100%+8px)] w-60 rounded-2xl overflow-hidden z-50 bg-white border border-slate-100 shadow-xl shadow-slate-200/50"
            style={{ animation: 'dropdownIn 0.2s ease-out' }}
          >
            {/* User info block */}
            <div className="p-4 bg-slate-50/50 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900 truncate m-0">
                {user?.full_name || "Student User"}
              </p>
              <p className="text-xs font-medium text-slate-500 truncate m-0 mt-0.5">
                {user?.email || "No email"}
              </p>
            </div>

            {/* Menu items */}
            <div className="p-2 space-y-1">
              <Link
                to="/aptis/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150"
              >
                <div className="p-1.5 bg-white rounded-lg shadow-sm text-orange-500"><User size={16} /></div>
                Profile Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition-colors duration-150 text-left"
              >
                <div className="p-1.5 bg-white rounded-lg shadow-sm text-red-500"><LogOut size={16} /></div>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </header>
  );
};

export default AptisHeader;