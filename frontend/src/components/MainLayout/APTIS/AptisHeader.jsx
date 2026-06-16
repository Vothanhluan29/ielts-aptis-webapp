import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, User, LogOut, ChevronDown } from "lucide-react";

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
    // Tìm key match chính xác trước, rồi mới tìm partial match
    const exactMatch = PAGE_TITLES[location.pathname];
    if (exactMatch) return exactMatch;

    const partialKey = Object.keys(PAGE_TITLES).find(k => location.pathname.startsWith(k));
    return partialKey ? PAGE_TITLES[partialKey] : 'APTIS';
  }, [location.pathname]);

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header
      className="h-[64px] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #f1f0fe',
        boxShadow: '0 1px 0 0 rgba(99,102,241,0.06)'
      }}
    >
      {/* ===== LEFT: Mobile menu + Page title ===== */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-150"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={20} />
        </button>

        {/* Page title */}
        <h1 className="text-[15px] font-bold text-slate-700 m-0 tracking-tight">
          {dynamicPageTitle}
        </h1>
      </div>

      {/* ===== RIGHT: Profile area ===== */}
      <div className="relative flex items-center gap-3" ref={profileRef}>

        {/* User info (hidden on small screens) */}
        <div className="hidden sm:block text-right">
          <p className="text-[13px] font-semibold text-slate-800 m-0 leading-tight">
            {user?.full_name || "Aptis Student"}
          </p>
          <p className="text-[11px] text-indigo-500 font-bold uppercase tracking-wider m-0 mt-0.5">
            Student
          </p>
        </div>

        {/* Avatar button */}
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-1.5 rounded-xl p-1 transition-all duration-200 hover:bg-indigo-50"
          style={{ outline: 'none' }}
        >
          <div
            className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <ChevronDown
            size={13}
            strokeWidth={2.5}
            className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* ===== DROPDOWN ===== */}
        {profileOpen && (
          <div
            className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-2xl overflow-hidden z-50"
            style={{
              background: '#ffffff',
              border: '1px solid #ede9fe',
              boxShadow: '0 8px 32px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              animation: 'dropdownIn 0.18s ease'
            }}
          >
            {/* User info block */}
            <div className="p-4 border-b border-slate-50">
              <p className="text-[13px] font-bold text-slate-900 truncate m-0">
                {user?.full_name || "Anonymous User"}
              </p>
              <p className="text-[11px] text-slate-400 truncate m-0 mt-0.5">
                {user?.email || "No email"}
              </p>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              <Link
                to="/aptis/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-slate-700 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
              >
                <User size={15} className="text-slate-400" />
                Profile Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-red-500 rounded-xl hover:bg-red-50 transition-colors duration-150 text-left"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown animation keyframe */}
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </header>
  );
};

export default AptisHeader;