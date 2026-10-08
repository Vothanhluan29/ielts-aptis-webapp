import { create } from 'zustand';
import { Modal } from 'antd';
import authApi from '../features/auth/api/authApi';

const useAuthStore = create((set, get) => ({
  user: null,
  loadingUser: true,

  fetchMe: async () => {
    try {
      set({ loadingUser: true });
      const data = await authApi.getMe();
      set({ user: data, loadingUser: false });
    } catch (err) {
      console.error('Auth error in store:', err);
      set({ user: null, loadingUser: false });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null });
      window.location.href = '/login';
    }
  },

  // State to track if the session expired modal is already shown
  isSessionExpiredAlertShown: false,

  handleSessionExpired: () => {
    const publicPaths = ['/', '/login', '/register', '/choose-mode'];

    // Prevent redirect loop or redirecting from public pages
    if (publicPaths.includes(window.location.pathname)) return;

    set({ user: null });
    window.location.href = '/login';
  }
}));

export default useAuthStore;
