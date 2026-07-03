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
  ClipboardCheck,
  Zap
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

  // Professional color palette: dark slate for sidebar
  const bgSidebar = "bg-[#09090b]"; // Zinc 950
  const borderSidebar = "border-zinc-800/60";
  const sectionTitle = "text-[10px] font-bold text-zinc-500 uppercase ml-3 tracking-[0.15em] mb-3 mt-6";

  return (
    <aside
      className={`flex flex-col transition-all duration-300 ease-in-out border-r ${borderSidebar} shadow-xl ${bgSidebar} text-zinc-300 z-50 relative ${
        isCollapsed ? "w-[80px]" : "w-[260px]"
      }`}
    >
      {/* ── TOP: BRANDING ── */}
      <div className={`h-[76px] flex items-center justify-between px-5 border-b ${borderSidebar} shrink-0`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <h1 className="text-[15px] font-bold tracking-wide m-0 text-white">
              IELTS<span className="text-zinc-400 font-medium ml-1">Admin</span>
            </h1>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors focus:outline-none"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ── MIDDLE: NAVIGATION SCROLL AREA ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        
        {/* OVERVIEW */}
        {!isCollapsed && <p className={sectionTitle}>Overview</p>}
        <SidebarLink
          to="/admin/dashboard"
          label="Dashboard"
          icon={LayoutDashboard}
          isActive={isActive("/admin/dashboard")}
          isCollapsed={isCollapsed}
        />

        {/* MANAGEMENT */}
        {!isCollapsed && <p className={sectionTitle}>Management</p>}
        <SidebarLink
          to="/admin/users"
          label="Users"
          icon={Users}
          isActive={isActive("/admin/users")}
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to="/admin/submissions"
          label="Submissions"
          icon={ClipboardCheck}
          isActive={isActive("/admin/submissions")}
          isCollapsed={isCollapsed}
        />

        {/* EXAMS & CONTENT */}
        {!isCollapsed && <p className={sectionTitle}>Content</p>}
        <SidebarLink
          to="/admin/full-tests"
          label="Mock Exams"
          icon={FileText}
          isActive={isActive("/admin/full-tests")}
          isCollapsed={isCollapsed}
        />

        <div>
          <button
            onClick={toggleSkills}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
              openSkills ? "bg-zinc-800/50 text-white" : "text-zinc-400 hover:bg-zinc-800/30 hover:text-white"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="flex items-center gap-3">
              <BookOpen size={18} className={openSkills ? "text-indigo-400" : ""} />
              {!isCollapsed && <span className="text-[14px]">Skills Library</span>}
            </div>
            {!isCollapsed && (
              <ChevronRight size={14} className={`transition-transform duration-200 ${openSkills ? "rotate-90 text-indigo-400" : "opacity-0 group-hover:opacity-100"}`} />
            )}
          </button>

          {!isCollapsed && openSkills && (
            <div className="ml-[1.35rem] mt-1 space-y-1 border-l border-zinc-800 pl-3 py-1">
              {["reading", "listening", "writing", "speaking"].map((skill) => {
                const active = isActive(`/admin/skills/${skill}`);
                return (
                  <Link
                    key={skill}
                    to={`/admin/skills/${skill}`}
                    className={`block px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all ${
                      active
                        ? "text-indigo-400 bg-indigo-500/10 font-semibold"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
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

      {/* ── BOTTOM: LOGOUT ── */}
      <div className={`p-4 border-t ${borderSidebar} shrink-0 bg-[#09090b]`}>
        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full rounded-xl transition-all ${
            isCollapsed ? "justify-center h-11" : "px-4 py-2.5"
          } text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 font-medium`}
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="text-[14px]">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

/* =========================
   SIDEBAR LINK COMPONENT
========================= */
const SidebarLink = ({ to, label, icon: Icon, isActive, isCollapsed }) => (
  <Link
    to={to}
    className={`group flex items-center gap-3 rounded-xl font-medium transition-all duration-200 relative ${
      isActive 
        ? "bg-zinc-800/80 text-white shadow-sm ring-1 ring-zinc-700/50" 
        : "text-zinc-400 hover:bg-zinc-800/30 hover:text-white"
    } ${isCollapsed ? "justify-center h-11 w-11 mx-auto" : "px-3 py-2.5"}`}
  >
    {isActive && !isCollapsed && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full" />
    )}
    
    {Icon && (
      <Icon 
        size={18} 
        className={`shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'group-hover:text-zinc-300'}`} 
      />
    )}
    
    {!isCollapsed && <span className="text-[14px]">{label}</span>}
  </Link>
);

export default SideBar;