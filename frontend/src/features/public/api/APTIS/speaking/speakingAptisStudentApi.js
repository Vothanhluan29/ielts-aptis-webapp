import axiosClient from "../../../../../services/axiosClient";

const speakingAptisStudentApi = {
  /**
   * 1. Upload file âm thanh (mp3, wav, webm...)
   * POST: /aptis/speaking/upload
   * Ghi chú: Sử dụng FormData để gửi file
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
   * 2. Lấy danh sách các đề thi Speaking đã public
   * GET: /aptis/speaking/tests
   */
  getListTests: (params) => {
    const url = '/aptis/speaking/tests';
    return axiosClient.get(url, { params });
  },

  /**
   * 3. Lấy chi tiết cấu trúc đề thi Speaking
   * GET: /aptis/speaking/tests/{test_id}
   */
  getTestDetail: (id) => {
    const url = `/aptis/speaking/tests/${id}`;
    return axiosClient.get(url);
  },

  /**
   * 4. Lưu nháp từng Part trong quá trình làm bài
   * POST: /aptis/speaking/save-part
   * @param {Object} payload - { test_id, part_id, responses: [{ question_id, audio_url }] }
   */
  savePart: (payload) => {
    const url = '/aptis/speaking/save-part';
    return axiosClient.post(url, payload);
  },

  /**
   * 5. Kết thúc và nộp toàn bộ bài thi Speaking
   * POST: /aptis/speaking/finish/{submission_id}
   */
  finishTest: (submissionId) => {
    const url = `/aptis/speaking/finish/${submissionId}`;
    return axiosClient.post(url);
  },

  /**
   * 6. Lấy danh sách lịch sử làm bài Speaking
   * GET: /aptis/speaking/submissions/me
   */
  getMyHistory: () => {
    const url = '/aptis/speaking/submissions/me';
    return axiosClient.get(url);
  },

  /**
   * 7. Lấy chi tiết một bài nộp Speaking (Để xem lại bài hoặc xem giáo viên chấm)
   * GET: /aptis/speaking/submissions/{submission_id}
   */
  getSubmissionDetail: (submissionId) => {
    const url = `/aptis/speaking/submissions/${submissionId}`;
    return axiosClient.get(url);
  }
};

export default speakingAptisStudentApi;