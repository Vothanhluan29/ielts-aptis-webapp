import axiosClient from '../../../../../services/axiosClient';

const PREFIX = '/aptis/speaking';

const speakingAptisAdminApi = {
  // Upload
  uploadAudio: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`${PREFIX}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`${PREFIX}/admin/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Test Management (Admin)
  getAllTestsForAdmin: (params) =>
    axiosClient.get(`${PREFIX}/admin/tests`, {
      params: { is_mock_selector: params?.is_mock_selector || false },
    }),

  createTest: (data) =>
    axiosClient.post(`${PREFIX}/admin/tests`, data),

  updateTest: (id, data) =>
    axiosClient.put(`${PREFIX}/admin/tests/${id}`, data),

  deleteTest: (id) =>
    axiosClient.delete(`${PREFIX}/admin/tests/${id}`),

  // Test Retrieval (Student & Admin)
  getPublicTests: (params) =>
    axiosClient.get(`${PREFIX}/tests`, {
      params: { skip: params?.skip || 0, limit: params?.limit || 100 },
    }),

  getTestDetail: (id) =>
    axiosClient.get(`${PREFIX}/tests/${id}`),

  // Submission & Grading (Student)
  savePart: (data) =>
    axiosClient.post(`${PREFIX}/save-part`, data),

  finishTest: (submissionId) =>
    axiosClient.post(`${PREFIX}/finish/${submissionId}`),

  getMyHistory: () =>
    axiosClient.get(`${PREFIX}/submissions/me`),

  getSubmissionDetail: (submissionId) =>
    axiosClient.get(`${PREFIX}/submissions/${submissionId}`),

  // Submission Management (Admin)
  getAllSubmissionsForAdmin: (params) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const queryParams = { skip: (page - 1) * limit, limit };

    if (params?.status && params.status !== 'ALL' && params.status !== '') {
      queryParams.status = params.status;
    }

    return axiosClient.get(`${PREFIX}/admin/submissions`, { params: queryParams });
  },

  getUserHistoryForAdmin: (userId) =>
    axiosClient.get(`${PREFIX}/admin/users/${userId}/submissions`),

  gradeSubmission: (submissionId, data) =>
    axiosClient.put(`${PREFIX}/admin/submissions/${submissionId}/grade`, data),
};

export default speakingAptisAdminApi;