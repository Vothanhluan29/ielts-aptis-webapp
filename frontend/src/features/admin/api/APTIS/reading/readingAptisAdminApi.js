import axiosClient from '../../../../../services/axiosClient';

const PREFIX = '/aptis/reading/admin';

const readingAptisAdminApi = {
  // Test Management
  getAllTests: (params) =>
    axiosClient.get(`${PREFIX}/tests`, { params }),

  getTestDetail: (id) =>
    axiosClient.get(`${PREFIX}/tests/${id}`),

  createTest: (data) =>
    axiosClient.post(`${PREFIX}/tests`, data),

  updateTest: (id, data) =>
    axiosClient.put(`${PREFIX}/tests/${id}`, data),

  deleteTest: (id) =>
    axiosClient.delete(`${PREFIX}/tests/${id}`),

  // Submission Management
  getAllSubmissions: (params) =>
    axiosClient.get(`${PREFIX}/submissions`, { params }),

  getUserHistory: (userId) =>
    axiosClient.get(`${PREFIX}/users/${userId}/submissions`),

  overrideScore: (submissionId, data) =>
    axiosClient.put(`${PREFIX}/submissions/${submissionId}/override`, data),
};

export default readingAptisAdminApi;