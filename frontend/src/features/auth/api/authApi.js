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
    // Hàm này giờ đây sẽ trả về cả target_band và latest_overall_score từ Backend
    return axiosClient.get(API_URLS.ME);
  },

  updateProfile: (data) => axiosClient.patch('/users/me', data),

  changePassword: (data) => axiosClient.post('/users/me/password', data),

  // Cập nhật mục tiêu điểm IELTS (Target Band)
  updateTargetBand: (targetBand) => {
    // Khớp với endpoint PATCH /users/me/target-band ở Backend
    return axiosClient.patch('/users/me/target-band', { target_band: targetBand });
  },

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