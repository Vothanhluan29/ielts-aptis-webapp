import React, { useMemo, useState } from 'react';
import { Avatar, Button, Input, Popconfirm, Select, Space, Switch, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, DownloadOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { BookOpen, ShieldAlert, UserCheck, Users } from 'lucide-react';
import { PageContainer, PageHeader, StatCard, SurfaceCard } from '../../../../common-ui';
import ImportStudentModal from '../../components/users_management/ImportStudentModal';
import AssignClassesModal from '../../components/users_management/AssignClassesModal';

const { Option } = Select;

export default function AdminUsersPage({ users = [], onUpdateUser, onDeleteUser, onImportStudents, onAssignClasses }) {
  const [importOpen, setImportOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const classes = useMemo(() => [...new Set(users.map(user => user.class_code).filter(Boolean))].sort(), [users]);
  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter(user => {
      if (roleFilter && user.role !== roleFilter) return false;
      if (statusFilter === 'active' && !user.is_active) return false;
      if (statusFilter === 'suspended' && user.is_active) return false;
      return !query || [user.full_name, user.email, user.student_id].some(value => value?.toLowerCase().includes(query));
    });
  }, [users, search, roleFilter, statusFilter]);

  const columns = [
    {
      title: 'User', key: 'user', render: (_, user) => (
        <div className="flex items-center gap-3 py-0.5">
          <div className="relative">
            <Avatar size={40} src={user.avatar_url} icon={!user.avatar_url && <UserOutlined />} style={!user.avatar_url ? { background: user.role === 'admin' ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : user.role === 'teacher' ? 'linear-gradient(135deg,#f97316,#ef4444)' : 'linear-gradient(135deg,#3b82f6,#6366f1)' } : {}}>{!user.avatar_url && user.full_name?.[0]?.toUpperCase()}</Avatar>
            {!user.is_active && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-red-500" />}
          </div>
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-zinc-800">{user.full_name || '—'}{user.student_id && <span className="ml-1.5 text-xs font-normal text-zinc-400">#{user.student_id}</span>}</p><p className="mt-0.5 truncate text-xs text-zinc-500">{user.email}</p></div>
        </div>
      ),
    },
    {
      title: 'Class', key: 'class_code', width: 160, render: (_, user) => {
        if (user.role === 'student') return <Select mode="tags" allowClear placeholder="Assign class" value={user.class_code ? [user.class_code] : []} onChange={values => onUpdateUser(user.id, { class_code: values.length ? values[values.length - 1] : null })} className="w-full min-w-[110px]" size="small" options={classes.map(value => ({ label: value, value }))} />;
        if (user.role === 'teacher' && user.managed_classes?.length) return <div className="flex flex-wrap gap-1">{user.managed_classes.map(classCode => <Tag key={classCode} color="orange" className="text-xs">{classCode}</Tag>)}</div>;
        return <span className="text-xs text-zinc-300">—</span>;
      },
    },
    {
      title: 'Role', key: 'role', width: 130, render: (_, user) => (
        <Select value={user.role} size="small" onChange={value => onUpdateUser(user.id, { role: value })} className="w-[110px]">
          <Option value="student">Student</Option><Option value="teacher">Teacher</Option><Option value="admin">Admin</Option>
        </Select>
      ),
    },
    {
      title: 'Status', key: 'status', width: 145, render: (_, user) => (
        <Popconfirm title={user.is_active ? 'Suspend this account?' : 'Activate this account?'} description={user.is_active ? 'The user will be immediately locked out.' : 'The user will be able to login again.'} onConfirm={() => onUpdateUser(user.id, { is_active: !user.is_active })} okText="Confirm" cancelText="Cancel" okButtonProps={{ danger: user.is_active }}>
          <button type="button" className="flex items-center gap-2"><Switch checked={user.is_active} size="small" style={{ pointerEvents: 'none' }} /><span className={`text-xs font-semibold ${user.is_active ? 'text-emerald-600' : 'text-red-500'}`}>{user.is_active ? 'Active' : 'Suspended'}</span></button>
        </Popconfirm>
      ),
    },
    {
      title: '', key: 'actions', width: 76, align: 'right', render: (_, user) => (
        <Space>
          {user.role === 'teacher' && <Tooltip title="Assign Classes"><Button type="text" size="small" icon={<BookOpen size={15} />} onClick={() => { setSelectedTeacher(user); setAssignOpen(true); }} /></Tooltip>}
          <Popconfirm title="Delete user?" description="This action cannot be undone." onConfirm={() => onDeleteUser(user.id)} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }} placement="left"><Button type="text" size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
        </Space>
      ),
    },
  ];

  const clearFilters = () => { setSearch(''); setRoleFilter(''); setStatusFilter(''); };

  return (
    <PageContainer className="pb-10">
      <PageHeader title="User Management" description="Manage accounts, roles, classes and access control" actions={<Button type="primary" icon={<DownloadOutlined />} onClick={() => setImportOpen(true)}>Import Students</Button>} />
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={users.length} icon={Users} tone="violet" />
        <StatCard label="Students" value={users.filter(user => user.role === 'student').length} icon={UserCheck} tone="blue" />
        <StatCard label="Teachers" value={users.filter(user => user.role === 'teacher').length} icon={BookOpen} tone="amber" />
        <StatCard label="Suspended" value={users.filter(user => !user.is_active).length} icon={ShieldAlert} tone="red" />
      </div>
      <SurfaceCard className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 p-4 sm:p-5">
          <Input prefix={<SearchOutlined className="text-zinc-400" />} placeholder="Search name, email or student ID" value={search} onChange={event => setSearch(event.target.value)} allowClear className="min-w-[220px] flex-1" />
          <Select allowClear placeholder="All Roles" value={roleFilter || undefined} onChange={value => setRoleFilter(value || '')} className="w-36"><Option value="student">Student</Option><Option value="teacher">Teacher</Option><Option value="admin">Admin</Option></Select>
          <Select allowClear placeholder="All Status" value={statusFilter || undefined} onChange={value => setStatusFilter(value || '')} className="w-36"><Option value="active">Active</Option><Option value="suspended">Suspended</Option></Select>
          {(search || roleFilter || statusFilter) && <Button type="text" onClick={clearFilters}>Clear filters</Button>}
          <span className="ml-auto text-xs text-zinc-500">{visibleUsers.length} results</span>
        </div>
        <Table rowKey="id" columns={columns} dataSource={visibleUsers} scroll={{ x: 760 }} pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} users` }} rowClassName={user => `transition-colors ${!user.is_active ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-zinc-50'}`} />
      </SurfaceCard>
      <ImportStudentModal visible={importOpen} onClose={() => setImportOpen(false)} onImport={onImportStudents} />
      <AssignClassesModal visible={assignOpen} onClose={() => { setAssignOpen(false); setSelectedTeacher(null); }} onAssign={onAssignClasses} user={selectedTeacher} availableClasses={classes} />
    </PageContainer>
  );
}
