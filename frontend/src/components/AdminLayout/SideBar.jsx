import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  
  const location = useLocation();

  // Professional color palette: dark slate for sidebar
  const bgSidebar = "bg-[#09090b]"; // Zinc 950
  const borderSidebar = "border-zinc-800/60";
  const sectionTitle = "text-[10px] font-bold text-zinc-500 uppercase ml-3 tracking-[0.15em] mb-3 mt-6";
  const accentColor = "indigo"; // IELTS accent

  return (
    <aside
      className={`flex flex-col transition-all duration-300 ease-in-out border-r ${borderSidebar} shadow-2xl ${bgSidebar} text-zinc-300 z-50 relative ${
        isCollapsed ? "w-[80px]" : "w-[260px]"
      }`}
    >
      {/* ── TOP: BRANDING ── */}
      <div className={`h-[76px] flex items-center justify-between px-5 border-b ${borderSidebar} shrink-0`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="flex flex-col py-1">
              <h1 className="text-[20px] font-bold tracking-wide m-0 text-white leading-tight">
                IELTS<span className="text-zinc-400 font-medium ml-1.5">Admin</span>
              </h1>
              <span className="text-[11px] text-zinc-500 font-semibold tracking-[0.2em] uppercase mt-0.5">Workspace</span>
            </div>
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
          accentColor={accentColor}
        />

        {/* MANAGEMENT */}
        {!isCollapsed && <p className={sectionTitle}>Management</p>}
        <SidebarLink
          to="/admin/users"
          label="Users"
          icon={Users}
          isActive={isActive("/admin/users")}
          isCollapsed={isCollapsed}
          accentColor={accentColor}
        />
        <SidebarLink
          to="/admin/submissions"
          label="Submissions"
          icon={ClipboardCheck}
          isActive={isActive("/admin/submissions")}
          isCollapsed={isCollapsed}
          accentColor={accentColor}
        />

        {/* EXAMS & CONTENT */}
        {!isCollapsed && <p className={sectionTitle}>Content</p>}
        <SidebarLink
          to="/admin/full-tests"
          label="Mock Exams"
          icon={FileText}
          isActive={isActive("/admin/full-tests")}
          isCollapsed={isCollapsed}
          accentColor={accentColor}
        />

        {/* SKILLS LIBRARY DROPDOWN */}
        <div className="pt-1">
          <button
            onClick={toggleSkills}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group ${
              openSkills 
                ? "bg-zinc-800/80 text-white shadow-sm ring-1 ring-zinc-700/50" 
                : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Skills Library" : ""}
          >
            <div className="flex items-center gap-3">
              <BookOpen 
                size={18} 
                className={`transition-colors duration-200 ${
                  openSkills 
                    ? "text-indigo-400" 
                    : "text-zinc-400 group-hover:text-zinc-300"
                }`} 
              />
              {!isCollapsed && <span className="text-[14px]">Skills Library</span>}
            </div>
            {!isCollapsed && (
              <ChevronRight 
                size={14} 
                className={`transition-transform duration-300 ${
                  openSkills 
                    ? `rotate-90 text-indigo-400` 
                    : "text-zinc-500 group-hover:text-zinc-300"
                }`} 
              />
            )}
          </button>

          {/* Animated Dropdown Content */}
          {!isCollapsed && (
            <div 
              className={`grid transition-all duration-300 ease-in-out ${
                openSkills ? "grid-rows-[1fr] opacity-100 mt-1.5" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="ml-5 border-l border-zinc-800/80 pl-3 py-1 space-y-1">
                  {["reading", "listening", "writing", "speaking"].map((skill) => {
                    const isSkillActive = isActive(`/admin/skills/${skill}`);
                    return (
                      <SubSidebarLink 
                        key={skill}
                        to={`/admin/skills/${skill}`} 
                        label={skill.charAt(0).toUpperCase() + skill.slice(1)} 
                        isActive={isSkillActive} 
                        accentColor={accentColor} 
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── BOTTOM: LOGOUT ── */}
      <div className={`p-4 border-t ${borderSidebar} shrink-0 bg-[#09090b]`}>
        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full rounded-xl transition-all duration-200 ${
            isCollapsed ? "justify-center h-11" : "px-4 py-2.5"
          } text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 font-medium group`}
          title={isCollapsed ? "Sign Out" : ""}
        >
          <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          {!isCollapsed && <span className="text-[14px]">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

/* =========================
   SIDEBAR LINK COMPONENT
========================= */
const SidebarLink = ({ to, label, icon: Icon, isActive, isCollapsed, accentColor = "indigo" }) => {
  const activeBg = "bg-indigo-500";
  const activeText = "text-indigo-400";
  
  return (
    <Link
      to={to}
      title={isCollapsed ? label : ""}
      className={`group flex items-center gap-3 rounded-xl font-medium transition-all duration-200 relative ${
        isActive 
          ? "bg-zinc-800/80 text-white shadow-sm ring-1 ring-zinc-700/50" 
          : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white"
      } ${isCollapsed ? "justify-center h-11 w-11 mx-auto" : "px-3 py-2.5"}`}
    >
      {isActive && !isCollapsed && (
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 ${activeBg} rounded-r-full shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
      )}
      
      {Icon && (
        <Icon 
          size={18} 
          className={`shrink-0 transition-colors duration-200 ${isActive ? activeText : 'text-zinc-400 group-hover:text-zinc-300'}`} 
        />
      )}
      
      {!isCollapsed && <span className="text-[14px]">{label}</span>}
    </Link>
  );
};

/* =========================
   SUB-SIDEBAR LINK COMPONENT (Dropdown Items)
========================= */
const SubSidebarLink = ({ to, label, isActive, accentColor = "indigo" }) => {
  const activeBg = "bg-indigo-500/15";
  const activeText = "text-indigo-400";
  const dotColor = "bg-indigo-400 shadow-[0_0_5px_rgba(99,102,241,0.5)]";

  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 ${
        isActive
          ? `${activeText} ${activeBg} font-semibold ring-1 ring-zinc-700/50`
          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
      }`}
    >
      <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${
        isActive ? dotColor : "bg-zinc-600 group-hover:bg-zinc-400"
      }`} />
      <span>{label}</span>
    </Link>
  );
};

export default SideBar;