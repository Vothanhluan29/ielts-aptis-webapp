import axiosClient from '../../../../../services/axiosClient';

export const adminSubmissionApi = {
  // skill có thể là: 'speaking', 'writing', 'reading', hoặc 'listening'
  
  // 1. Lấy danh sách bài nộp
  getAllSubmissions: (skill, params) => {
    return axiosClient.get(`/${skill}/admin/submissions`, { params });
  },

  // 2. Lấy lịch sử của 1 học sinh
  getUserHistory: (skill, userId) => {
    return axiosClient.get(`/${skill}/admin/users/${userId}/submissions`);
  },

  // 3. Giáo viên sửa điểm
  overrideScore: (skill, submissionId, data) => {
    return axiosClient.put(`/${skill}/admin/submissions/${submissionId}/override`, data);
  }
};