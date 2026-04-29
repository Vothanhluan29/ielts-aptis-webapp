import axiosClient from "../../../../../services/axiosClient";

const listeningAptisStudentApi = {

  getListTests: (params) => {
    const url = '/aptis/listening/tests';
    return axiosClient.get(url, { params });
  },


  getTestDetail: (id) => {
    const url = `/aptis/listening/tests/${id}`;
    return axiosClient.get(url);
  },


  submitTest: (payload) => {
    const url = '/aptis/listening/submit';
    return axiosClient.post(url, payload);
  },


  getMyHistory: () => {
    const url = '/aptis/listening/submissions/me';
    return axiosClient.get(url);
  },


  getSubmissionDetail: (submissionId) => {
    const url = `/aptis/listening/submissions/${submissionId}`;
    return axiosClient.get(url);
  }
};

export default listeningAptisStudentApi;