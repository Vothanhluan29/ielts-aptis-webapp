import React, { useMemo, useState } from 'react';
import { Avatar, Select } from 'antd';
import { MailOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import { BookOpen, UserCheck, UserX, Users } from 'lucide-react';
import { EmptyState, LoadingState, PageContainer, PageHeader, StatCard, SurfaceCard } from '../../../../common-ui';
import { useTeacherStudents } from '../../hooks/useTeacherStudents';

const StudentRow = ({ user }) => (
  <div className="flex items-center border-b border-zinc-100 px-5 py-4 transition-colors last:border-0 hover:bg-zinc-50 sm:px-6">
    <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
      <div className="relative shrink-0">
        <Avatar size={42} src={user.avatar_url} icon={!user.avatar_url && <UserOutlined />} style={!user.avatar_url ? { background: 'linear-gradient(135deg,#445A95,#6B7FBD)', color: '#fff', fontWeight: 700 } : {}}>
          {!user.avatar_url && user.full_name?.[0]?.toUpperCase()}
        </Avatar>
        <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${user.is_active ? 'bg-emerald-400' : 'bg-zinc-300'}`} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold leading-tight text-zinc-900">
          {user.full_name || '—'}
          {user.student_id && <span className="ml-2 text-xs font-normal text-zinc-400">#{user.student_id}</span>}
        </p>
        <p className="mt-1 flex items-center gap-1 truncate text-xs text-zinc-500"><MailOutlined className="shrink-0 text-zinc-400" />{user.email}</p>
      </div>
    </div>
    <div className="hidden w-36 shrink-0 px-3 sm:block">
      {user.class_code ? <span className="rounded-lg border border-[#445A95]/20 bg-[#445A95]/10 px-3 py-1 text-[11px] font-bold text-[#445A95]">{user.class_code}</span> : <span className="text-xs text-zinc-300">—</span>}
    </div>
    <div className="w-24 shrink-0 text-right sm:w-32">
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${user.is_active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-400'}`} />
        {user.is_active ? 'Active' : 'Suspended'}
      </span>
    </div>
  </div>
);

export default function TeacherStudentsPage() {
  const { users, loading } = useTeacherStudents();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState();
  const classes = useMemo(() => [...new Set(users.map(user => user.class_code).filter(Boolean))].sort(), [users]);
  const students = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter(user => {
      if (classFilter && user.class_code !== classFilter) return false;
      if (!query) return true;
      return [user.full_name, user.email, user.student_id].some(value => value?.toLowerCase().includes(query));
    });
  }, [users, search, classFilter]);

  const activeCount = students.filter(user => user.is_active).length;
  const suspendedCount = students.length - activeCount;

  if (loading) return <LoadingState label="Loading students..." />;

  return (
    <PageContainer className="max-w-[1100px] pb-12">
      <PageHeader title="My Students" description="Students in your assigned classes" actions={(
        <div className="flex items-center gap-2 rounded-xl bg-[#445A95]/10 px-4 py-2 text-[#445A95]"><Users size={16} /><span className="text-sm font-bold">{users.length} Total</span></div>
      )} />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard label="All Students" value={users.length} icon={Users} tone="indigo" />
        <StatCard label="Active" value={activeCount} icon={UserCheck} tone="green" />
        <StatCard label="Suspended" value={suspendedCount} icon={UserX} tone="red" />
      </div>

      <SurfaceCard className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-zinc-100 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 focus-within:border-[#445A95]/50 focus-within:bg-white">
            <SearchOutlined className="text-zinc-400" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, email or student ID" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400" />
            {search && <button onClick={() => setSearch('')} className="text-xs font-semibold text-zinc-500 hover:text-zinc-900">Clear</button>}
          </div>
          <Select allowClear placeholder="All classes" value={classFilter} onChange={setClassFilter} className="w-full sm:w-48" options={classes.map(value => ({ value, label: value }))} />
        </div>
        <div className="flex items-center border-b border-zinc-100 bg-zinc-50 px-5 py-3 sm:px-6">
          <span className="flex-1 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Student</span>
          <span className="hidden w-36 px-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400 sm:block">Class</span>
          <span className="w-24 text-right text-[11px] font-bold uppercase tracking-widest text-zinc-400 sm:w-32">Status</span>
        </div>
        {students.length ? students.map(user => <StudentRow key={user.id} user={user} />) : (
          <EmptyState icon={BookOpen} title="No students found" description={search || classFilter ? 'Try changing your search or class filter.' : 'No students are assigned to your classes yet.'} />
        )}
      </SurfaceCard>
      {students.length > 0 && <p className="mt-4 text-center text-xs text-zinc-500">Showing <strong className="text-zinc-700">{students.length}</strong> of {users.length} students</p>}
    </PageContainer>
  );
}
