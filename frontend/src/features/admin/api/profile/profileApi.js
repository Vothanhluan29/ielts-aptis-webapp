import axiosClient from '../../../../services/axiosClient';

const profileApi = {
  getMe: () =>
    axiosClient.get('/users/me'),

  updateProfile: (data) =>
    axiosClient.patch('/users/me', data),

  updateAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.patch('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  changePassword: (passwordData) =>
    axiosClient.post('/users/me/password', passwordData),
};

export default profileApi;