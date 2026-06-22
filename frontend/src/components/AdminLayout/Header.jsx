import React from "react";
import { Layout, Avatar, Space } from "antd";
import {
  UserOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useAdminHeader } from "../../hooks/AdminLayout/useAdminHeader";

const { Header } = Layout;

export default function AntdAdminHeader() {
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

  /* ── no dropdown anymore ── */

  return (
    <Header className="h-[76px] px-8 lg:px-12 flex items-center justify-between sticky top-0 z-50 !bg-[#0B0F19] border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
      
      {/* ── LEFT: STATUS & TIME ── */}
      <div className="flex-1 flex justify-start items-center gap-6 pl-4">
        {/* Time Display */}
        <div className="flex items-center gap-2">
          <ClockCircleOutlined style={{ color: 'white', fontSize: '16px', filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} />
          <span className="text-white text-[13px] tracking-wider font-bold drop-shadow-sm">
            {time.toLocaleTimeString("en-GB")}
          </span>
        </div>

        {/* Health Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-inner backdrop-blur-sm">
          <span className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'} animate-pulse`} />
          <span className={`text-[10px] tracking-[0.1em] uppercase font-bold ${isBackendHealthy ? "text-emerald-400" : "text-rose-500"}`}>
            {isBackendHealthy ? "SYS ONLINE" : "SYS ERROR"}
          </span>
        </div>
      </div>

      {/* ── CENTER: MODULE SWITCHER ── */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-2 p-1.5 bg-[#050810] rounded-2xl border border-white/5 shadow-inner">
          <Link to="/admin/dashboard" className="block">
            <div className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black tracking-[0.2em] transition-all duration-500 ${
              !isAptis 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-blue-400/50' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
            }`}>
              <DatabaseOutlined className={!isAptis ? "text-blue-200" : ""} />
              IELTS
            </div>
          </Link>
          <Link to="/admin/aptis/dashboard" className="block">
            <div className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black tracking-[0.2em] transition-all duration-500 ${
              isAptis 
                ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-orange-400/50' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
            }`}>
              <DatabaseOutlined className={isAptis ? "text-orange-200" : ""} />
              APTIS
            </div>
          </Link>
        </div>
      </div>

      {/* ── RIGHT: PROFILE ── */}
      <div className="flex-1 flex justify-end">
        <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="flex flex-col justify-center text-right">
            <span className="text-white font-black text-[13px] tracking-wide leading-tight group-hover:text-indigo-300 transition-colors">
              {lastName || "ADMIN"}
            </span>
            <span className="text-indigo-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-0.5">
              ADMIN
            </span>
          </div>
          <Avatar
            size={38}
            src={admin?.avatar_url}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.4)] border-2 border-indigo-300/50"
          >
            {admin?.avatar_url ? null : initials || <UserOutlined />}
          </Avatar>
        </div>
      </div>

    </Header>
  );
}