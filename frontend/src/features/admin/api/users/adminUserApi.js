import axiosClient from '../../../../services/axiosClient';

const adminUserApi = {
  getAllUsers: (skip = 0, limit = 1000) =>
    axiosClient.get(`/users/?skip=${skip}&limit=${limit}`),

  getUserDetail: (userId) =>
    axiosClient.get(`/users/${userId}`),

  updateUserByAdmin: (userId, data) =>
    axiosClient.patch(`/users/${userId}`, data),

  deleteUserByAdmin: (userId) =>
    axiosClient.delete(`/users/${userId}`),
};

export default adminUserApi;