import axiosClient from '../../../../../services/axiosClient'; 

const PREFIX = '/aptis/exam';

const examAptisStudentApi = {
  // =========================
  // STUDENT - TEST LIBRARY 
  // =========================
  getLibraryTests: (params) => {
    return axiosClient.get(`${PREFIX}/tests`, { params });
  },

  getLibraryTestDetail: (testId) => {
    return axiosClient.get(`${PREFIX}/tests/${testId}`);
  },


  // =========================
  // STUDENT - EXAM FLOW
  // =========================

  startExam: (fullTestId) => {
    return axiosClient.post(`${PREFIX}/start`, { full_test_id: fullTestId });
  },

 
  getCurrentProgress: (submissionId) => {
    return axiosClient.get(`${PREFIX}/current/${submissionId}`);
  },

  submitSkillStep: (payload) => {
    return axiosClient.post(`${PREFIX}/submit-step`, payload);
  },


  // =========================
  // STUDENT - HISTORY & RESULT 
  // =========================
  getMyExamHistory: () => {
    return axiosClient.get(`${PREFIX}/history`);
  },

  getExamResult: (submissionId) => {
    return axiosClient.get(`${PREFIX}/result/${submissionId}`);
  }
};

export default examAptisStudentApi;