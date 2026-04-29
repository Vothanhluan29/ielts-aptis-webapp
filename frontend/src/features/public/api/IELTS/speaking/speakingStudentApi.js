import axiosClient from '../../../../../services/axiosClient';

const BASE_URL = '/speaking';

export const speakingStudentApi = {

  getAllTests: (params) => {
    return axiosClient.get(`${BASE_URL}/tests`, { params });
  },


  getTestById: (id) => {
    return axiosClient.get(`${BASE_URL}/tests/${id}`);
  },


  uploadAudio: (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm'); 

    return axiosClient.post(`${BASE_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },


  saveQuestion: (data) => {
    return axiosClient.post(`${BASE_URL}/save-question`, data);
  },


  finishTest: (submissionId) => {
    return axiosClient.post(`${BASE_URL}/finish/${submissionId}`);
  },

  getMyHistory: () => {
    return axiosClient.get(`${BASE_URL}/submissions/me`);
  },

  getSubmissionDetail: (id) => {
    return axiosClient.get(`${BASE_URL}/submissions/${id}`);
  }
};