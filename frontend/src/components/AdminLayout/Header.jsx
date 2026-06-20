import React from "react";
import { Layout, Avatar, Dropdown, Space, Button } from "antd";
import {
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  BookOutlined,
  ReadOutlined,
  ClockCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useAdminHeader } from "../../hooks/AdminLayout/useAdminHeader";
import { useAdminLayout } from "../../hooks/AdminLayout/useAdminLayout";

const { Header } = Layout;

export default function AntdAdminHeader() {
  const { time, isBackendHealthy, admin } = useAdminHeader();
  const { logout } = useAdminLayout();
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

  /* ── dropdown items ── */
  const items = [
    {
      key: "profile",
      label: (
        <Link to={isAptis ? "/admin/aptis/profile" : "/admin/profile"}>
          <Space className="text-gray-700 font-medium px-2 py-1">
            <SettingOutlined className="text-indigo-500" />
            Profile Settings
          </Space>
        </Link>
      ),
    },
    { type: "divider" },
    {
      key: "logout",
      danger: true,
      label: (
        <Space onClick={logout} className="font-medium px-2 py-1 text-red-500">
          <LogoutOutlined />
          Sign Out
        </Space>
      ),
    },
  ];

  return (
    <Header className="h-16 px-6 flex items-center justify-between sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all duration-300">

      {/* ── LEFT: clock + status ── */}
      <Space size={20}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50/80 border border-gray-100 shadow-inner">
          <ClockCircleOutlined className="text-indigo-500 text-sm" />
          <span className="text-gray-700 font-mono text-sm tracking-widest font-semibold">
            {time.toLocaleTimeString("en-GB")}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50/80 border border-gray-100 shadow-inner">
          <span className={`w-2 h-2 rounded-full shadow-[0_0_0_3px] ${isBackendHealthy ? 'bg-emerald-400 shadow-emerald-400/20' : 'bg-rose-400 shadow-rose-400/20'}`} />
          <span className={`text-xs font-bold tracking-[0.15em] ${isBackendHealthy ? "text-emerald-600" : "text-rose-600"}`}>
            {isBackendHealthy ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </Space>

      {/* ── CENTER: module switcher ── */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 p-1 bg-gray-100/80 backdrop-blur-md rounded-full shadow-inner border border-gray-200/50">
        <Link to="/admin/dashboard">
          <div className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-bold tracking-widest cursor-pointer transition-all duration-300 ${!isAptis ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            <BookOutlined className="text-sm" />
            IELTS
          </div>
        </Link>
        <Link to="/admin/aptis/dashboard">
          <div className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-bold tracking-widest cursor-pointer transition-all duration-300 ${isAptis ? 'bg-white text-fuchsia-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            <ReadOutlined className="text-sm" />
            APTIS
          </div>
        </Link>
      </div>

      {/* ── RIGHT: avatar dropdown ── */}
      <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]} className="cursor-pointer">
        <div className="flex items-center gap-3 px-2 py-1 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors duration-200">
          <Avatar
            size={32}
            src={admin?.avatar_url}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md font-bold text-xs"
          >
            {admin?.avatar_url ? null : initials || <UserOutlined />}
          </Avatar>
          <span className="text-gray-700 font-semibold text-sm">
            {lastName}
          </span>
          <DownOutlined className="text-gray-400 text-[10px] mr-1" />
        </div>
      </Dropdown>

    </Header>
  );
}