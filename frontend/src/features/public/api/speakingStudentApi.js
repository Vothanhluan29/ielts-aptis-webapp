import axiosClient from '../../../services/axiosClient';

const BASE_URL = '/speaking';

export const speakingStudentApi = {
  // 1. Lấy danh sách đề thi (Backend đã tự lọc bài Public và Practice)
  getAllTests: (params) => {
    return axiosClient.get(`${BASE_URL}/tests`, { params });
  },

  // 2. Lấy chi tiết đề thi (để render các Part và từng Câu hỏi)
  getTestById: (id) => {
    return axiosClient.get(`${BASE_URL}/tests/${id}`);
  },

  // 3. Upload File Ghi âm (Dùng chung)
  uploadAudio: (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm'); 

    return axiosClient.post(`${BASE_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // 4. 🔥 CẬP NHẬT: Lưu kết quả cho TỪNG CÂU HỎI
  // Input: { test_id, question_id, audio_url, submission_id (nếu có), is_full_test_only }
  // Output: { submission_id: 123 } -> Cần lưu lại ID này để gửi tiếp cho các câu sau
  saveQuestion: (data) => {
    return axiosClient.post(`${BASE_URL}/save-question`, data);
  },

  // 5. Nộp bài hoàn tất (Chốt đơn)
  // Action: Backend check đủ tổng số câu hỏi -> Trừ Quota -> Gọi AI
  finishTest: (submissionId) => {
    return axiosClient.post(`${BASE_URL}/finish/${submissionId}`);
  },

  // 6. Lấy lịch sử làm bài
  getMyHistory: () => {
    return axiosClient.get(`${BASE_URL}/submissions/me`);
  },

  // 7. Xem chi tiết kết quả (Transcript, Feedback từng câu...)
  getSubmissionDetail: (id) => {
    return axiosClient.get(`${BASE_URL}/submissions/${id}`);
  }
};