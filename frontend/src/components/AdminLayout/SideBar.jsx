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

  const titleClass = "text-[10px] font-extrabold text-gray-500 uppercase ml-2 tracking-[0.2em]";

  return (
    <aside
      className={`flex flex-col transition-all duration-300 ease-in-out border-r border-gray-800/60 shadow-2xl bg-gradient-to-b from-[#0B0F19] via-[#111827] to-[#0B0F19] text-gray-200 z-50 relative ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Decorative Light */}
      <div className="absolute top-0 left-0 w-full h-32 bg-indigo-500/5 blur-[80px] pointer-events-none" />

      {/* LOGO */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-gray-800/60 shrink-0 relative z-10">
        {!isCollapsed && (
          <h1 className="text-lg font-extrabold uppercase tracking-widest m-0 flex items-center gap-1">
            <span className="text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">ADMIN</span>
            <span className="text-white">PANEL</span>
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg bg-gray-800/50 hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-400 transition-all duration-300"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar relative z-10">
        
        {/* DASHBOARD */}
        {!isCollapsed && <p className={`${titleClass} mb-2 mt-2`}>Overview</p>}
        <SidebarLink
          to="/admin/dashboard"
          label="Dashboard"
          icon={LayoutDashboard}
          isActive={isActive("/admin/dashboard")}
          isCollapsed={isCollapsed}
        />

        {/* USER MANAGEMENT */}
        {!isCollapsed && <p className={`${titleClass} mb-2 mt-6`}>User Management</p>}
        <SidebarLink
          to="/admin/users"
          label="Users"
          icon={Users}
          isActive={isActive("/admin/users")}
          isCollapsed={isCollapsed}
        />

        {/* GRADING & REVIEW */}
        {!isCollapsed && <p className={`${titleClass} mb-2 mt-6`}>Grading & Review</p>}
        <SidebarLink
          to="/admin/submissions"
          label="Submissions"
          icon={ClipboardCheck}
          isActive={isActive("/admin/submissions")}
          isCollapsed={isCollapsed}
        />

        {/* MOCK EXAMS */}
        {!isCollapsed && <p className={`${titleClass} mb-2 mt-6`}>Mock Exams</p>}
        <SidebarLink
          to="/admin/full-tests"
          label="Full Tests"
          icon={FileText}
          isActive={isActive("/admin/full-tests")}
          isCollapsed={isCollapsed}
        />

        {/* SKILLS CONTENT */}
        {!isCollapsed && <p className={`${titleClass} mb-2 mt-6`}>Skills Content</p>}
        <div>
          <button
            onClick={toggleSkills}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold transition-all duration-300 group ${
              openSkills ? "bg-gray-800/80 text-white" : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="flex items-center gap-3">
              <BookOpen size={20} className="shrink-0 group-hover:scale-110 transition-transform duration-300 group-hover:text-indigo-400" />
              {!isCollapsed && <span className="text-sm whitespace-nowrap tracking-wide">Skills Library</span>}
            </div>
            {!isCollapsed && (
              <ChevronRight size={16} className={`transition-transform duration-300 ${openSkills ? "rotate-90 text-indigo-400" : "opacity-40 group-hover:text-indigo-400 group-hover:opacity-100"}`} />
            )}
          </button>

          {!isCollapsed && openSkills && (
            <div className="ml-5 mt-2 space-y-1 border-l border-gray-700/50 pl-4">
              {["reading", "listening", "writing", "speaking"].map((skill) => {
                const active = isActive(`/admin/skills/${skill}`);
                return (
                  <Link
                    key={skill}
                    to={`/admin/skills/${skill}`}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      active
                        ? "text-white bg-indigo-500/20 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                    }`}
                  >
                    {skill.charAt(0).toUpperCase() + skill.slice(1)}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t border-gray-800/60 shrink-0 relative z-10">
        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full rounded-xl transition-all duration-300 ${
            isCollapsed ? "justify-center h-12" : "px-4 py-3"
          } text-gray-400 hover:text-white hover:bg-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] group`}
        >
          <LogOut size={18} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
          {!isCollapsed && <span className="text-xs font-bold uppercase tracking-[0.15em]">Log out</span>}
        </button>
      </div>

    </aside>
  );
};

/* =========================
   SIDEBAR LINK
========================= */
const SidebarLink = ({ to, label, icon, isActive, isCollapsed }) => (
  <Link
    to={to}
    className={`group flex items-center gap-3 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden ${
      isActive 
        ? "text-white bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)] border border-indigo-500" 
        : "text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent"
    } ${isCollapsed ? "justify-center h-12 w-12 mx-auto" : "px-3.5 py-3"}`}
  >
    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]" />}
    {icon && React.createElement(icon, { size: 20, className: `shrink-0 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-indigo-400'}` })}
    {!isCollapsed && <span className="text-sm whitespace-nowrap tracking-wide relative z-10">{label}</span>}
  </Link>
);

export default SideBar;