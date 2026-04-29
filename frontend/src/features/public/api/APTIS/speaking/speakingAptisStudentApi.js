import axiosClient from "../../../../../services/axiosClient";

const speakingAptisStudentApi = {
  /**
   * POST: /aptis/speaking/upload
   */
  uploadAudio: (file) => {
    const url = '/aptis/speaking/upload';
    const formData = new FormData();
    formData.append('file', file);
    
    return axiosClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * GET: /aptis/speaking/tests
   */
  getListTests: (params) => {
    const url = '/aptis/speaking/tests';
    return axiosClient.get(url, { params });
  },

  /**
   * GET: /aptis/speaking/tests/{test_id}
   */
  getTestDetail: (id) => {
    const url = `/aptis/speaking/tests/${id}`;
    return axiosClient.get(url);
  },

  /**
   * POST: /aptis/speaking/save-part
   * @param {Object} payload - { test_id, part_id, responses: [{ question_id, audio_url }] }
   */
  savePart: (payload) => {
    const url = '/aptis/speaking/save-part';
    return axiosClient.post(url, payload);
  },

  /**
   * POST: /aptis/speaking/finish/{submission_id}
   */
  finishTest: (submissionId) => {
    const url = `/aptis/speaking/finish/${submissionId}`;
    return axiosClient.post(url);
  },

  /**
   * GET: /aptis/speaking/submissions/me
   */
  getMyHistory: () => {
    const url = '/aptis/speaking/submissions/me';
    return axiosClient.get(url);
  },

  /**
   * GET: /aptis/speaking/submissions/{submission_id}
   */
  getSubmissionDetail: (submissionId) => {
    const url = `/aptis/speaking/submissions/${submissionId}`;
    return axiosClient.get(url);
  }
};

export default speakingAptisStudentApi;