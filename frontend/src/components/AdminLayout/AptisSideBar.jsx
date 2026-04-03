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
  FileCheck
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
    `group flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
        : "text-indigo-300 hover:text-white hover:bg-indigo-900/70"
    }`;

  const subLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? "text-white bg-indigo-600/40 ring-1 ring-indigo-500/40"
        : "text-indigo-300 hover:text-white hover:bg-indigo-900/60"
    }`;

  const dropdownBtnClass = (isOpen) =>
    `w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold transition ${
      isOpen ? "bg-indigo-900/60 text-white" : "text-indigo-300 hover:bg-indigo-900"
    }`;

  const titleClass = "text-[11px] font-bold text-indigo-400 uppercase ml-2 tracking-widest";

  return (
    <aside
      className={`flex flex-col transition-all duration-300 border-r border-indigo-900 shadow-2xl bg-linear-to-b from-indigo-950 via-indigo-950 to-slate-950 text-indigo-100 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* LOGO */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-indigo-900 shrink-0">
        {!isCollapsed && (
          <h1 className="text-lg font-extrabold uppercase tracking-tight m-0">
            <span className="text-indigo-400">Aptis</span> <span className="text-white">Panel</span>
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-indigo-300 hover:text-white transition "
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        
        {/* DASHBOARD */}
        {!isCollapsed && <p className={titleClass}>Dashboard</p>}
        <NavLink to="/admin/aptis/dashboard" className={linkClass}>
          <LayoutDashboard size={20} className="shrink-0" />
          {!isCollapsed && <span className="text-sm whitespace-nowrap">Dashboard</span>}
        </NavLink>

        {/* USER MANAGEMENT */}
        {!isCollapsed && <p className={`${titleClass} mt-4`}>User Management</p>}
        <NavLink to="/admin/aptis/users" className={linkClass}>
          <Users size={20} className="shrink-0" />
          {!isCollapsed && <span className="text-sm whitespace-nowrap">Users</span>}
        </NavLink>

        {/* GRADING */}
        {!isCollapsed && <p className={`${titleClass} mt-4`}>Grading & Review</p>}
        <div className="space-y-1">
          <button onClick={toggleGrading} className={dropdownBtnClass(openGrading)}>
            <div className="flex items-center gap-3">
              <ClipboardCheck size={20} className="shrink-0" />
              {!isCollapsed && <span className="text-sm whitespace-nowrap">Submissions</span>}
            </div>
            {!isCollapsed && <ChevronRight size={14} className={`transition-transform ${openGrading ? "rotate-90" : ""}`} />}
          </button>

          {!isCollapsed && openGrading && (
            <div className="ml-5 mt-1 space-y-1 border-l border-indigo-800 pl-4">
              <NavLink to="/admin/aptis/submissions" end className={subLinkClass}>
                <FileCheck size={14} className="shrink-0" /> <span className="whitespace-nowrap">Exam (Full Test)</span>
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
        {!isCollapsed && <p className={`${titleClass} mt-4`}>Mock Exams</p>}
        <NavLink to="/admin/aptis/full-tests" className={linkClass}>
          <FileText size={20} className="shrink-0" />
          {!isCollapsed && <span className="text-sm whitespace-nowrap">Full Mock Tests</span>}
        </NavLink>

        {/* SKILLS */}
        {!isCollapsed && <p className={`${titleClass} mt-4`}>Skills Content</p>}
        <div className="space-y-1">
          <button onClick={toggleSkills} className={dropdownBtnClass(openSkills)}>
            <div className="flex items-center gap-3">
              <BookOpen size={20} className="shrink-0" />
              {!isCollapsed && <span className="text-sm whitespace-nowrap">Skills Library</span>}
            </div>
            {!isCollapsed && <ChevronRight size={14} className={`transition-transform ${openSkills ? "rotate-90" : ""}`} />}
          </button>

          {!isCollapsed && openSkills && (
            <div className="ml-5 mt-1 space-y-1 border-l border-indigo-800 pl-4">
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

        {/* ACCOUNT */}
        {!isCollapsed && <p className={`${titleClass} mt-4`}>Account</p>}
        <NavLink to="/admin/aptis/profile" className={linkClass}>
          <UserCog size={20} className="shrink-0" />
          {!isCollapsed && <span className="text-sm whitespace-nowrap">Profile Settings</span>}
        </NavLink>

      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t border-indigo-900 shrink-0">
        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full rounded-xl transition-colors ${
            isCollapsed ? "justify-center h-12" : "px-4 py-3"
          } text-indigo-300 hover:text-rose-400 hover:bg-rose-500/10`}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">Log out</span>}
        </button>
      </div>

    </aside>
  );
};

export default AptisSideBar;