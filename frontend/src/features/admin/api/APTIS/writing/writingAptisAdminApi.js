import axiosClient from '../../../../../services/axiosClient';

const PREFIX = '/aptis/writing/admin';

const writingAptisAdminApi = {
  // Upload
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`${PREFIX}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Test Management
  getAllTests: (params) =>
    axiosClient.get(`${PREFIX}/tests`, {
      params: {
        skip: params?.skip || 0,
        limit: params?.limit || 100,
        is_mock_selector: params?.is_mock_selector || false,
      },
    }),

  getTestDetail: (id) =>
    axiosClient.get(`${PREFIX}/tests/${id}`),

  createTest: (data) =>
    axiosClient.post(`${PREFIX}/tests`, data),

  updateTest: (id, data) =>
    axiosClient.put(`${PREFIX}/tests/${id}`, data),

  deleteTest: (id) =>
    axiosClient.delete(`${PREFIX}/tests/${id}`),

  // Submission Management
  getAllSubmissions: (params) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const queryParams = { skip: (page - 1) * limit, limit };

    if (params?.status && params.status !== 'ALL' && params.status !== '') {
      queryParams.status = params.status;
    }

    if (params?.search && params.search.trim() !== '') {
      queryParams.search = params.search.trim();
    }

    return axiosClient.get(`${PREFIX}/submissions`, { params: queryParams });
  },

  getSubmissionDetail: (submissionId) =>
    axiosClient.get(`/aptis/writing/submissions/${submissionId}`),

  gradeSubmission: (submissionId, data) =>
    axiosClient.put(`${PREFIX}/submissions/${submissionId}/grade`, data),

  getUserHistory: (userId) =>
    axiosClient.get(`${PREFIX}/users/${userId}/submissions`),
};

export default writingAptisAdminApi;