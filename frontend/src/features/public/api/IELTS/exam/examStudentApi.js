import axiosClient from '../../../../../services/axiosClient';

const BASE_URL = '/exam';

export const examStudentApi = {
  // 1. Lấy danh sách đề thi (Library) 
  // Bổ sung params để dự phòng filter/search
  getAllTests: (params) => {
    return axiosClient.get(`${BASE_URL}/tests`, { params });
  },

  // 2. Lấy chi tiết đề thi Public (Dùng cho trang Lobby/Intro để hiện cấu trúc đề)
  getTestDetailPublic: (testId) => {
    return axiosClient.get(`${BASE_URL}/tests/${testId}`);
  },

  // 3. Bắt đầu làm bài (Tạo lượt thi mới hoặc Resume bài cũ)
  startExam: (fullTestId) => {
    return axiosClient.post(`${BASE_URL}/start`, { full_test_id: fullTestId });
  },

  // 4. Lấy trạng thái bài làm hiện tại để Resume
  getCurrentProgress: (submissionId) => {
    return axiosClient.get(`${BASE_URL}/current/${submissionId}`);
  },

  // 5. Nộp một kỹ năng & Chuyển bước
  submitStep: (payload) => {
    // payload: { exam_submission_id, current_step, skill_submission_id }
    return axiosClient.post(`${BASE_URL}/submit-step`, payload);
  },

  // 6. Xem lịch sử làm bài thi Full Mock
  getHistory: (params) => {
    return axiosClient.get(`${BASE_URL}/history`, { params });
  },

  // 7. Xem kết quả tổng kết (Overall band & 4 kỹ năng)
  getResult: (submissionId) => {
    return axiosClient.get(`${BASE_URL}/result/${submissionId}`);
  }
};