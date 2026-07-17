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
  PenTool,
  Mic,
  FileCheck,
  Headphones,
  BookMarked,
  GraduationCap,
  Sparkles
} from "lucide-react";

const AptisSideBar = ({ layoutProps }) => {
  const { isCollapsed, toggleSidebar, logout, basePath = "/admin/aptis" } = layoutProps;
  const location = useLocation();

  const [openSkills, setOpenSkills] = useState(
    location.pathname.includes(`${basePath}/reading`) ||
    location.pathname.includes(`${basePath}/listening`) ||
    location.pathname.includes(`${basePath}/writing`) ||
    location.pathname.includes(`${basePath}/speaking`) ||
    location.pathname.includes(`${basePath}/grammar-vocab`)
  );

  const [openGrading, setOpenGrading] = useState(
    location.pathname.includes(`${basePath}/submissions`)
  );

  const toggleSkills = () => setOpenSkills(!openSkills);
  const toggleGrading = () => setOpenGrading(!openGrading);

  // Helper for checking active paths since we don't have isActive prop from layoutProps here usually
  const isActive = (path) => location.pathname === path || (path !== `${basePath}/submissions` && location.pathname.startsWith(path));

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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles size={18} className="text-white fill-white" />
            </div>
            <h1 className="text-[15px] font-bold tracking-wide m-0 text-white">
              Aptis<span className="text-zinc-400 font-medium">{basePath === '/teacher' ? 'Teacher' : 'Admin'}</span>
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
          to={`${basePath}/dashboard`}
          label="Dashboard"
          icon={LayoutDashboard}
          isActive={location.pathname === `${basePath}/dashboard`}
          isCollapsed={isCollapsed}
          accentColor="orange"
        />

        {/* MANAGEMENT */}
        {!isCollapsed && <p className={sectionTitle}>Management</p>}
        <SidebarLink
          to={`${basePath}/users`}
          label={basePath === '/teacher' ? 'Students' : 'Users'}
          icon={Users}
          isActive={location.pathname === `${basePath}/users`}
          isCollapsed={isCollapsed}
          accentColor="orange"
        />

        {/* GRADING */}
        <div>
          <button
            onClick={toggleGrading}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
              openGrading ? "bg-zinc-800/50 text-white" : "text-zinc-400 hover:bg-zinc-800/30 hover:text-white"
            } ${isCollapsed ? "justify-center" : "mt-1"}`}
          >
            <div className="flex items-center gap-3">
              <ClipboardCheck size={18} className={openGrading ? "text-orange-400" : ""} />
              {!isCollapsed && <span className="text-[14px]">Grading</span>}
            </div>
            {!isCollapsed && (
              <ChevronRight size={14} className={`transition-transform duration-200 ${openGrading ? "rotate-90 text-orange-400" : "opacity-0 group-hover:opacity-100"}`} />
            )}
          </button>

          {!isCollapsed && openGrading && (
            <div className="ml-[1.35rem] mt-1 space-y-1 border-l border-zinc-800 pl-3 py-1">
              <SubSidebarLink to={`${basePath}/submissions`} label="Full Test" isActive={location.pathname === `${basePath}/submissions`} accentColor="orange" />
              <SubSidebarLink to={`${basePath}/submissions/listening`} label="Listening" isActive={location.pathname === `${basePath}/submissions/listening`} accentColor="orange" />
              <SubSidebarLink to={`${basePath}/submissions/reading`} label="Reading" isActive={location.pathname === `${basePath}/submissions/reading`} accentColor="orange" />
              <SubSidebarLink to={`${basePath}/submissions/grammar-vocab`} label="Grammar" isActive={location.pathname === `${basePath}/submissions/grammar-vocab`} accentColor="orange" />
              <SubSidebarLink to={`${basePath}/submissions/writing`} label="Writing" isActive={location.pathname === `${basePath}/submissions/writing`} accentColor="orange" />
              <SubSidebarLink to={`${basePath}/submissions/speaking`} label="Speaking" isActive={location.pathname === `${basePath}/submissions/speaking`} accentColor="orange" />
            </div>
          )}
        </div>

        {/* EXAMS & CONTENT */}
        {!isCollapsed && <p className={sectionTitle}>Content</p>}
        <SidebarLink
          to={`${basePath}/full-tests`}
          label="Mock Exams"
          icon={FileText}
          isActive={location.pathname === `${basePath}/full-tests`}
          isCollapsed={isCollapsed}
          accentColor="orange"
        />

        <div>
          <button
            onClick={toggleSkills}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
              openSkills ? "bg-zinc-800/50 text-white" : "text-zinc-400 hover:bg-zinc-800/30 hover:text-white"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="flex items-center gap-3">
              <BookOpen size={18} className={openSkills ? "text-orange-400" : ""} />
              {!isCollapsed && <span className="text-[14px]">Skills Library</span>}
            </div>
            {!isCollapsed && (
              <ChevronRight size={14} className={`transition-transform duration-200 ${openSkills ? "rotate-90 text-orange-400" : "opacity-0 group-hover:opacity-100"}`} />
            )}
          </button>

          {!isCollapsed && openSkills && (
            <div className="ml-[1.35rem] mt-1 space-y-1 border-l border-zinc-800 pl-3 py-1">
              {["grammar-vocab", "reading", "listening", "writing", "speaking"].map((skill) => {
                const isSkillActive = location.pathname.includes(`${basePath}/${skill}`);
                return (
                  <Link
                    key={skill}
                    to={`${basePath}/${skill}`}
                    className={`block px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all ${
                      isSkillActive
                        ? "text-orange-400 bg-orange-500/10 font-semibold"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
                    }`}
                  >
                    {skill.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" & ")}
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
const SidebarLink = ({ to, label, icon: Icon, isActive, isCollapsed, accentColor = "indigo" }) => {
  const activeBg = accentColor === "orange" ? "bg-orange-500" : "bg-indigo-500";
  const activeText = accentColor === "orange" ? "text-orange-400" : "text-indigo-400";
  
  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 rounded-xl font-medium transition-all duration-200 relative ${
        isActive 
          ? "bg-zinc-800/80 text-white shadow-sm ring-1 ring-zinc-700/50" 
          : "text-zinc-400 hover:bg-zinc-800/30 hover:text-white"
      } ${isCollapsed ? "justify-center h-11 w-11 mx-auto" : "px-3 py-2.5"}`}
    >
      {isActive && !isCollapsed && (
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 ${activeBg} rounded-r-full`} />
      )}
      
      {Icon && (
        <Icon 
          size={18} 
          className={`shrink-0 transition-colors ${isActive ? activeText : 'group-hover:text-zinc-300'}`} 
        />
      )}
      
      {!isCollapsed && <span className="text-[14px]">{label}</span>}
    </Link>
  );
};

const SubSidebarLink = ({ to, label, isActive, accentColor }) => {
  const activeBg = accentColor === "orange" ? "bg-orange-500/10" : "bg-indigo-500/10";
  const activeText = accentColor === "orange" ? "text-orange-400" : "text-indigo-400";

  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all ${
        isActive
          ? `${activeText} ${activeBg} font-semibold`
          : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
      }`}
    >
      <span>{label}</span>
    </Link>
  );
};

export default AptisSideBar;