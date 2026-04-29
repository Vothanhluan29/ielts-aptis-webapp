import axiosClient from '../../../../../services/axiosClient'; 

const PREFIX = '/aptis/grammar-vocab';

const grammarVocabAptisStudentApi = {
  //  1. TEST LIST & DETAILS 
  
  getAllTests: (params) => {
    return axiosClient.get(`${PREFIX}/tests`, { 
      params: {
        skip: params?.skip || 0,
        limit: params?.limit || 100,
      } 
    });
  },


  getTestDetail: (testId) => {
    return axiosClient.get(`${PREFIX}/tests/${testId}`);
  },

  
  // SUBMISSION
 
  submitTest: (data) => {
    return axiosClient.post(`${PREFIX}/submit`, data);
  },

 
  getMyHistory: () => {
    return axiosClient.get(`${PREFIX}/submissions/me`);
  },


  getSubmissionDetail: (submissionId) => {
    return axiosClient.get(`${PREFIX}/submissions/${submissionId}`);
  }
};

export default grammarVocabAptisStudentApi;