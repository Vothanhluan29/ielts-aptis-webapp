import axiosClient from '../../../../../services/axiosClient';

const BASE_URL = '/reading';

export const readingStudentApi = {
  getAllTests: (params) => {
    return axiosClient.get(`${BASE_URL}/tests`, { params });
  },


  getTestById: (id) => {
    return axiosClient.get(`${BASE_URL}/tests/${id}`);
  },

  submitTest: (data) => {
    return axiosClient.post(`${BASE_URL}/submit`, data);
  },

  getMyHistory: () => {
    return axiosClient.get(`${BASE_URL}/submissions/me`);
  },

  getSubmissionDetail: (id) => {
    return axiosClient.get(`${BASE_URL}/submissions/${id}`);
  }
};