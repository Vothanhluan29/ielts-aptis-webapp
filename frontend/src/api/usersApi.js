import axiosClient from './axiosClient';

const usersApi = {
  getUsers(params) {
    return axiosClient.get('/users/', { params });
  },

  importStudents(data) {
    return axiosClient.post('/users/import', data);
  },

  assignClassesToTeacher(userId, classCodes) {
    return axiosClient.post(`/users/${userId}/classes`, { class_codes: classCodes });
  },

  getTeacherStudents(params) {
    return axiosClient.get('/users/teacher/students', { params });
  },
};

export default usersApi;
