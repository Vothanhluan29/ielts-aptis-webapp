import axiosClient from '../../../../../services/axiosClient'; // Đảm bảo đường dẫn chuẩn với project

const BASE_URL = '/writing';

export const writingStudentApi = {
  // 1. Lấy danh sách đề thi (Backend đã tự động filter: Chỉ lấy bài Public, ẩn bài Mock/Draft)
  // Params: { skip, limit }
  getAllTests: (params) => {
    return axiosClient.get(`${BASE_URL}/tests`, { params });
  },

  // 2. Lấy chi tiết đề thi để làm bài (Có chứa mảng tasks gồm Task 1 và Task 2)
  getTestById: (id) => {
    return axiosClient.get(`${BASE_URL}/tests/${id}`);
  },

  // 3. Nộp bài
  // Payload chuẩn từ Schema: { test_id, task1_content, task2_content, is_full_test_only: boolean }
  submitTest: (data) => {
    return axiosClient.post(`${BASE_URL}/submit`, data);
  },

  // 4. Lấy lịch sử làm bài của user hiện tại
  getMyHistory: () => {
    return axiosClient.get(`${BASE_URL}/submissions/me`);
  },

  // 5. Xem chi tiết kết quả (Điểm số, Feedback, Correction của AI)
  getSubmissionDetail: (id) => {
    return axiosClient.get(`${BASE_URL}/submissions/${id}`);
  }
};