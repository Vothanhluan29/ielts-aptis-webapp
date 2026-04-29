import axiosClient from '../../../../../services/axiosClient'; 

const PREFIX = '/aptis/writing';

const writingAptisStudentApi = {
  
  // TEST LIST & DETAILS (PUBLIC/STUDENT)

  getAllTests: (params) => {
    return axiosClient.get(`${PREFIX}/tests`, {
      params: {
        skip: params?.skip || 0,
        limit: params?.limit || 100,
        // Có thể thêm search nếu sau này Backend hỗ trợ
      }
    });
  },


  getTestDetail: (testId) => {
    return axiosClient.get(`${PREFIX}/tests/${testId}`);
  },



  // 2. SUBMISSION
 
  /**

   * @param {Object} data - Payload gửi lên
   * @example data: { test_id: int, is_full_test_only: bool, user_answers: Object }
   */
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

export default writingAptisStudentApi;