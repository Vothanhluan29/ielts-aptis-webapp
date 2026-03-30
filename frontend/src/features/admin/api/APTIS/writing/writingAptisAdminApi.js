import axiosClient from '../../../../../services/axiosClient';

const PREFIX = '/aptis/writing/admin';

const writingAptisAdminApi = {
  // 🖼️ 1. UPLOAD HÌNH ẢNH
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`${PREFIX}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 📝 2. QUẢN LÝ ĐỀ THI (TESTS)
  getAllTests: (params) => {
    return axiosClient.get(`${PREFIX}/tests`, { 
      params: {
        skip: params?.skip || 0,
        limit: params?.limit || 100,
        is_mock_selector: params?.is_mock_selector || false
      }
    });
  },

  getTestDetail: (id) => {
    return axiosClient.get(`${PREFIX}/tests/${id}`);
  },

  createTest: (data) => {
    return axiosClient.post(`${PREFIX}/tests`, data);
  },

  updateTest: (id, data) => {
    return axiosClient.put(`${PREFIX}/tests/${id}`, data);
  },

  deleteTest: (id) => {
    return axiosClient.delete(`${PREFIX}/tests/${id}`);
  },

  getAllSubmissions: (params) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    // Khởi tạo object query params chỉ với skip và limit
    const queryParams = { skip, limit };

    // 🔥 Xử lý an toàn: Chỉ gắn status vào URL nếu nó có giá trị thực sự
    if (params?.status && params.status !== 'ALL' && params.status !== '') {
      queryParams.status = params.status;
    }

    // Gắn search nếu có (Lưu ý: Backend Router cần bổ sung tham số này để hoạt động)
    if (params?.search && params.search.trim() !== '') {
      queryParams.search = params.search.trim();
    }

    return axiosClient.get(`${PREFIX}/submissions`, { params: queryParams });
  },

  getSubmissionDetail: (submissionId) => {
    // Path này khớp với router.get("/submissions/{submission_id}") (Dùng chung cho cả User/Admin)
    return axiosClient.get(`/aptis/writing/submissions/${submissionId}`);
  },

  gradeSubmission: (submissionId, data) => {
    return axiosClient.put(`${PREFIX}/submissions/${submissionId}/grade`, data);
  },

  getUserHistory: (userId) => {
    return axiosClient.get(`${PREFIX}/users/${userId}/submissions`);
  },
};

export default writingAptisAdminApi;