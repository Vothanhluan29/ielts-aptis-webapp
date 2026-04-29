import axiosClient from "../../../../../services/axiosClient";

const readingAptisStudentApi = {

  getListTests: (params) => {
    const url = '/aptis/reading/tests';
    return axiosClient.get(url, { params });
  },

  getTestDetail: (id) => {
    const url = `/aptis/reading/tests/${id}`;
    return axiosClient.get(url);
  },


  submitTest: (payload) => {
    const url = '/aptis/reading/submit';
    return axiosClient.post(url, payload);
  },

 
  getMyHistory: () => {
    const url = '/aptis/reading/submissions/me';
    return axiosClient.get(url);
  },

 
  getSubmissionDetail: (submissionId) => {
    const url = `/aptis/reading/submissions/${submissionId}`;
    return axiosClient.get(url);
  }
};

export default readingAptisStudentApi;