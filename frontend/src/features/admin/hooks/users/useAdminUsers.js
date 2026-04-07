import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import adminUserApi from '../../api/users/adminUserApi';

export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);


  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminUserApi.getAllUsers(0,1000);

      setUsers(response.items || []);
      setTotalUsers(response.total || 0);
    } catch (error) {
      console.error("Fetch users error:", error);
      message.error("Failed to load user list");
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
      message.success('Update successful');

      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, ...updateData } : u
        )
      );
    } catch (error) {
      hide();
      message.error('Update failed', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('This action cannot be undone. Are you sure you want to delete this user?')) return;

    const hide = message.loading('Deleting...', 0);
    try {
      await adminUserApi.deleteUserByAdmin(userId);
      hide();
      message.success('User deleted');

      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchUsers();
      }
    } catch (error) {
      hide();
      message.error('Error deleting user', error);
    }
  };


  return {
    users,
    loading,
    handleUpdateUser,
    handleDeleteUser,
    currentPage,
    setCurrentPage,
    totalUsers
  };
};