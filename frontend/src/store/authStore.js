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
    const { isSessionExpiredAlertShown } = get();

    // Prevent stacking
    if (isSessionExpiredAlertShown || window.location.pathname === '/login') return;

    set({ isSessionExpiredAlertShown: true });

    Modal.warning({
      title: 'Session Expired',
      content: 'Your session has expired. Please log in again to continue.',
      okText: 'Go to Login',
      centered: true,
      zIndex: 9999,
      onOk: () => {
        set({ isSessionExpiredAlertShown: false, user: null });
        window.location.href = '/login';
      },
    });
  }
}));

export default useAuthStore;
