import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Table,
  Avatar,
  Button,
  Select,
  Space,
  Popconfirm,
  Tooltip,
  Tag,
  Switch,
  Input
} from 'antd';

import {
  DeleteOutlined,
  MailOutlined,
  UserOutlined,
  SearchOutlined,
  DownloadOutlined
} from '@ant-design/icons';

import { Users, UserCheck, UserX, BookOpen, ShieldAlert } from 'lucide-react';

import { useAdminUsers } from '../../hooks/users/useAdminUsers';
import ImportStudentModal from '../../components/users_management/ImportStudentModal';
import AssignClassesModal from '../../components/users_management/AssignClassesModal';

const { Option } = Select;

/* ================= TEACHER STUDENT ROW ================= */

const StudentRow = ({ user }) => (
  <div className="flex items-center justify-between px-5 py-4 hover:bg-orange-50/40 transition-colors duration-200 border-b border-zinc-100 last:border-0">
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
        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${user.is_active ? 'bg-emerald-400' : 'bg-zinc-300'}`} />
      </div>

      <div className="min-w-0">
        <p className="font-bold text-zinc-900 text-[14px] leading-tight truncate">
          {user.full_name || '—'}
          {user.student_id && <span className="ml-2 text-zinc-400 font-normal text-xs">({user.student_id})</span>}
        </p>
        <p className="text-zinc-500 text-[12px] flex items-center gap-1 mt-0.5 truncate">
          <MailOutlined className="text-zinc-400 shrink-0" />
          {user.email}
          {user.class_code && (
            <span className="ml-2 bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
              {user.class_code}
            </span>
          )}
        </p>
      </div>
    </div>

    <div className="shrink-0 ml-4">
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${
        user.is_active
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-red-50 text-red-600 ring-1 ring-red-200'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-400'}`} />
        {user.is_active ? 'Active' : 'Suspended'}
      </span>
    </div>
  </div>
);

/* ================= MAIN COMPONENT ================= */

