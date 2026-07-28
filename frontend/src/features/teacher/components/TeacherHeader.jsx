import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserCircle, Clock } from "lucide-react";
import { useTeacherLayout } from "../hooks/useTeacherLayout";

export default function TeacherHeader() {
  const location = useLocation();
  const { admin } = useTeacherLayout();

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = (pathname) => {
    if (pathname.includes('/users')) return 'Student Management';
    if (pathname.includes('/profile')) return 'Teacher Profile';
    
    if (pathname.includes('/submissions')) {
      if (pathname.includes('/listening')) return 'Listening Gradebook';
      if (pathname.includes('/reading')) return 'Reading Gradebook';
      if (pathname.includes('/writing')) return 'Writing Gradebook';
      if (pathname.includes('/speaking')) return 'Speaking Gradebook';
      if (pathname.includes('/grammar-vocab') || pathname.includes('/grammar_vocab')) return 'Grammar & Vocab Gradebook';
      return 'Full Test Gradebook';
    }
    
    if (pathname.includes('/bank')) {
      if (pathname.includes('/listening')) return 'Listening Bank';
      if (pathname.includes('/reading')) return 'Reading Bank';
      if (pathname.includes('/writing')) return 'Writing Bank';
      if (pathname.includes('/speaking')) return 'Speaking Bank';
      if (pathname.includes('/grammar-vocab') || pathname.includes('/grammar_vocab')) return 'Grammar & Vocab Bank';
      return 'Question Bank';
    }

    if (pathname.includes('/listening')) return 'Listening Tests';
    if (pathname.includes('/reading')) return 'Reading Tests';
    if (pathname.includes('/writing')) return 'Writing Tests';
    if (pathname.includes('/speaking')) return 'Speaking Tests';
    if (pathname.includes('/grammar-vocab') || pathname.includes('/grammar_vocab')) return 'Grammar & Vocab Tests';
    if (pathname.includes('/full-tests')) return 'Full Tests';

    return 'Dashboard';
  };

  /* ── initials / last name ── */
  const initials = admin?.full_name
    ?.split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();
  const lastName = admin?.full_name?.split(" ").at(-1);

  return (
    <header className="sticky top-0 z-40 w-full h-[76px] bg-white border-b border-zinc-200/80 shadow-sm flex items-center px-6 shrink-0 transition-all">
      <div className="flex-1 flex items-center justify-between">
        
        {/* LEFT: Time & Title */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-zinc-500">
            <Clock size={16} className="text-zinc-400" />
            <span className="text-[13px] tracking-wider font-semibold">
              {time.toLocaleTimeString("en-GB")}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-lg border border-zinc-200/50">
            <span className="text-sm font-semibold text-zinc-700 capitalize tracking-wide">
              {getPageTitle(location.pathname)}
            </span>
          </div>
        </div>

        {/* RIGHT: User Profile */}
        <div className="flex items-center gap-4">
          <Link to="/teacher/profile" className="group flex items-center gap-3 bg-zinc-50 hover:bg-teal-50 px-3 py-1.5 rounded-xl border border-zinc-200 hover:border-teal-200 transition-all">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-zinc-900 group-hover:text-teal-700 transition-colors leading-tight">
                {lastName || "Teacher"}
              </span>
              <span className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider">
                Teacher
              </span>
            </div>
            {admin?.avatar_url ? (
              <img
                src={admin.avatar_url}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-teal-100 transition-all"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-sm border-2 border-white group-hover:border-teal-100 transition-all">
                {initials ? (
                  <span className="text-sm font-bold tracking-wider">{initials}</span>
                ) : (
                  <UserCircle size={20} strokeWidth={2.5} />
                )}
              </div>
            )}
          </Link>
        </div>
        
      </div>
    </header>
  );
}
