import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
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
      // ❌ Không tắt loading ở đây để MainLayout giữ màn hình Loading/Trống 
      // cho đến khi trang Login được mount
      navigate('/login', { replace: true });
      return;
    }

    try {
      const data = await authApi.getMe();
      setUser(data);
    } catch (err) {
      console.error('Auth error:', err);
      localStorage.removeItem('access_token');
      // Chỉ hiện toast nếu không phải trang login để tránh lặp tin nhắn
      if (location.pathname !== '/login') {
        toast.error('Phiên đăng nhập đã hết hạn');
      }
      navigate('/login', { replace: true });
    } finally {
      setLoadingUser(false);
    }
  }, [navigate, location.pathname]);

  // 1️⃣ Auth check khi khởi tạo app
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // 2️⃣ Tự động đóng sidebar mobile khi chuyển trang
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // 3️⃣ Quản lý trạng thái Sidebar (LocalStorage)
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) setSidebarCollapsed(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // 4️⃣ Click outside logic
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
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      localStorage.removeItem('access_token');
      toast.success('Đã đăng xuất');
      navigate('/login', { replace: true });
    }
  };

  // 5️⃣ Cải tiến Page Title: full-tests -> Full Tests
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path || path === 'dashboard') return 'Dashboard';
    return path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return {
    user, loadingUser, sidebarOpen, sidebarCollapsed, profileOpen,
    setSidebarOpen, setSidebarCollapsed, setProfileOpen,
    profileRef, handleLogout, pageTitle: getPageTitle(), location, fetchMe
  };
};