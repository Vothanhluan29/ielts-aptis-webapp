import axiosClient from '../../../../../services/axiosClient';

const ADMIN_BASE_URL = '/aptis/listening/admin';

const listeningAptisAdminApi = {
  getTests: (params) =>
    axiosClient.get(`${ADMIN_BASE_URL}/tests`, { params }),

  getTestDetail: (testId) =>
    axiosClient.get(`${ADMIN_BASE_URL}/tests/${testId}`),

  createTest: (data) =>
    axiosClient.post(`${ADMIN_BASE_URL}/tests`, data),

  updateTest: (testId, data) =>
    axiosClient.patch(`${ADMIN_BASE_URL}/tests/${testId}`, data),

  deleteTest: (testId) =>
    axiosClient.delete(`${ADMIN_BASE_URL}/tests/${testId}`),

  uploadAudio: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/aptis/listening/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Admin: Submission management (view-only)
  getAllSubmissions: (params) =>
    axiosClient.get(`${ADMIN_BASE_URL}/submissions`, { params }),

  getSubmissionDetail: (submissionId) =>
    axiosClient.get(`/aptis/listening/submissions/${submissionId}`),
};

export default listeningAptisAdminApi;