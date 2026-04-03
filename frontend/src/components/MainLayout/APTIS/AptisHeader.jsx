import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, User, LogOut } from "lucide-react";

const AptisHeader = ({
  sidebarOpen,
  setSidebarOpen,
  profileOpen,
  setProfileOpen,
  profileRef,
  user,
  handleLogout
}) => {
  // Tự động đổi Title theo URL (Dynamic Title)
  const location = useLocation();
  
  const dynamicPageTitle = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/aptis/dashboard')) return 'Dashboard';
    if (path.includes('/aptis/exam')) return 'Full Mock Test';
    if (path.includes('/aptis/grammar-vocab')) return 'Grammar & Vocabulary';
    if (path.includes('/aptis/listening')) return 'Listening Practice';
    if (path.includes('/aptis/reading')) return 'Reading Practice';
    if (path.includes('/aptis/writing')) return 'Writing Practice';
    if (path.includes('/aptis/speaking')) return 'Speaking Practice';
    if (path.includes('/aptis/profile')) return 'Account Settings';
    return 'Aptis Dashboard'; // Fallback default
  }, [location.pathname]);

  return (
    <header className="h-20 bg-linear-to-r from-emerald-200 via-teal-200 to-sky-200 border-b border-white/40 flex items-center justify-between px-6 sticky top-0 z-30">

      {/* LEFT AREA: MOBILE MENU & DYNAMIC TITLE */}
      <div className="flex items-center gap-6">

        {/* MOBILE MENU */}
        <button
          className="md:hidden p-2 rounded-lg bg-white/40 hover:bg-white/60 transition"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={20} className="text-slate-800" />
        </button>

        {/* DYNAMIC PAGE TITLE */}
        <h1 className="text-lg font-bold text-teal-900 drop-shadow-xs m-0">
          {dynamicPageTitle}
        </h1>

      </div>

      {/* RIGHT AREA: PROFILE */}
      <div className="flex items-center gap-4 relative" ref={profileRef}>

        {/* PROFILE INFO (Ẩn trên mobile) */}
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-slate-800 m-0">
            {user?.full_name || "Aptis Student"}
          </p>
          <p className="text-xs text-teal-700 uppercase font-bold tracking-wider m-0 mt-0.5">
            Student
          </p>
        </div>

        {/* AVATAR */}
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shadow-md hover:ring-4 hover:ring-teal-200 transition-all overflow-hidden"
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            user?.full_name?.charAt(0).toUpperCase() || "U"
          )}
        </button>

        {/* DROPDOWN MENU */}
        {profileOpen && (
          <div className="absolute right-0 top-14 w-60 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900 truncate m-0">
                {user?.full_name || "Anonymous User"}
              </p>
              <p className="text-xs text-slate-500 truncate m-0 mt-0.5">
                {user?.email || "No email provided"}
              </p>
            </div>
            
            <div className="p-2 flex flex-col gap-1">
              <Link
                to="/aptis/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 rounded-xl hover:bg-teal-50 hover:text-teal-700 transition-colors"
              >
                <User size={16} />
                Profile Settings
              </Link>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors text-left"
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