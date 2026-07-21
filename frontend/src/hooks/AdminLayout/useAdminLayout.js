import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import authApi from '../../features/auth/api/authApi';

export const useAdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSkillsManuallyOpen, setIsSkillsManuallyOpen] = useState(false);

  const isSkillsRoute = location.pathname.startsWith('/admin/skills');

  const openSkills = isSkillsRoute || isSkillsManuallyOpen;

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const toggleSkills = useCallback(() => {
    setIsSkillsManuallyOpen(prev => !prev);
  }, []);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    message.success('Admin logged out successfully');
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return {
    isCollapsed,
    openSkills,
    toggleSidebar,
    toggleSkills,
    logout,
    isActive,
  };
};