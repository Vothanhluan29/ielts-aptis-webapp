import axiosClient from '../../../../../services/axiosClient';

const PREFIX = '/aptis/exam';

const examAptisAdminApi = {

  // Full Test Management (Admin CRUD)
  getAllFullTests: () =>
    axiosClient.get(`${PREFIX}/admin/tests`),

  getFullTestDetail: (id) =>
    axiosClient.get(`${PREFIX}/admin/tests/${id}`),

  createFullTest: (data) =>
    axiosClient.post(`${PREFIX}/admin/tests`, data),

  updateFullTest: (id, data) =>
    axiosClient.put(`${PREFIX}/admin/tests/${id}`, data),

  deleteFullTest: (id) =>
    axiosClient.delete(`${PREFIX}/admin/tests/${id}`),

  // Submission History Management (Admin)
  getAllSubmissions: (params) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const queryParams = { skip: (page - 1) * limit, limit };

    if (params?.status && params.status !== 'ALL' && params.status !== '') {
      queryParams.status = params.status;
    }

    return axiosClient.get(`${PREFIX}/admin/submissions`, { params: queryParams });
  },

  getSubmissionDetail: (submissionId) =>
    axiosClient.get(`${PREFIX}/result/${submissionId}`),
};

export default examAptisAdminApi;