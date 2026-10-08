import axiosClient from '../../../../services/axiosClient';

const adminUserApi = {
  getAllUsers: (skip = 0, limit = 100) =>
    axiosClient.get(`/users/?skip=${skip}&limit=${limit}`),

  getUserDetail: (userId) =>
    axiosClient.get(`/users/${userId}`),

  updateUserByAdmin: (userId, data) =>
    axiosClient.patch(`/users/${userId}`, data),

  deleteUserByAdmin: (userId) =>
    axiosClient.delete(`/users/${userId}`),

  importStudents: (data) =>
    axiosClient.post('/users/import', data),

  assignClassesToTeacher: (userId, classCodes) =>
    axiosClient.post(`/users/${userId}/classes`, { class_codes: classCodes }),
};

export default adminUserApi;
