// src/features/auth/api/authApi.js
import axiosClient from '../../../services/axiosClient';
import { API_URLS } from '../../../services/apiEndpoints';

const authApi = {
  login: (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    return axiosClient.post(API_URLS.LOGIN, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },

  register: (data) => {
    return axiosClient.post(API_URLS.REGISTER, data);
  },

  loginWithGoogle: (token) => {
    return axiosClient.post(API_URLS.LOGINWITHGOOGLE, { token });
  },

  getMe: () => {
    // Lấy thông tin cá nhân của User từ Backend
    return axiosClient.get(API_URLS.ME);
  },

  updateProfile: (data) => axiosClient.patch('/users/me', data),

  changePassword: (data) => axiosClient.post('/users/me/password', data),

  // Upload Avatar
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.patch('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default authApi;