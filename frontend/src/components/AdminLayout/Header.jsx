import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Clock, Activity, Zap, Sparkles, UserCircle } from "lucide-react";
import { useAdminHeader } from "../../hooks/AdminLayout/useAdminHeader";

export default function Header() {
  const { time, isBackendHealthy, admin } = useAdminHeader();
  const location = useLocation();
  const isAptis = location.pathname.includes("/aptis");

  /* ── initials / last name ── */
  const initials = admin?.full_name
    ?.split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();
  const lastName = admin?.full_name?.split(" ").at(-1);

  const isTeacher = admin?.role?.toLowerCase() === 'teacher' || admin?.role?.includes('TEACHER');

  return (
    <header className="h-[76px] px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 shadow-sm transition-all duration-300">
      
      {/* ── LEFT: STATUS & TIME ── */}
      <div className="flex-1 flex justify-start items-center gap-6">
        {/* Time Display */}
        <div className="flex items-center gap-2 text-zinc-500">
          <Clock size={16} className="text-zinc-400" />
          <span className="text-[13px] tracking-wider font-semibold">
            {time.toLocaleTimeString("en-GB")}
          </span>
        </div>

        {/* Health Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200">
          <span className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'} animate-pulse`} />
          <span className={`text-[10px] tracking-wider font-bold ${isBackendHealthy ? "text-emerald-600" : "text-rose-600"}`}>
            {isBackendHealthy ? "SYSTEM ONLINE" : "SYSTEM ERROR"}
          </span>
        </div>
      </div>

      {/* ── CENTER: MODULE SWITCHER ── */}
      <div className="flex-1 flex justify-center">
        {!isTeacher && (
          <div className="flex items-center p-1 bg-zinc-100/80 backdrop-blur-sm rounded-xl border border-zinc-200 shadow-inner">
            <Link to="/admin/dashboard" className="block focus:outline-none">
              <div className={`flex items-center justify-center px-6 py-2 rounded-lg text-[13px] font-bold tracking-wide transition-all duration-300 ${
                !isAptis 
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-zinc-200/50' 
                  : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'
              }`}>
                IELTS
              </div>
            </Link>
            <Link to="/admin/aptis/dashboard" className="block focus:outline-none">
              <div className={`flex items-center justify-center px-6 py-2 rounded-lg text-[13px] font-bold tracking-wide transition-all duration-300 ${
                isAptis 
                  ? 'bg-white text-orange-600 shadow-sm ring-1 ring-zinc-200/50' 
                  : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'
              }`}>
                APTIS
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* ── RIGHT: PROFILE ── */}
      <div className="flex-1 flex justify-end">
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 transition-colors cursor-pointer group shadow-sm">
          <div className="flex flex-col justify-center text-right pl-2">
            <span className="text-zinc-800 font-bold text-[13px] tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
              {lastName || (isTeacher ? "TEACHER" : "ADMIN")}
            </span>
            <span className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider mt-1">
              {isTeacher ? "Teacher" : "Administrator"}
            </span>
          </div>
          
          {admin?.avatar_url ? (
            <img 
              src={admin.avatar_url} 
              alt="Admin" 
              className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-zinc-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-zinc-200">
              {initials || <UserCircle size={20} />}
            </div>
          )}
        </div>
      </div>

    </header>
  );
}