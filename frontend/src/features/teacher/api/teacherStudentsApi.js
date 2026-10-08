import usersApi from '../../../api/usersApi';

const teacherStudentsApi = {
  getStudents: (skip = 0, limit = 100) => usersApi.getTeacherStudents({ skip, limit }),
};

export default teacherStudentsApi;
