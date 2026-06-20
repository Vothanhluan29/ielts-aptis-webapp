import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  LogOut,
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  UserCog,
  ClipboardCheck,
  PenTool,
  Mic,
  FileCheck,
  Headphones,
  BookMarked,
  GraduationCap
} from "lucide-react";

const AptisSideBar = ({ layoutProps }) => {
  const { isCollapsed, toggleSidebar, logout } = layoutProps;
  const location = useLocation();

  const [openSkills, setOpenSkills] = useState(
    location.pathname.includes("/admin/aptis/reading") ||
    location.pathname.includes("/admin/aptis/listening") ||
    location.pathname.includes("/admin/aptis/writing") ||
    location.pathname.includes("/admin/aptis/speaking") ||
    location.pathname.includes("/admin/aptis/grammar-vocab")
  );

  const [openGrading, setOpenGrading] = useState(
    location.pathname.includes("/admin/aptis/submissions")
  );

  const toggleSkills = () => setOpenSkills(!openSkills);
  const toggleGrading = () => setOpenGrading(!openGrading);

  /* ======================
     LINK STYLES
  ====================== */
  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden ${
      isActive
        ? "bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)] border border-fuchsia-500"
        : "text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent"
    } ${isCollapsed ? "justify-center h-12 w-12 mx-auto" : "px-3.5 py-3"}`;

  const subLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
      isActive
        ? "text-white bg-fuchsia-500/20 ring-1 ring-fuchsia-500/40 shadow-[0_0_10px_rgba(192,38,211,0.2)]"
        : "text-gray-400 hover:text-white hover:bg-gray-800/60"
    }`;

  const dropdownBtnClass = (isOpen) =>
    `w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold transition-all duration-300 group ${
      isOpen ? "bg-gray-800/80 text-white" : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
    } ${isCollapsed ? "justify-center" : ""}`;

  const titleClass = "text-[10px] font-extrabold text-gray-500 uppercase ml-2 tracking-[0.2em]";

  return (
    <aside
      className={`flex flex-col transition-all duration-300 ease-in-out border-r border-gray-800/60 shadow-2xl bg-gradient-to-b from-[#0B0F19] via-[#111827] to-[#0B0F19] text-gray-200 z-50 relative ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Decorative Light */}
      <div className="absolute top-0 left-0 w-full h-32 bg-fuchsia-500/5 blur-[80px] pointer-events-none" />

      {/* LOGO */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-gray-800/60 shrink-0 relative z-10">
        {!isCollapsed && (
          <h1 className="text-lg font-extrabold uppercase tracking-widest m-0 flex items-center gap-1">
            <span className="text-fuchsia-500 drop-shadow-[0_0_8px_rgba(192,38,211,0.5)]">APTIS</span>
            <span className="text-white">PANEL</span>
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg bg-gray-800/50 hover:bg-fuchsia-500/20 text-gray-400 hover:text-fuchsia-400 transition-all duration-300"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar relative z-10">
        
        {/* DASHBOARD */}
        {!isCollapsed && <p className={`${titleClass} mb-2 mt-2`}>Overview</p>}
        <NavLink to="/admin/aptis/dashboard" className={linkClass}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]" />}
              <LayoutDashboard size={20} className={`shrink-0 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-fuchsia-400'}`} />
              {!isCollapsed && <span className="text-sm whitespace-nowrap tracking-wide relative z-10">Dashboard</span>}
            </>
          )}
        </NavLink>

        {/* USER MANAGEMENT */}
        {!isCollapsed && <p className={`${titleClass} mb-2 mt-6`}>User Management</p>}
        <NavLink to="/admin/aptis/users" className={linkClass}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]" />}
              <Users size={20} className={`shrink-0 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-fuchsia-400'}`} />
              {!isCollapsed && <span className="text-sm whitespace-nowrap tracking-wide relative z-10">Users</span>}
            </>
          )}
        </NavLink>

        {/* GRADING */}
        {!isCollapsed && <p className={`${titleClass} mb-2 mt-6`}>Grading & Review</p>}
        <div>
          <button onClick={toggleGrading} className={dropdownBtnClass(openGrading)}>
            <div className="flex items-center gap-3">
              <ClipboardCheck size={20} className="shrink-0 group-hover:scale-110 transition-transform duration-300 group-hover:text-fuchsia-400" />
              {!isCollapsed && <span className="text-sm whitespace-nowrap tracking-wide">Submissions</span>}
            </div>
            {!isCollapsed && <ChevronRight size={16} className={`transition-transform duration-300 ${openGrading ? "rotate-90 text-fuchsia-400" : "opacity-40 group-hover:text-fuchsia-400 group-hover:opacity-100"}`} />}
          </button>

          {!isCollapsed && openGrading && (
            <div className="ml-5 mt-2 space-y-1 border-l border-gray-700/50 pl-4">
              <NavLink to="/admin/aptis/submissions" end className={subLinkClass}>
                <FileCheck size={14} className="shrink-0" /> <span className="whitespace-nowrap">Exam (Full Test)</span>
              </NavLink>
              <NavLink to="/admin/aptis/submissions/listening" className={subLinkClass}>
                <Headphones size={14} className="shrink-0" /> <span className="whitespace-nowrap">Listening</span>
              </NavLink>
              <NavLink to="/admin/aptis/submissions/reading" className={subLinkClass}>
                <BookMarked size={14} className="shrink-0" /> <span className="whitespace-nowrap">Reading</span>
              </NavLink>
              <NavLink to="/admin/aptis/submissions/grammar-vocab" className={subLinkClass}>
                <GraduationCap size={14} className="shrink-0" /> <span className="whitespace-nowrap">Grammar &amp; Vocab</span>
              </NavLink>
              <NavLink to="/admin/aptis/submissions/writing" className={subLinkClass}>
                <PenTool size={14} className="shrink-0" /> <span className="whitespace-nowrap">Writing</span>
              </NavLink>
              <NavLink to="/admin/aptis/submissions/speaking" className={subLinkClass}>
                <Mic size={14} className="shrink-0" /> <span className="whitespace-nowrap">Speaking</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* MOCK EXAMS */}
        {!isCollapsed && <p className={`${titleClass} mb-2 mt-6`}>Mock Exams</p>}
        <NavLink to="/admin/aptis/full-tests" className={linkClass}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]" />}
              <FileText size={20} className={`shrink-0 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-fuchsia-400'}`} />
              {!isCollapsed && <span className="text-sm whitespace-nowrap tracking-wide relative z-10">Full Mock Tests</span>}
            </>
          )}
        </NavLink>

        {/* SKILLS */}
        {!isCollapsed && <p className={`${titleClass} mb-2 mt-6`}>Skills Content</p>}
        <div>
          <button onClick={toggleSkills} className={dropdownBtnClass(openSkills)}>
            <div className="flex items-center gap-3">
              <BookOpen size={20} className="shrink-0 group-hover:scale-110 transition-transform duration-300 group-hover:text-fuchsia-400" />
              {!isCollapsed && <span className="text-sm whitespace-nowrap tracking-wide">Skills Library</span>}
            </div>
            {!isCollapsed && <ChevronRight size={16} className={`transition-transform duration-300 ${openSkills ? "rotate-90 text-fuchsia-400" : "opacity-40 group-hover:text-fuchsia-400 group-hover:opacity-100"}`} />}
          </button>

          {!isCollapsed && openSkills && (
            <div className="ml-5 mt-2 space-y-1 border-l border-gray-700/50 pl-4">
              {["grammar-vocab", "reading", "listening", "writing", "speaking"].map(skill => (
                <NavLink key={skill} to={`/admin/aptis/${skill}`} className={subLinkClass}>
                  <span className="whitespace-nowrap">
                    {skill.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" & ")}
                  </span>
                </NavLink>
              ))}
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

export default AptisSideBar;