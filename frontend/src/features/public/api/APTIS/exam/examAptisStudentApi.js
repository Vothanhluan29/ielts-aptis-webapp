import axiosClient from '../../../../../services/axiosClient'; // Bạn nhớ điều chỉnh lại đường dẫn import axiosClient cho đúng với project của bạn nhé

const PREFIX = '/aptis/exam';

const examAptisStudentApi = {
  // =========================
  // STUDENT - TEST LIBRARY (Danh sách đề)
  // =========================

  /**
   * Lấy danh sách các bài thi Full Test Aptis hiện có
   * Gắn params: { skip: 0, limit: 100 }
   */
  getLibraryTests: (params) => {
    return axiosClient.get(`${PREFIX}/tests`, { params });
  },

  /**
   * Lấy thông tin chi tiết của một bài thi Full Test cụ thể
   * GET /aptis/exam/tests/{test_id}
   */
  getLibraryTestDetail: (testId) => {
    return axiosClient.get(`${PREFIX}/tests/${testId}`);
  },


  // =========================
  // STUDENT - EXAM FLOW (Luồng làm bài)
  // =========================

  /**
   * Bắt đầu một bài thi Full Test mới
   * POST /aptis/exam/start
   * @param {number} fullTestId - ID của bài thi Full Test
   */
  startExam: (fullTestId) => {
    return axiosClient.post(`${PREFIX}/start`, { full_test_id: fullTestId });
  },

  /**
   * Lấy tiến trình bài thi hiện tại (để resume nếu rớt mạng / F5)
   * GET /aptis/exam/current/{submission_id}
   */
  getCurrentProgress: (submissionId) => {
    return axiosClient.get(`${PREFIX}/current/${submissionId}`);
  },

  /**
   * Nộp bài của một kỹ năng (Skill) và chuyển sang bước tiếp theo
   * POST /aptis/exam/submit-step
   * @param {Object} payload - Gồm: exam_submission_id, current_step (chuỗi tên kỹ năng VD: 'READING'), skill_submission_id
   */
  submitSkillStep: (payload) => {
    return axiosClient.post(`${PREFIX}/submit-step`, payload);
  },


  // =========================
  // STUDENT - HISTORY & RESULT (Lịch sử & Kết quả)
  // =========================

  /**
   * Lấy toàn bộ lịch sử thi Full Test của học viên
   * GET /aptis/exam/history
   */
  getMyExamHistory: () => {
    return axiosClient.get(`${PREFIX}/history`);
  },

  /**
   * Xem kết quả chi tiết của bài thi Full Test đã hoàn thành
   * GET /aptis/exam/result/{submission_id}
   */
  getExamResult: (submissionId) => {
    return axiosClient.get(`${PREFIX}/result/${submissionId}`);
  }
};

export default examAptisStudentApi;