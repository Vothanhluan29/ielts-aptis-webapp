import React from 'react';
import { LoadingState } from '../../../../common-ui';
import { useAdminUsers } from '../../hooks/users/useAdminUsers';
import AdminUsersPage from './AdminUsersPage';

export default function UserManagement() {
  const {
    users,
    loading,
    handleUpdateUser,
    handleDeleteUser,
    handleImportStudents,
    handleAssignClassesToTeacher,
  } = useAdminUsers();

  if (loading) return <LoadingState label="Loading users..." />;

  return (
    <AdminUsersPage
      users={users}
      onUpdateUser={handleUpdateUser}
      onDeleteUser={handleDeleteUser}
      onImportStudents={handleImportStudents}
      onAssignClasses={handleAssignClassesToTeacher}
    />
  );
}
