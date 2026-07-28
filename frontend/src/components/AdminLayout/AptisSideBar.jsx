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
  Sparkles,
  MessageSquare
} from "lucide-react";
import { useFeedbackCount } from "../../contexts/FeedbackCountContext";

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

  const [openBank, setOpenBank] = useState(
    location.pathname.includes(`${basePath}/listening/bank`) ||
    location.pathname.includes(`${basePath}/reading/bank`) ||
    location.pathname.includes(`${basePath}/grammar_vocab/bank`) ||
    location.pathname.includes(`${basePath}/writing/bank`)
  );

  const [openGrading, setOpenGrading] = useState(
    location.pathname.includes(`${basePath}/submissions`)
  );

  const toggleSkills = () => setOpenSkills(!openSkills);
  const toggleGrading = () => setOpenGrading(!openGrading);
  const toggleBank = () => setOpenBank(!openBank);

  // ── Feedback pending badge — dung tu Context chia se ──
  const { count: pendingFeedbackCount } = useFeedbackCount();

  // Professional color palette: dark slate for sidebar
  const bgSidebar = "bg-[#09090b]"; // Zinc 950
  const borderSidebar = "border-zinc-800/60";
  const sectionTitle = "text-[10px] font-bold text-zinc-500 uppercase ml-3 tracking-[0.15em] mb-3 mt-6";
  const isTeacher = basePath === '/teacher';

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
                Aptis<span className="text-zinc-400 font-medium ml-1.5">{isTeacher ? 'Teacher' : 'Admin'}</span>
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
          to={`${basePath}/dashboard`}
          label="Dashboard"
          icon={LayoutDashboard}
          isActive={location.pathname === `${basePath}/dashboard`}
          isCollapsed={isCollapsed}
          accentColor={isTeacher ? "teal" : "orange"}
        />

        {/* MANAGEMENT */}
        {!isCollapsed && <p className={sectionTitle}>Management</p>}
        <SidebarLink
          to={`${basePath}/users`}
          label={isTeacher ? 'Students' : 'Users'}
          icon={Users}
          isActive={location.pathname === `${basePath}/users`}
          isCollapsed={isCollapsed}
          accentColor={isTeacher ? "teal" : "orange"}
        />
        <SidebarLink
          to={`${basePath}/feedback`}
          label="Feedbacks"
          icon={MessageSquare}
          isActive={location.pathname === `${basePath}/feedback`}
          isCollapsed={isCollapsed}
          accentColor={isTeacher ? "teal" : "orange"}
          badge={pendingFeedbackCount > 0 ? pendingFeedbackCount : null}
        />

        {/* GRADING DROPDOWN */}
        <div className="pt-1">
          <button
            onClick={toggleGrading}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group ${
              openGrading 
                ? "bg-zinc-800/80 text-white shadow-sm ring-1 ring-zinc-700/50" 
                : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Grading" : ""}
          >
            <div className="flex items-center gap-3">
              <ClipboardCheck 
                size={18} 
                className={`transition-colors duration-200 ${
                  openGrading 
                    ? (isTeacher ? "text-teal-400" : "text-orange-400") 
                    : "text-zinc-400 group-hover:text-zinc-300"
                }`} 
              />
              {!isCollapsed && <span className="text-[14px]">Grading</span>}
            </div>
            {!isCollapsed && (
              <ChevronRight 
                size={14} 
                className={`transition-transform duration-300 ${
                  openGrading 
                    ? `rotate-90 ${isTeacher ? "text-teal-400" : "text-orange-400"}` 
                    : "text-zinc-500 group-hover:text-zinc-300"
                }`} 
              />
            )}
          </button>

          {/* Animated Dropdown Content */}
          {!isCollapsed && (
            <div 
              className={`grid transition-all duration-300 ease-in-out ${
                openGrading ? "grid-rows-[1fr] opacity-100 mt-1.5" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="ml-5 border-l border-zinc-800/80 pl-3 py-1 space-y-1">
                  <SubSidebarLink to={`${basePath}/submissions`} label="Full Test" isActive={location.pathname === `${basePath}/submissions`} accentColor={isTeacher ? "teal" : "orange"} />
                  <SubSidebarLink to={`${basePath}/submissions/listening`} label="Listening" isActive={location.pathname === `${basePath}/submissions/listening`} accentColor={isTeacher ? "teal" : "orange"} />
                  <SubSidebarLink to={`${basePath}/submissions/reading`} label="Reading" isActive={location.pathname === `${basePath}/submissions/reading`} accentColor={isTeacher ? "teal" : "orange"} />
                  <SubSidebarLink to={`${basePath}/submissions/grammar-vocab`} label="Grammar" isActive={location.pathname === `${basePath}/submissions/grammar-vocab`} accentColor={isTeacher ? "teal" : "orange"} />
                  <SubSidebarLink to={`${basePath}/submissions/writing`} label="Writing" isActive={location.pathname === `${basePath}/submissions/writing`} accentColor={isTeacher ? "teal" : "orange"} />
                  <SubSidebarLink to={`${basePath}/submissions/speaking`} label="Speaking" isActive={location.pathname === `${basePath}/submissions/speaking`} accentColor={isTeacher ? "teal" : "orange"} />
                </div>
              </div>
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
          accentColor={isTeacher ? "teal" : "orange"}
        />

        {/* QUESTION BANKS DROPDOWN */}
        <div className="pt-1">
          <button
            onClick={toggleBank}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group ${
              openBank 
                ? "bg-zinc-800/80 text-white shadow-sm ring-1 ring-zinc-700/50" 
                : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Question Banks" : ""}
          >
            <div className="flex items-center gap-3">
              <BookOpen 
                size={18} 
                className={`transition-colors duration-200 ${
                  openBank 
                    ? (isTeacher ? "text-teal-400" : "text-orange-400") 
                    : "text-zinc-400 group-hover:text-zinc-300"
                }`} 
              />
              {!isCollapsed && <span className="text-[14px]">Question Banks</span>}
            </div>
            {!isCollapsed && (
              <ChevronRight 
                size={14} 
                className={`transition-transform duration-300 ${
                  openBank 
                    ? `rotate-90 ${isTeacher ? "text-teal-400" : "text-orange-400"}` 
                    : "text-zinc-500 group-hover:text-zinc-300"
                }`} 
              />
            )}
          </button>

          {!isCollapsed && (
            <div 
              className={`grid transition-all duration-300 ease-in-out ${
                openBank ? "grid-rows-[1fr] opacity-100 mt-1.5" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="ml-5 border-l border-zinc-800/80 pl-3 py-1 space-y-1">
                  <SubSidebarLink 
                    to={`${basePath}/listening/bank`} 
                    label="Listening Bank" 
                    isActive={location.pathname.includes(`${basePath}/listening/bank`)} 
                    accentColor={isTeacher ? "teal" : "orange"} 
                  />
                  <SubSidebarLink 
                    to={`${basePath}/reading/bank`} 
                    label="Reading Bank" 
                    isActive={location.pathname.includes(`${basePath}/reading/bank`)} 
                    accentColor={isTeacher ? "teal" : "orange"} 
                  />
                  <SubSidebarLink 
                    to={`${basePath}/grammar_vocab/bank`} 
                    label="Grammar & Vocab Bank" 
                    isActive={location.pathname.includes(`${basePath}/grammar_vocab/bank`)} 
                    accentColor={isTeacher ? "teal" : "orange"} 
                  />
                  <SubSidebarLink 
                    to={`${basePath}/writing/bank`} 
                    label="Writing Bank" 
                    isActive={location.pathname.includes(`${basePath}/writing/bank`)} 
                    accentColor={isTeacher ? "teal" : "orange"} 
                  />
                  <SubSidebarLink 
                    to={`${basePath}/speaking/bank`} 
                    label="Speaking Bank" 
                    isActive={location.pathname.includes(`${basePath}/speaking/bank`)} 
                    accentColor={isTeacher ? "teal" : "orange"} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

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
                    ? (isTeacher ? "text-teal-400" : "text-orange-400") 
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
                    ? `rotate-90 ${isTeacher ? "text-teal-400" : "text-orange-400"}` 
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
                  {["grammar-vocab", "reading", "listening", "writing", "speaking"].map((skill) => {
                    const isSkillActive = location.pathname.includes(`${basePath}/${skill}`) && !location.pathname.includes(`${basePath}/submissions`);
                    return (
                      <SubSidebarLink 
                        key={skill}
                        to={`${basePath}/${skill}`} 
                        label={skill.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" & ")} 
                        isActive={isSkillActive} 
                        accentColor={isTeacher ? "teal" : "orange"} 
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
const SidebarLink = ({ to, label, icon: Icon, isActive, isCollapsed, accentColor = "orange", badge = null }) => {
  const activeBg = accentColor === "orange" ? "bg-orange-500" : "bg-teal-500";
  const activeText = accentColor === "orange" ? "text-orange-400" : "text-teal-400";
  const badgeBg = accentColor === "orange" ? "bg-orange-500" : "bg-teal-500";
  
  return (
    <Link
      to={to}
      title={isCollapsed ? (badge ? `${label} (${badge} pending)` : label) : ""}
      className={`group flex items-center gap-3 rounded-xl font-medium transition-all duration-200 relative ${
        isActive 
          ? "bg-zinc-800/80 text-white shadow-sm ring-1 ring-zinc-700/50" 
          : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white"
      } ${isCollapsed ? "justify-center h-11 w-11 mx-auto" : "px-3 py-2.5"}`}
    >
      {isActive && !isCollapsed && (
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 ${activeBg} rounded-r-full shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
      )}
      
      {/* Icon + collapsed badge */}
      <div className="relative shrink-0">
        {Icon && (
          <Icon 
            size={18} 
            className={`transition-colors duration-200 ${isActive ? activeText : 'text-zinc-400 group-hover:text-zinc-300'}`} 
          />
        )}
        {/* Badge dot khi sidebar collapsed */}
        {isCollapsed && badge !== null && (
          <span className={`absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full ${badgeBg} text-white text-[9px] font-bold flex items-center justify-center shadow-lg animate-pulse`}>
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
      
      {/* Label + badge khi sidebar mo rong */}
      {!isCollapsed && (
        <span className="flex-1 flex items-center justify-between gap-2 text-[14px]">
          {label}
          {badge !== null && (
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full ${badgeBg} text-white text-[10px] font-bold shadow-md transition-all duration-300`}>
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </span>
      )}
    </Link>
  );
};

/* =========================
   SUB-SIDEBAR LINK COMPONENT (Dropdown Items)
========================= */
const SubSidebarLink = ({ to, label, isActive, accentColor = "orange" }) => {
  const activeBg = accentColor === "orange" ? "bg-orange-500/15" : "bg-teal-500/15";
  const activeText = accentColor === "orange" ? "text-orange-400" : "text-teal-400";
  const dotColor = accentColor === "orange" ? "bg-orange-400 shadow-[0_0_5px_rgba(251,146,60,0.5)]" : "bg-teal-400 shadow-[0_0_5px_rgba(45,212,191,0.5)]";

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

export default AptisSideBar;