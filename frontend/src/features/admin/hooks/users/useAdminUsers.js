import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import adminUserApi from '../../api/users/adminUserApi';

export const useAdminUsers = (isTeacher = false) => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);


  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = isTeacher 
        ? await adminUserApi.getTeacherStudents(0, 1000)
        : await adminUserApi.getAllUsers(0, 1000);

      setUsers(response.items || []);
      setTotalUsers(response.total || 0);
    } catch (error) {
      console.error("Fetch users error:", error);
      message.error("Failed to load user list. Please try again!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateUser = async (userId, updateData) => {
    const hide = message.loading('Processing...', 0);
    try {
      await adminUserApi.updateUserByAdmin(userId, updateData);
      hide();
      message.success('User information updated successfully!');

      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, ...updateData } : u
        )
      );
    } catch (error) {
      hide();
      console.error('Update user error:', error);
      message.error(error.response?.data?.detail || 'Failed to update user information. Please try again!');
    }
  };

  const handleDeleteUser = async (userId) => {
    const hide = message.loading('Deleting...', 0);
    try {
      await adminUserApi.deleteUserByAdmin(userId);
      hide();
      message.success('User deleted successfully!');

      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchUsers();
      }
    } catch (error) {
      hide();
      console.error('Delete user error:', error);
      message.error(error.response?.data?.detail || 'Failed to delete user. Please try again!');
    }
  };

  const handleImportStudents = async (data) => {
    const hide = message.loading('Importing students...', 0);
    try {
      await adminUserApi.importStudents(data);
      hide();
      message.success('Students imported successfully!');
      fetchUsers();
    } catch (error) {
      hide();
      console.error('Import students error:', error);
      message.error(error.response?.data?.detail || 'Failed to import students. Please try again!');
      throw error;
    }
  };

  const handleAssignClassesToTeacher = async (userId, classCodes) => {
    const hide = message.loading('Assigning classes...', 0);
    try {
      await adminUserApi.assignClassesToTeacher(userId, classCodes);
      hide();
      message.success('Classes assigned successfully!');
      fetchUsers();
    } catch (error) {
      hide();
      console.error('Assign classes error:', error);
      message.error(error.response?.data?.detail || 'Failed to assign classes. Please try again!');
      throw error;
    }
  };


  return {
    users,
    loading,
    handleUpdateUser,
    handleDeleteUser,
    handleImportStudents,
    handleAssignClassesToTeacher,
    currentPage,
    setCurrentPage,
    totalUsers,
    fetchUsers
  };
};