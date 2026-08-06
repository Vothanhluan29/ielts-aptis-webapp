import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import useAuthStore from '../../store/authStore';

export const useMainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  const { user, loadingUser, fetchMe, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Auth check when the app initializes
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Automatically close mobile sidebar when changing routes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Manage sidebar state with LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) setSidebarCollapsed(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Click outside logic for profile dropdown
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    message.success('Logged out successfully');
  };

  // Improve page title: full-tests -> Full Tests
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path || path === 'dashboard') return 'Dashboard';
    return path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return {
    user,
    loadingUser,
    sidebarOpen,
    sidebarCollapsed,
    profileOpen,
    setSidebarOpen,
    setSidebarCollapsed,
    setProfileOpen,
    profileRef,
    handleLogout,
    pageTitle: getPageTitle(),
    location,
    fetchMe
  };
};