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
    <Header className="h-20 px-8 flex items-center justify-between sticky top-0 z-50 !bg-slate-950 border-b border-slate-800 shadow-lg shadow-black/20 transition-all duration-300 relative">

      {/* ── LEFT: clock + status (Terminal Style) ── */}
      <div className="flex-1 flex justify-start z-10 relative">
        <Space size={16}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 shadow-inner">
            <ClockCircleOutlined className="text-blue-500 text-xs" />
            <span className="text-blue-400 text-xs tracking-[0.1em] font-semibold">
              {time.toLocaleTimeString("en-GB")}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 shadow-inner">
            <span className={`w-2 h-2 rounded-sm shadow-[0_0_0_2px] ${isBackendHealthy ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20'} animate-pulse`} />
            <span className={`text-[10px] tracking-[0.15em] uppercase font-semibold ${isBackendHealthy ? "text-emerald-400" : "text-red-400"}`}>
              {isBackendHealthy ? "SYS:ONLINE" : "SYS:OFFLINE"}
            </span>
          </div>
        </Space>
      </div>

      {/* ── CENTER: module switcher (Data Control Style) ── */}
      <div className="flex-1 flex justify-center z-10 relative">
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 rounded-lg border border-slate-800 shadow-inner">
          <Link to="/admin/dashboard">
            <div className={`flex items-center gap-2 px-6 py-1.5 rounded-md text-[11px] font-semibold tracking-[0.15em] cursor-pointer transition-all duration-300 uppercase ${!isAptis ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
              <DatabaseOutlined className="text-xs" />
              IELTS
            </div>
          </Link>
          <Link to="/admin/aptis/dashboard">
            <div className={`flex items-center gap-2 px-6 py-1.5 rounded-md text-[11px] font-semibold tracking-[0.15em] cursor-pointer transition-all duration-300 uppercase ${isAptis ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.1)]' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
              <DatabaseOutlined className="text-xs" />
              APTIS
            </div>
          </Link>
        </div>
      </div>

      {/* ── RIGHT: avatar display (static) ── */}
      <div className="flex-1 flex justify-end z-10 relative">
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 shadow-inner">
          <Avatar
            size={28}
            src={admin?.avatar_url}
            className="bg-slate-800 border border-slate-700 text-blue-400 font-semibold text-[10px] uppercase shadow-sm rounded-md"
            shape="square"
          >
            {admin?.avatar_url ? null : initials || <UserOutlined />}
          </Avatar>
          <div className="flex flex-col justify-center">
            <span className="text-blue-100 font-semibold text-[10px] tracking-wider uppercase leading-none">
              {lastName || "ADMIN"}
            </span>
          </div>
        </div>
      </div>

    </Header>
  );
}