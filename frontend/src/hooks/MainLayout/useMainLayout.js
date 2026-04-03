import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import authApi from '../../features/auth/api/authApi';

export const useMainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      // Do not disable loading here so MainLayout keeps the loading/blank screen
      // until the Login page is mounted
      navigate('/login', { replace: true });
      return;
    }

    try {
      const data = await authApi.getMe();
      setUser(data);
    } catch (err) {
      console.error('Auth error:', err);
      localStorage.removeItem('access_token');

      // Show message only if not on login page to avoid repetition
      if (location.pathname !== '/login') {
        message.error('Session has expired');
      }

      navigate('/login', { replace: true });
    } finally {
      setLoadingUser(false);
    }
  }, [navigate, location.pathname]);

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

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('access_token');
      message.success('Logged out successfully');
      navigate('/login', { replace: true });
    }
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