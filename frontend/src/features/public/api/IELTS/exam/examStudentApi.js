import axiosClient from '../../../../../services/axiosClient';

const BASE_URL = '/exam';

export const examStudentApi = {
  getAllTests: (params) => {
    return axiosClient.get(`${BASE_URL}/tests`, { params });
  },


  getTestDetailPublic: (testId) => {
    return axiosClient.get(`${BASE_URL}/tests/${testId}`);
  },


  startExam: (fullTestId) => {
    return axiosClient.post(`${BASE_URL}/start`, { full_test_id: fullTestId });
  },


  getCurrentProgress: (submissionId) => {
    return axiosClient.get(`${BASE_URL}/current/${submissionId}`);
  },


  submitStep: (payload) => {

    return axiosClient.post(`${BASE_URL}/submit-step`, payload);
  },


  getHistory: (params) => {
    return axiosClient.get(`${BASE_URL}/history`, { params });
  },

 
  getResult: (submissionId) => {
    return axiosClient.get(`${BASE_URL}/result/${submissionId}`);
  }
};