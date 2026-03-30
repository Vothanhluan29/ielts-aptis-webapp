import axiosClient from '../../../../../services/axiosClient';

const PREFIX = '/aptis/speaking';

const speakingAptisAdminApi = {
  // =================================================
  // 🎤 1. UPLOAD AUDIO & IMAGE (Admin & Student)
  // =================================================
  uploadAudio: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`${PREFIX}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`${PREFIX}/admin/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // =================================================
  // 👑 2. QUẢN LÝ ĐỀ THI (ADMIN)
  // =================================================
  getAllTestsForAdmin: (params) => {
    return axiosClient.get(`${PREFIX}/admin/tests`, { 
      params: {
        is_mock_selector: params?.is_mock_selector || false
      }
    });
  },

  createTest: (data) => {
    return axiosClient.post(`${PREFIX}/admin/tests`, data);
  },

  updateTest: (id, data) => {
    return axiosClient.put(`${PREFIX}/admin/tests/${id}`, data);
  },

  deleteTest: (id) => {
    return axiosClient.delete(`${PREFIX}/admin/tests/${id}`);
  },

  // =================================================
  // 🎓 3. LẤY ĐỀ THI (HỌC VIÊN & ADMIN XEM CHI TIẾT)
  // =================================================
  getPublicTests: (params) => {
    return axiosClient.get(`${PREFIX}/tests`, {
      params: {
        skip: params?.skip || 0,
        limit: params?.limit || 100
      }
    });
  },

  getTestDetail: (id) => {
    return axiosClient.get(`${PREFIX}/tests/${id}`);
  },

  // =================================================
  // 📝 4. NỘP BÀI VÀ CHẤM ĐIỂM (HỌC VIÊN)
  // =================================================
  savePart: (data) => {
    // data: { test_id, part_number, audio_url, is_full_test_only, submission_id (nếu từ lần 2) }
    return axiosClient.post(`${PREFIX}/save-part`, data);
  },

  finishTest: (submissionId) => {
    return axiosClient.post(`${PREFIX}/finish/${submissionId}`);
  },

  getMyHistory: () => {
    return axiosClient.get(`${PREFIX}/submissions/me`);
  },

  // API này dùng chung cho cả Student xem lại bài và Admin vào chấm điểm
  getSubmissionDetail: (submissionId) => {
    return axiosClient.get(`${PREFIX}/submissions/${submissionId}`);
  },

  // =================================================
  // 🏆 5. QUẢN LÝ BÀI NỘP (ADMIN)
  // =================================================
  
  // 🔥 CẬP NHẬT LỚN: Xử lý logic tính page -> skip cho Table Ant Design
  getAllSubmissionsForAdmin: (params) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const queryParams = { skip, limit };

    // Chỉ đẩy status lên URL nếu thực sự có giá trị lọc (PENDING, GRADED)
    if (params?.status && params.status !== 'ALL' && params.status !== '') {
      queryParams.status = params.status;
    }

    return axiosClient.get(`${PREFIX}/admin/submissions`, { params: queryParams });
  },

  getUserHistoryForAdmin: (userId) => {
    return axiosClient.get(`${PREFIX}/admin/users/${userId}/submissions`);
  },

  // 🔥 CẬP NHẬT LỚN: Đổi tên hàm và URL từ "override" sang "grade"
  gradeSubmission: (submissionId, data) => {
    // data payload mới: 
    // { 
    //   total_score, 
    //   cefr_level, 
    //   overall_feedback,
    //   part_feedbacks: [ { part_number, score, comments }, ... ]
    // }
    return axiosClient.put(`${PREFIX}/admin/submissions/${submissionId}/grade`, data);
  }
};

export default speakingAptisAdminApi;