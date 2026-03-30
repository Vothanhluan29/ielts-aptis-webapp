import axiosClient from "../../../../../services/axiosClient"; // Điều chỉnh đường dẫn import này cho đúng với project của bạn

const listeningAptisStudentApi = {
  /**
   * 1. Lấy danh sách các đề thi Listening đã public (Dành cho học viên)
   * GET: /aptis/listening/tests
   */
  getListTests: (params) => {
    const url = '/aptis/listening/tests';
    return axiosClient.get(url, { params });
  },

  /**
   * 2. Lấy chi tiết đề thi Listening để làm bài (Tự động ẩn đáp án đúng ở backend)
   * GET: /aptis/listening/tests/{test_id}
   */
  getTestDetail: (id) => {
    const url = `/aptis/listening/tests/${id}`;
    return axiosClient.get(url);
  },

  /**
   * 3. Nộp bài thi Listening để hệ thống chấm điểm
   * POST: /aptis/listening/submit
   * @param {Object} payload - { test_id: int, is_full_test_only: bool, user_answers: dict }
   */
  submitTest: (payload) => {
    const url = '/aptis/listening/submit';
    return axiosClient.post(url, payload);
  },

  /**
   * 4. Lấy danh sách lịch sử các bài Listening đã nộp của User hiện tại
   * GET: /aptis/listening/submissions/me
   */
  getMyHistory: () => {
    const url = '/aptis/listening/submissions/me';
    return axiosClient.get(url);
  },

  /**
   * 5. Lấy chi tiết một bài nộp Listening (Bao gồm điểm số, đúng/sai, transcript/giải thích)
   * GET: /aptis/listening/submissions/{submission_id}
   */
  getSubmissionDetail: (submissionId) => {
    const url = `/aptis/listening/submissions/${submissionId}`;
    return axiosClient.get(url);
  }
};

export default listeningAptisStudentApi;