// ⚠️ LƯU Ý: Kiểm tra lại đường dẫn import axiosClient tùy vào cấu trúc folder của bạn
import axiosClient from '../../../services/axiosClient';

const BASE_URL = '/listening';

export const listeningStudentApi = {

  // 1. Lấy danh sách đề thi (Public)
  // Hỗ trợ params: { skip, limit, is_mock_selector... }
  getAllTests: (params) => {
    return axiosClient.get(`${BASE_URL}/tests`, { params });
  },
  
  // 2. Lấy chi tiết đề thi để làm bài
  // Backend sẽ trả về cấu trúc câu hỏi nhưng KHÔNG CÓ correct_answers
  getTestById: (id) => {
    return axiosClient.get(`${BASE_URL}/tests/${id}`);
  },

  // 3. Nộp bài thi
  // 🔥 LƯU Ý PAYLOAD CHUẨN: 
  // { 
  //    test_id: int, 
  //    user_answers: { "1": "apple", "2": ["A", "C"] }, // Dùng Question_Number, KHÔNG dùng ID
  //    is_full_test_only: boolean
  // } 
  submitTest: (data) => {
    return axiosClient.post(`${BASE_URL}/submit`, data);
  },

  // 4. Lấy lịch sử làm bài của user hiện tại (Summary)
  getMyHistory: () => {
    return axiosClient.get(`${BASE_URL}/submissions/me`);
  },

  // 5. Xem chi tiết kết quả (Review)
  // Trả về kèm đáp án đúng (correct_answers list) và giải thích (explanation)
  getSubmissionDetail: (id) => {
    return axiosClient.get(`${BASE_URL}/submissions/${id}`);
  }
};