import React from "react";
import { Layout, Avatar, Dropdown, Space, Button } from "antd";
import {
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  BookOutlined,
  ReadOutlined,
  ClockCircleOutlined,
  WifiOutlined,
  DisconnectOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useAdminHeader } from "../../hooks/AdminLayout/useAdminHeader";
import { useAdminLayout } from "../../hooks/AdminLayout/useAdminLayout";

const { Header } = Layout;

/* ─── tiny inline styles kept as constants to stay under 180 lines ─── */

const HDR = {
  height: 56,
  padding: "0 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "linear-gradient(90deg,#0f0c29 0%,#1a1760 55%,#0f0c29 100%)",
  borderBottom: "1px solid rgba(139,92,246,.25)",
  boxShadow: "0 1px 24px rgba(109,40,217,.35)",
  position: "sticky",
  top: 0,
  zIndex: 50,
};

const PILL = (active) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 14px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  cursor: "pointer",
  transition: "all .2s",
  border: active
    ? "1px solid rgba(167,139,250,.6)"
    : "1px solid rgba(255,255,255,.1)",
  background: active
    ? "linear-gradient(135deg,rgba(139,92,246,.35),rgba(99,102,241,.25))"
    : "transparent",
  color: active ? "#c4b5fd" : "rgba(255,255,255,.45)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
});

const STATUS_DOT = (ok) => ({
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: ok ? "#34d399" : "#f87171",
  boxShadow: ok
    ? "0 0 0 3px rgba(52,211,153,.25)"
    : "0 0 0 3px rgba(248,113,113,.25)",
  flexShrink: 0,
});

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
          <Space>
            <SettingOutlined />
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
        <Space onClick={logout}>
          <LogoutOutlined />
          Sign Out
        </Space>
      ),
    },
  ];

  return (
    <Header style={HDR}>

      {/* ── LEFT: clock + status ── */}
      <Space size={16}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ClockCircleOutlined style={{ color: "rgba(196,181,253,.7)", fontSize: 13 }} />
          <span style={{ color: "#e2e8f0", fontFamily: "'DM Mono',monospace", fontSize: 13, letterSpacing: "0.06em", fontWeight: 500 }}>
            {time.toLocaleTimeString("en-GB")}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={STATUS_DOT(isBackendHealthy)} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: isBackendHealthy ? "#6ee7b7" : "#fca5a5" }}>
            {isBackendHealthy ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </Space>

      {/* ── CENTER: module switcher ── */}
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
        <Link to="/admin/dashboard">
          <div style={PILL(!isAptis)}>
            <BookOutlined style={{ fontSize: 12 }} />
            IELTS
          </div>
        </Link>
        <Link to="/admin/aptis/dashboard">
          <div style={PILL(isAptis)}>
            <ReadOutlined style={{ fontSize: 12 }} />
            APTIS
          </div>
        </Link>
      </div>

      {/* ── RIGHT: avatar dropdown ── */}
      <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
        <Button
          type="text"
          style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(226,232,240,.9)", fontWeight: 600, fontFamily: "'DM Sans',sans-serif", fontSize: 13, border: "1px solid rgba(139,92,246,.2)", borderRadius: 999, padding: "4px 10px 4px 6px", height: "auto", background: "rgba(139,92,246,.08)", backdropFilter: "blur(6px)" }}
        >
          <Avatar
            size={28}
            src={admin?.avatar_url}
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", fontWeight: 700, fontSize: 11, flexShrink: 0 }}
          >
            {admin?.avatar_url ? null : initials || <UserOutlined />}
          </Avatar>
          {lastName}
          <DownOutlined style={{ fontSize: 10, opacity: 0.6 }} />
        </Button>
      </Dropdown>

    </Header>
  );
}