import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  LogOut,
  LayoutDashboard,
  Users,
  MessageSquare,
  BookMarked,
  FileText,
  Library,
  ClipboardList,
  Lightbulb
} from "lucide-react";
import { useFeedbackCount } from "../../../contexts/FeedbackCountContext";

/* ── Helpers ── */
const activeBg = "bg-white";
const activeText = "text-[#0288D1]";
const activeBgSub = "bg-white";
const dotActive = "bg-[#0288D1]";

/* ── NavItem (flat link) ── */
const NavItem = ({ to, icon: Icon, label, isActive, isCollapsed, badge }) => (
  <Link
    to={to}
    title={isCollapsed ? label : ""}
    className={`group relative flex items-center gap-3 transition-all duration-200 ${
      isActive
        ? "!bg-[#F8FAFC] !text-[#445A95] font-bold rounded-l-full rounded-r-none"
        : "!text-white/80 hover:bg-white/10 hover:!text-white font-medium rounded-l-full rounded-r-none"
    } ${isCollapsed ? "justify-center h-12 w-12 mx-auto rounded-full" : "pl-4 pr-2 py-3"}`}
  >
    <div className="relative shrink-0">
      <Icon
        size={18}
        className={`transition-colors duration-200 ${isActive ? "!text-[#445A95]" : "!text-white/70 group-hover:!text-white"}`}
      />
      {isCollapsed && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-sm">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </div>
    {!isCollapsed && (
      <span className="flex-1 flex items-center justify-between gap-2 text-[14px]">
        {label}
        {badge > 0 && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-sm">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
    )}
  </Link>
);

/* ── DropdownMenu (collapsible group) ── */
const DropdownMenu = ({ icon: Icon, label, isOpen, onToggle, isCollapsed, children }) => (
  <div className="pt-0.5">
    <button
      onClick={onToggle}
      title={isCollapsed ? label : ""}
      className={`w-full flex items-center justify-between transition-all duration-200 group rounded-l-full rounded-r-none ${
        isOpen
          ? "bg-white/10 !text-white font-bold"
          : "!text-white/80 hover:bg-white/10 hover:!text-white font-medium"
      } ${isCollapsed ? "justify-center h-12 w-12 mx-auto rounded-full" : "pl-4 pr-3 py-3"}`}
    >
      <div className="flex items-center gap-3">
        <Icon
          size={18}
          className={`transition-colors duration-200 ${
            isOpen ? "!text-white" : "!text-white/70 group-hover:!text-white"
          }`}
        />
        {!isCollapsed && <span className="text-[14px]">{label}</span>}
      </div>
      {!isCollapsed && (
        <ChevronRight
          size={14}
          className={`transition-transform duration-300 ${
            isOpen ? `rotate-90 !text-white` : "!text-white/70 group-hover:!text-white"
          }`}
        />
      )}
    </button>

    {!isCollapsed && (
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100 mt-1.5" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="ml-5 border-l-2 border-white/10 pl-2 py-1 space-y-1">
            {children}
          </div>
        </div>
      </div>
    )}
  </div>
);

/* ── SubLink ── */
const SubLink = ({ to, label, isActive }) => (
  <Link
    to={to}
    className={`group flex items-center gap-3 pl-4 pr-2 py-2.5 rounded-l-full rounded-r-none text-[14px] transition-all duration-200 ${
      isActive
        ? `!bg-[#F8FAFC] !text-[#445A95] font-bold`
        : "!text-white/80 hover:!text-white hover:bg-white/10 font-medium"
    }`}
  >
    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
      isActive ? "bg-[#445A95]" : "bg-white/40 group-hover:bg-white"
    }`} />
    {label}
  </Link>
);

/* ── Section Header ── */
const Section = ({ label }) => (
  <p className="text-[10px] font-bold text-white/70 uppercase ml-3 tracking-[0.15em] mb-2 mt-5 select-none">
    {label}
  </p>
);

/* ════════════════════════════════════════════
   TEACHER SIDEBAR COMPONENT
════════════════════════════════════════════ */
const TeacherSideBar = ({ layoutProps }) => {
  const { isCollapsed, toggleSidebar, logout, basePath = "/teacher" } = layoutProps;
  const location = useLocation();
  const p = location.pathname;
  const { count: feedbackCount } = useFeedbackCount();

  const [openGrading, setOpenGrading] = useState(p.includes(`${basePath}/submissions`));
  const [openBank, setOpenBank]       = useState(p.includes(`${basePath}/bank`) || p.includes(`${basePath}/listening`) || p.includes(`${basePath}/reading`) || p.includes(`${basePath}/writing`) || p.includes(`${basePath}/speaking`) || p.includes(`${basePath}/grammar`));
  const [openLib, setOpenLib]         = useState(p.includes(`${basePath}/library`) || p.includes(`${basePath}/skills`));

  const border = "border-transparent";
  const bg = "bg-[#445A95]";

  return (
    <aside
      className={`flex flex-col transition-all duration-300 ease-in-out shadow-sm ${bg} text-white z-50 relative ${
        isCollapsed ? "w-[72px]" : "w-[252px]"
      }`}
    >
      {/* ── BRANDING ── */}
      <div className={`h-[68px] flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} border-b ${border} shrink-0 bg-white/10`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white overflow-hidden shadow-sm flex items-center justify-center shrink-0 p-0.5">
              <img src="/logo.jpg" alt="Greenwich Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[18px] font-extrabold tracking-tight text-white leading-tight m-0">
                Aptis<span className="text-white/80 font-bold ml-1 text-[16px]">Teacher</span>
              </h1>
              <span className="text-[10px] text-white/70 font-semibold tracking-[0.15em] uppercase">
                Workspace
              </span>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors focus:outline-none"
        >
          {isCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </div>

      {/* ── NAV ── */}
      <nav className="flex-1 pl-4 pr-0 py-5 space-y-1 overflow-y-auto custom-scrollbar">

        {/* HOME */}
        {!isCollapsed && <Section label="Home" />}
        <NavItem
          to={`${basePath}/dashboard`}
          icon={LayoutDashboard}
          label="Dashboard"
          isActive={p === `${basePath}/dashboard`}
          isCollapsed={isCollapsed}
        />

        {/* CLASSROOM */}
        {!isCollapsed && <Section label="Classroom" />}
        <NavItem
          to={`${basePath}/users`}
          icon={Users}
          label="Students"
          isActive={p === `${basePath}/users`}
          isCollapsed={isCollapsed}
        />
        <NavItem
          to={`${basePath}/feedback`}
          icon={MessageSquare}
          label="Feedback"
          isActive={p.startsWith(`${basePath}/feedback`)}
          isCollapsed={isCollapsed}
          badge={feedbackCount}
        />
        <DropdownMenu
          icon={ClipboardList}
          label="Gradebook"
          isOpen={openGrading}
          onToggle={() => setOpenGrading(v => !v)}
          isCollapsed={isCollapsed}
        >
          <SubLink to={`${basePath}/submissions`}           label="Full Test"    isActive={p === `${basePath}/submissions`} />
          <SubLink to={`${basePath}/submissions/listening`} label="Listening"    isActive={p.includes(`${basePath}/submissions/listening`)} />
          <SubLink to={`${basePath}/submissions/reading`}   label="Reading"      isActive={p.includes(`${basePath}/submissions/reading`)} />
          <SubLink to={`${basePath}/submissions/grammar-vocab`} label="Grammar"  isActive={p.includes(`${basePath}/submissions/grammar`)} />
          <SubLink to={`${basePath}/submissions/writing`}   label="Writing"      isActive={p.includes(`${basePath}/submissions/writing`)} />
          <SubLink to={`${basePath}/submissions/speaking`}  label="Speaking"     isActive={p.includes(`${basePath}/submissions/speaking`)} />
        </DropdownMenu>

        {/* RESOURCES */}
        {!isCollapsed && <Section label="Resources" />}
        <NavItem
          to={`${basePath}/tips`}
          icon={Lightbulb}
          label="Exam Tips & Guide"
          isActive={p.startsWith(`${basePath}/tips`)}
          isCollapsed={isCollapsed}
        />
        <NavItem
          to={`${basePath}/full-tests`}
          icon={FileText}
          label="Full Test"
          isActive={p === `${basePath}/full-tests`}
          isCollapsed={isCollapsed}
        />
        <DropdownMenu
          icon={BookMarked}
          label="Exam Bank"
          isOpen={openBank}
          onToggle={() => setOpenBank(v => !v)}
          isCollapsed={isCollapsed}
        >
          <SubLink to={`${basePath}/grammar_vocab/bank`} label="Grammar & Vocab" isActive={p.includes(`${basePath}/grammar_vocab/bank`)} />
          <SubLink to={`${basePath}/reading/bank`}      label="Reading"         isActive={p.includes(`${basePath}/reading/bank`)} />
          <SubLink to={`${basePath}/listening/bank`}    label="Listening"       isActive={p.includes(`${basePath}/listening/bank`)} />
          <SubLink to={`${basePath}/writing/bank`}      label="Writing"         isActive={p.includes(`${basePath}/writing/bank`)} />
          <SubLink to={`${basePath}/speaking/bank`}     label="Speaking"        isActive={p.includes(`${basePath}/speaking/bank`)} />
        </DropdownMenu>
        <DropdownMenu
          icon={Library}
          label="Exam Library"
          isOpen={openLib}
          onToggle={() => setOpenLib(v => !v)}
          isCollapsed={isCollapsed}
        >
          {["grammar-vocab", "reading", "listening", "writing", "speaking"].map(skill => {
            const isSkillActive = p.includes(`${basePath}/${skill}`) && !p.includes(`${basePath}/submissions`) && !p.includes("bank");
            return (
              <SubLink
                key={skill}
                to={`${basePath}/${skill}`}
                label={skill === "grammar-vocab" ? "Grammar & Vocab" : skill.charAt(0).toUpperCase() + skill.slice(1)}
                isActive={isSkillActive}
              />
            );
          })}
        </DropdownMenu>
      </nav>

      {/* ── SIGN OUT ── */}
      <div className={`p-3 border-t ${border} shrink-0 ${bg}`}>
        <button
          onClick={logout}
          title={isCollapsed ? "Sign Out" : ""}
          className={`flex items-center gap-3 w-full rounded-xl transition-all duration-200 ${
            isCollapsed ? "justify-center h-11" : "px-4 py-2.5"
          } text-white/80 hover:text-rose-600 hover:bg-rose-500/10 font-medium group`}
        >
          <LogOut size={17} className="group-hover:-translate-x-0.5 transition-transform" />
          {!isCollapsed && <span className="text-[14px]">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default TeacherSideBar;
