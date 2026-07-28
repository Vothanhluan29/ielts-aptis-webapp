import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import authApi from '../../auth/api/authApi';

export const useTeacherLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const user = await authApi.getMe();
        setAdmin(user);
      } catch (err) {
        console.error("Failed to fetch teacher profile", err);
      }
    };
    fetchAdmin();
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    message.success('Teacher logged out successfully');
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return {
    isCollapsed,
    toggleSidebar,
    logout,
    isActive,
    admin
  };
};
