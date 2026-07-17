import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Table,
  Avatar,
  Button,
  Select,
  Space,
  Typography,
  Card,
  Spin,
  Empty,
  Popconfirm
} from 'antd';

import {
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  UserOutlined
} from '@ant-design/icons';

import { Search, Users, UserCheck, UserX, GraduationCap } from 'lucide-react';

import { useAdminUsers } from '../../hooks/users/useAdminUsers';
import { useUserFilter } from '../../hooks/users/useUserFilters';
import UserFilterBar from '../../components/users_management/UserFilterBar';

const { Title, Text } = Typography;
const { Option } = Select;

/* ================= COLOR MAP ================= */

const ROLE_COLOR = {
  admin: 'purple',
  student: 'blue',
  teacher: 'orange'
};

const STATUS_COLOR = {
  active: '#10b981',
  inactive: '#ef4444'
};

/* ================= TEACHER STUDENT CARD ================= */

const StudentRow = ({ user }) => (
  <div className="flex items-center justify-between px-5 py-4 hover:bg-orange-50/40 transition-colors duration-200 border-b border-zinc-100 last:border-0 group">
    {/* Avatar + Info */}
    <div className="flex items-center gap-4 min-w-0 flex-1">
      <div className="relative shrink-0">
        <Avatar
          size={46}
          src={user.avatar_url}
          icon={!user.avatar_url && <UserOutlined />}
          className={!user.avatar_url ? 'bg-gradient-to-br from-orange-400 to-rose-500 text-white font-bold' : ''}
        >
          {!user.avatar_url && user.full_name?.[0]?.toUpperCase()}
        </Avatar>
        {/* Online indicator */}
        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${user.is_active ? 'bg-emerald-400' : 'bg-zinc-300'}`} />
      </div>

      <div className="min-w-0">
        <p className="font-bold text-zinc-900 text-[14px] leading-tight truncate">
          {user.full_name || '—'}
        </p>
        <p className="text-zinc-500 text-[12px] flex items-center gap-1 mt-0.5 truncate">
          <MailOutlined className="text-zinc-400 shrink-0" />
          {user.email}
        </p>
      </div>
    </div>

    {/* Status badge */}
    <div className="shrink-0 ml-4">
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${
        user.is_active
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
        {user.is_active ? 'Active' : 'Inactive'}
      </span>
    </div>
  </div>
);

/* ================= COMPONENT ================= */

const UserManagement = () => {
  const {
    users: rawUsers,
    loading,
    handleUpdateUser,
    handleDeleteUser
  } = useAdminUsers();

  const filterLogic = useUserFilter(rawUsers);
  const { filteredUsers } = filterLogic;

  const location = useLocation();
  const isTeacher = location.pathname.startsWith('/teacher');

  // For teacher: only show students (hide admin and teacher accounts)
  const displayedUsers = isTeacher
    ? filteredUsers.filter((u) => u.role?.toLowerCase() === 'student')
    : filteredUsers;

  // Teacher search state (separate simple search, no role/status filter)
  const [teacherSearch, setTeacherSearch] = useState('');

  const teacherStudents = useMemo(() => {
    if (!rawUsers) return [];
    const students = rawUsers.filter((u) => u.role?.toLowerCase() === 'student');
    if (!teacherSearch.trim()) return students;
    const q = teacherSearch.toLowerCase();
    return students.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [rawUsers, teacherSearch]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <span className="text-zinc-500 font-bold tracking-wide text-sm">Loading students...</span>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────
     TEACHER VIEW: Completely redesigned
  ───────────────────────────────────────── */
  if (isTeacher) {
    const activeCount = teacherStudents.filter((u) => u.is_active).length;
    const inactiveCount = teacherStudents.filter((u) => !u.is_active).length;

    return (
      <div className="max-w-[1100px] mx-auto animate-in fade-in zoom-in-95 duration-500 pb-10">

        {/* ── PAGE HEADER ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-orange-500 to-rose-500" />
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Students</h1>
          </div>
          <p className="text-zinc-500 text-sm ml-5 font-medium">
            All students enrolled in your APTIS class
          </p>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 ring-1 ring-zinc-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-orange-50 rounded-xl ring-1 ring-orange-100">
              <Users size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Total</p>
              <p className="text-2xl font-black text-zinc-900">{rawUsers?.filter(u => u.role?.toLowerCase() === 'student').length || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 ring-1 ring-zinc-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-emerald-50 rounded-xl ring-1 ring-emerald-100">
              <UserCheck size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Active</p>
              <p className="text-2xl font-black text-zinc-900">{activeCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 ring-1 ring-zinc-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-zinc-50 rounded-xl ring-1 ring-zinc-100">
              <UserX size={20} className="text-zinc-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Inactive</p>
              <p className="text-2xl font-black text-zinc-900">{inactiveCount}</p>
            </div>
          </div>
        </div>

        {/* ── SEARCH BAR ── */}
        <div className="bg-white rounded-2xl px-5 py-4 ring-1 ring-zinc-200/60 shadow-sm mb-4 flex items-center gap-3">
          <Search size={18} className="text-zinc-400 shrink-0" />
          <input
            type="text"
            value={teacherSearch}
            onChange={(e) => setTeacherSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 bg-transparent text-[14px] text-zinc-800 placeholder:text-zinc-400 outline-none font-medium"
          />
          {teacherSearch && (
            <button
              onClick={() => setTeacherSearch('')}
              className="text-zinc-400 hover:text-zinc-700 transition-colors text-xs font-bold px-2 py-0.5 rounded-lg hover:bg-zinc-100"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── STUDENT LIST ── */}
        <div className="bg-white rounded-2xl ring-1 ring-zinc-200/60 shadow-sm overflow-hidden">
          {/* List header */}
          <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
              Student
            </span>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
              Status
            </span>
          </div>

          {teacherStudents.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                <GraduationCap size={28} className="text-zinc-400" />
              </div>
              <p className="text-zinc-700 font-bold text-base mb-1">No students found</p>
              <p className="text-zinc-400 text-sm">
                {teacherSearch ? 'Try a different search term' : 'No students enrolled yet'}
              </p>
            </div>
          ) : (
            teacherStudents.map((user) => (
              <StudentRow key={user.id} user={user} />
            ))
          )}
        </div>

        {/* Result count */}
        {teacherStudents.length > 0 && (
          <p className="text-center text-xs text-zinc-400 font-medium mt-4">
            Showing {teacherStudents.length} student{teacherStudents.length !== 1 ? 's' : ''}
            {teacherSearch ? ` matching "${teacherSearch}"` : ''}
          </p>
        )}
      </div>
    );
  }

  /* ─────────────────────────────────────────
     ADMIN VIEW: Original layout (unchanged)
  ───────────────────────────────────────── */

  /* ================= TABLE ================= */
  const baseColumns = [
    {
      title: 'Student',
      key: 'student',
      render: (_, user) => (
        <Space size="middle">
          <Avatar
            size={48}
            src={user.avatar_url}
            icon={!user.avatar_url && <UserOutlined />}
            className={!user.avatar_url ? "bg-gradient-to-br from-indigo-500 to-purple-600" : ""}
          >
            {!user.avatar_url && user.full_name?.[0]}
          </Avatar>

          <div>
            <Text className="font-bold text-gray-800 block text-sm">
              {user.full_name}
            </Text>
            <Text className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MailOutlined className="text-gray-400" /> {user.email}
            </Text>
          </div>
        </Space>
      )
    },

    {
      title: 'Role',
      key: 'role',
      render: (_, user) => (
        <Space>
          <span className={`px-2 py-0.5 rounded-md font-semibold tracking-wide text-xs ${
            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
            user.role === 'teacher' ? 'bg-orange-100 text-orange-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {user.role?.toUpperCase()}
          </span>

          <Select
            value={user.role}
            size="small"
            onChange={(value) => handleUpdateUser(user.id, { role: value })}
            className="w-[110px]"
          >
            <Option value="student">Student</Option>
            <Option value="teacher">Teacher</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Space>
      )
    },

    {
      title: 'Status',
      key: 'status',
      render: (_, user) => (
        <Popconfirm
          title={user.is_active ? "Suspend User" : "Activate User"}
          description={`Are you sure you want to ${user.is_active ? 'suspend' : 'activate'} this user?`}
          onConfirm={() => handleUpdateUser(user.id, { is_active: !user.is_active })}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="text"
            className="font-bold transition-transform hover:scale-105"
            style={{ color: user.is_active ? STATUS_COLOR.active : STATUS_COLOR.inactive }}
            icon={user.is_active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          >
            {user.is_active ? 'Active' : 'Suspended'}
          </Button>
        </Popconfirm>
      )
    }
  ];

  const columns = [
    ...baseColumns,
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, user) => (
        <Popconfirm
          title="Delete User"
          description="Are you sure you want to delete this user? This action cannot be undone."
          onConfirm={() => handleDeleteUser(user.id)}
          okText="Yes"
          cancelText="No"
          placement="left"
        >
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            className="rounded-lg hover:bg-red-50 hover:scale-110 transition-all duration-200"
          />
        </Popconfirm>
      )
    }
  ];

  return (
    <div className="max-w-[1440px] mx-auto animate-fade-in">

      {/* ================= HEADER ================= */}
      <div className="relative overflow-hidden rounded-[32px] mb-8 p-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 shadow-2xl shadow-indigo-500/20">
        <div className="relative z-10">
          <Title level={2} className="!text-white !mb-2 !font-extrabold tracking-tight drop-shadow-md">
            User Management
          </Title>
          <Text className="!text-indigo-100 text-lg font-medium tracking-wide">
            Manage student accounts, roles and status
          </Text>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl mix-blend-overlay animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-white opacity-5 blur-2xl mix-blend-overlay" />
      </div>

      {/* ================= FILTER ================= */}
      <Card
        bordered={false}
        className="mb-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 bg-white"
        styles={{ body: { padding: '24px' } }}
      >
        <UserFilterBar filterLogic={filterLogic} />
      </Card>

      {/* ================= TABLE ================= */}
      <Card
        bordered={false}
        className="rounded-[24px] shadow-sm hover:shadow-xl transition-shadow duration-500 border border-gray-100 bg-white overflow-hidden"
        styles={{ body: { padding: '0px' } }}
      >
        <div className="p-1">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={displayedUsers}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              className: "px-6 py-4 mb-0"
            }}
            rowClassName={() => 'hover:bg-indigo-50/50 cursor-pointer transition-colors'}
            locale={{
              emptyText: <Empty description="No users found" className="py-12" />
            }}
          />
        </div>
      </Card>

    </div>
  );
};

export default UserManagement;