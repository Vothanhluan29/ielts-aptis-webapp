import axiosClient from "../../../../../services/axiosClient";// Đảm bảo đường dẫn import này khớp với project của bạn

const readingAptisStudentApi = {
  /**
   * 1. Lấy danh sách các đề thi Reading đã public (Dành cho học viên)
   * GET: /aptis/reading/tests
   */
  getListTests: (params) => {
    const url = '/aptis/reading/tests';
    return axiosClient.get(url, { params });
  },

  /**
   * 2. Lấy chi tiết đề thi Reading để làm bài (Tự động ẩn đáp án đúng ở backend)
   * GET: /aptis/reading/tests/{test_id}
   */
  getTestDetail: (id) => {
    const url = `/aptis/reading/tests/${id}`;
    return axiosClient.get(url);
  },

  /**
   * 3. Nộp bài thi Reading để hệ thống chấm điểm
   * POST: /aptis/reading/submit
   * @param {Object} payload - { test_id: int, is_full_test_only: bool, answers: dict }
   * LƯU Ý: Frontend gửi object `answers` chứa đáp án.
   */
  submitTest: (payload) => {
    const url = '/aptis/reading/submit';
    return axiosClient.post(url, payload);
  },

  /**
   * 4. Lấy danh sách lịch sử các bài Reading đã nộp của User hiện tại
   * GET: /aptis/reading/submissions/me
   */
  getMyHistory: () => {
    const url = '/aptis/reading/submissions/me';
    return axiosClient.get(url);
  },

  /**
   * 5. Lấy chi tiết một bài nộp Reading (Bao gồm điểm số, đúng/sai, giải thích)
   * GET: /aptis/reading/submissions/{submission_id}
   */
  getSubmissionDetail: (submissionId) => {
    const url = `/aptis/reading/submissions/${submissionId}`;
    return axiosClient.get(url);
  }
};

export default readingAptisStudentApi;