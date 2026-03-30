import axiosClient from '../../../services/axiosClient';

const BASE_URL = '/reading';

export const readingStudentApi = {
  // Backend: GET /reading/tests (Đã tự ẩn Mock & Draft)
  getAllTests: (params) => {
    return axiosClient.get(`${BASE_URL}/tests`, { params });
  },

  // 2. Lấy chi tiết đề thi để làm bài 
  // Backend: GET /reading/tests/{id} (Không trả về đáp án đúng)
  getTestById: (id) => {
    return axiosClient.get(`${BASE_URL}/tests/${id}`);
  },

  // 3. Nộp bài thi
  // Backend: POST /reading/submit
  // Payload: { test_id: int, user_answers: { "question_id": "user_answer" } }
  submitTest: (data) => {
    return axiosClient.post(`${BASE_URL}/submit`, data);
  },

  // 4. Lấy lịch sử làm bài của user hiện tại
  // Backend: GET /reading/submissions/me
  getMyHistory: () => {
    return axiosClient.get(`${BASE_URL}/submissions/me`);
  },

  // 5. Xem chi tiết kết quả (kèm đáp án đúng/giải thích)
  // Backend: GET /reading/submissions/{id}
  getSubmissionDetail: (id) => {
    return axiosClient.get(`${BASE_URL}/submissions/${id}`);
  }
};