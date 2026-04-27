import axiosClient from '../../../../../services/axiosClient';

const BASE_URL = '/aptis/grammar-vocab/admin';

const grammarVocabAdminApi = {
  getTests: (params) =>
    axiosClient.get(`${BASE_URL}/tests`, { params }),

  getTestDetail: (testId) =>
    axiosClient.get(`${BASE_URL}/tests/${testId}`),

  createTest: (data) =>
    axiosClient.post(`${BASE_URL}/tests`, data),

  updateTest: (testId, data) =>
    axiosClient.put(`${BASE_URL}/tests/${testId}`, data),

  deleteTest: (testId) =>
    axiosClient.delete(`${BASE_URL}/tests/${testId}`),
};

export default grammarVocabAdminApi;