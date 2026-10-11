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

  uploadAudio: (file, onProgress) => {
    if (file.size > 200 * 1024 * 1024) {
      return Promise.reject(new Error('Listening audio exceeds the 200 MB limit.'));
    }
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/aptis/listening/upload', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({ percent: percentCompleted });
        }
      },
    });
  },

  // Admin: Submission management (view-only)
  getAllSubmissions: (params) =>
    axiosClient.get(`${ADMIN_BASE_URL}/submissions`, { params }),

  getSubmissionDetail: (submissionId) =>
    axiosClient.get(`/aptis/listening/submissions/${submissionId}`),
};

export default listeningAptisAdminApi;