const UserManagement = () => {
  const location = useLocation();
  const isTeacher = location.pathname.startsWith('/teacher');

  const {
    users: rawUsers,
    loading,
    handleUpdateUser,
    handleDeleteUser,
    handleImportStudents,
    handleAssignClassesToTeacher
  } = useAdminUsers(isTeacher);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Admin filters
  const [adminSearch, setAdminSearch] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('');

  // Teacher filters
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherClassFilter, setTeacherClassFilter] = useState('');

  // Unique classes derived from data
  const uniqueClasses = useMemo(() => {
    if (!rawUsers) return [];
    return [...new Set(rawUsers.map(u => u.class_code).filter(Boolean))].sort();
  }, [rawUsers]);

  // Admin computed list
  const adminDisplayedUsers = useMemo(() => {
    if (!rawUsers) return [];
    let list = rawUsers;
    if (adminRoleFilter) list = list.filter(u => u.role === adminRoleFilter);
    if (adminStatusFilter === 'active') list = list.filter(u => u.is_active);
    if (adminStatusFilter === 'suspended') list = list.filter(u => !u.is_active);
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase();
      list = list.filter(u =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.student_id?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [rawUsers, adminSearch, adminRoleFilter, adminStatusFilter]);

  // Teacher computed list
  const teacherStudents = useMemo(() => {
    if (!rawUsers) return [];
    let students = rawUsers.filter(u => u.role?.toLowerCase() === 'student');
    if (teacherClassFilter) students = students.filter(u => u.class_code === teacherClassFilter);
    if (teacherSearch.trim()) {
      const q = teacherSearch.toLowerCase();
      students = students.filter(u =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.student_id?.toLowerCase().includes(q)
      );
    }
    return students;
  }, [rawUsers, teacherSearch, teacherClassFilter]);

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
          <span className="text-zinc-500 font-semibold text-sm">Loading users...</span>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────
     TEACHER VIEW
  ────────────────────────────────────── */
  if (isTeacher) {
    const activeCount = teacherStudents.filter(u => u.is_active).length;
    const inactiveCount = teacherStudents.filter(u => !u.is_active).length;

    return (
      <div className="max-w-[1100px] mx-auto pb-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-orange-500 to-rose-500" />
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">My Students</h1>
          </div>
          <p className="text-zinc-500 text-sm ml-5 font-medium">Students in your assigned classes</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total', value: rawUsers?.filter(u => u.role?.toLowerCase() === 'student').length || 0, icon: <Users size={20} />, colors: 'bg-orange-50 text-orange-500' },
            { label: 'Active', value: activeCount, icon: <UserCheck size={20} />, colors: 'bg-emerald-50 text-emerald-500' },
            { label: 'Suspended', value: inactiveCount, icon: <UserX size={20} />, colors: 'bg-red-50 text-red-400' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-2xl p-5 ring-1 ring-zinc-200/60 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl ${item.colors.split(' ')[0]}`}>
                <span className={item.colors.split(' ')[1]}>{item.icon}</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-2xl font-black text-zinc-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 bg-white rounded-2xl px-5 py-4 ring-1 ring-zinc-200/60 shadow-sm flex items-center gap-3">
            <SearchOutlined className="text-zinc-400" />
            <input
              type="text"
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              placeholder="Search by name, email or student ID..."
              className="flex-1 bg-transparent text-[14px] text-zinc-800 placeholder:text-zinc-400 outline-none font-medium"
            />
            {teacherSearch && (
              <button onClick={() => setTeacherSearch('')} className="text-zinc-400 hover:text-zinc-700 text-xs font-bold px-2 py-0.5 rounded-lg hover:bg-zinc-100">Clear</button>
            )}
          </div>
          <div className="w-full sm:w-56 bg-white rounded-2xl p-2 ring-1 ring-zinc-200/60 shadow-sm">
            <Select
              allowClear
              placeholder="Filter by Class"
              value={teacherClassFilter || undefined}
              onChange={(val) => setTeacherClassFilter(val || '')}
              className="w-full"
              variant="borderless"
              size="large"
            >
              {uniqueClasses.map(cls => <Option key={cls} value={cls}>{cls}</Option>)}
            </Select>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-2xl ring-1 ring-zinc-200/60 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-100 flex justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Student</span>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Status</span>
          </div>
          {teacherStudents.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                <Users size={28} className="text-zinc-400" />
              </div>
              <p className="text-zinc-700 font-bold text-base mb-1">No students found</p>
              <p className="text-zinc-400 text-sm">
                {teacherSearch || teacherClassFilter ? 'Try different search terms' : 'No students enrolled yet'}
              </p>
            </div>
          ) : (
            teacherStudents.map(user => <StudentRow key={user.id} user={user} />)
          )}
        </div>

        {teacherStudents.length > 0 && (
          <p className="text-center text-xs text-zinc-400 font-medium mt-4">
            Showing {teacherStudents.length} student{teacherStudents.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    );
  }

  /* ──────────────────────────────────────
     ADMIN VIEW — clean modern design
  ────────────────────────────────────── */
  const totalCount = rawUsers?.length || 0;
  const totalStudents = rawUsers?.filter(u => u.role === 'student').length || 0;
  const totalTeachers = rawUsers?.filter(u => u.role === 'teacher').length || 0;
  const totalSuspended = rawUsers?.filter(u => !u.is_active).length || 0;

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, user) => (
        <div className="flex items-center gap-3 py-0.5">
          <div className="relative">
            <Avatar
              size={40}
              src={user.avatar_url}
              icon={!user.avatar_url && <UserOutlined />}
              style={!user.avatar_url ? {
                background: user.role === 'admin'
                  ? 'linear-gradient(135deg,#7c3aed,#4f46e5)'
                  : user.role === 'teacher'
                  ? 'linear-gradient(135deg,#f97316,#ef4444)'
                  : 'linear-gradient(135deg,#3b82f6,#6366f1)',
              } : {}}
            >
              {!user.avatar_url && user.full_name?.[0]?.toUpperCase()}
            </Avatar>
            {!user.is_active && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm leading-tight">
              {user.full_name || '—'}
              {user.student_id && <span className="ml-1.5 text-gray-400 font-normal text-xs">#{user.student_id}</span>}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
          </div>
        </div>
      )
    },
    {
      title: 'Class',
      key: 'class_code',
      width: 160,
      render: (_, user) => {
        if (user.class_code) return <Tag color="blue" className="font-semibold rounded-lg">{user.class_code}</Tag>;
        if (user.role === 'teacher' && user.managed_classes?.length > 0)
          return <div className="flex flex-wrap gap-1">{user.managed_classes.map(c => <Tag key={c} color="orange" className="text-xs">{c}</Tag>)}</div>;
        return <span className="text-gray-300 text-xs">—</span>;
      }
    },
    {
      title: 'Role',
      key: 'role',
      width: 130,
      render: (_, user) => (
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
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: 140,
      render: (_, user) => (
        <Popconfirm
          title={user.is_active ? 'Suspend this account?' : 'Activate this account?'}
          description={user.is_active
            ? 'The user will be immediately locked out.'
            : 'The user will be able to login again.'}
          onConfirm={() => handleUpdateUser(user.id, { is_active: !user.is_active })}
          okText="Confirm"
          cancelText="Cancel"
          okButtonProps={{ danger: user.is_active }}
        >
          <div className="flex items-center gap-2 cursor-pointer w-fit">
            <Switch
              checked={user.is_active}
              size="small"
              style={{ backgroundColor: user.is_active ? '#10b981' : '#ef4444', pointerEvents: 'none' }}
            />
            <span className={`text-xs font-semibold ${user.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
              {user.is_active ? 'Active' : 'Suspended'}
            </span>
          </div>
        </Popconfirm>
      )
    },
    {
      title: '',
      key: 'actions',
      width: 72,
      align: 'right',
      render: (_, user) => (
        <Space>
          {user.role === 'teacher' && (
            <Tooltip title="Assign Classes">
              <Button
                type="text"
                size="small"
                icon={<BookOpen size={15} />}
                className="text-zinc-400 hover:text-blue-500 hover:bg-blue-50"
                onClick={() => { setSelectedTeacher(user); setAssignModalVisible(true); }}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Delete user?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteUser(user.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            placement="left"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} className="hover:bg-red-50" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto pb-10">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">User Management</h1>
          <p className="text-zinc-400 text-sm mt-0.5 font-medium">Manage accounts, roles, classes and access control</p>
        </div>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => setIsImportModalOpen(true)}
          size="large"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', border: 'none', fontWeight: 600 }}
        >
          Import Students
        </Button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users',  value: totalCount,     icon: <Users size={18} />,      colors: 'bg-violet-50 text-violet-500' },
          { label: 'Students',     value: totalStudents,  icon: <UserCheck size={18} />,  colors: 'bg-blue-50 text-blue-500'   },
          { label: 'Teachers',     value: totalTeachers,  icon: <BookOpen size={18} />,   colors: 'bg-orange-50 text-orange-500' },
          { label: 'Suspended',    value: totalSuspended, icon: <ShieldAlert size={18} />,colors: 'bg-red-50 text-red-500'    },
        ].map(item => {
          const [bgClass, textClass] = item.colors.split(' ');
          return (
            <div key={item.label} className="bg-white rounded-2xl p-5 ring-1 ring-zinc-100 shadow-sm flex items-center gap-4">
              <div className={`p-2.5 rounded-xl ${bgClass}`}>
                <span className={textClass}>{item.icon}</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-2xl font-black text-zinc-900">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FILTER BAR ── */}
      <div className="bg-white rounded-2xl ring-1 ring-zinc-100 shadow-sm px-5 py-3.5 mb-4 flex flex-wrap items-center gap-3">
        <Input
          prefix={<SearchOutlined className="text-zinc-400" />}
          placeholder="Search name, email or student ID..."
          value={adminSearch}
          onChange={e => setAdminSearch(e.target.value)}
          allowClear
          className="flex-1 min-w-[200px]"
          variant="filled"
        />
        <Select
          allowClear
          placeholder="All Roles"
          value={adminRoleFilter || undefined}
          onChange={val => setAdminRoleFilter(val || '')}
          className="w-36"
        >
          <Option value="student">Student</Option>
          <Option value="teacher">Teacher</Option>
          <Option value="admin">Admin</Option>
        </Select>
        <Select
          allowClear
          placeholder="All Status"
          value={adminStatusFilter || undefined}
          onChange={val => setAdminStatusFilter(val || '')}
          className="w-36"
        >
          <Option value="active">Active</Option>
          <Option value="suspended">Suspended</Option>
        </Select>
        {(adminSearch || adminRoleFilter || adminStatusFilter) && (
          <Button size="small" type="text" onClick={() => { setAdminSearch(''); setAdminRoleFilter(''); setAdminStatusFilter(''); }} className="text-zinc-400 hover:text-zinc-700">
            Clear all
          </Button>
        )}
        <span className="ml-auto text-xs text-zinc-400 font-medium">
          {adminDisplayedUsers.length} result{adminDisplayedUsers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white rounded-2xl ring-1 ring-zinc-100 shadow-sm overflow-hidden">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={adminDisplayedUsers}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            className: 'px-6 py-3',
            showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} users`
          }}
          rowClassName={record =>
            `transition-colors ${!record.is_active ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-zinc-50'}`
          }
          size="middle"
        />
      </div>

      <ImportStudentModal
        visible={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportStudents}
      />

      <AssignClassesModal
        visible={assignModalVisible}
        onClose={() => { setAssignModalVisible(false); setSelectedTeacher(null); }}
        onAssign={handleAssignClassesToTeacher}
        user={selectedTeacher}
        availableClasses={uniqueClasses}
      />

    </div>
  );
};

export default UserManagement;