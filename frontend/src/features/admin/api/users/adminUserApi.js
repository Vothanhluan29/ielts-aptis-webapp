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

  getTeacherStudents: (skip = 0, limit = 100, classCode = null) => {
    let url = `/users/teacher/students?skip=${skip}&limit=${limit}`;
    if (classCode) url += `&class_code=${classCode}`;
    return axiosClient.get(url);
  }
};

export default adminUserApi;