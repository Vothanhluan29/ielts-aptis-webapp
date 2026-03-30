import axiosClient from '../../../../../services/axiosClient';

// URL gốc cho các thao tác CRUD của Admin
const ADMIN_BASE_URL = '/aptis/listening/admin';

const listeningAptisAdminApi = {
  /**
   * Lấy danh sách đề thi Listening
   * @param {Object} params - { skip, limit, is_mock_selector }
   * @returns Promise
   */
  getTests: (params) => {
    return axiosClient.get(`${ADMIN_BASE_URL}/tests`, { params });
  },

  /**
   * Lấy chi tiết một đề thi (Bao gồm các Parts, Câu hỏi và Audio URL)
   * @param {number} testId 
   * @returns Promise
   */
  getTestDetail: (testId) => {
    return axiosClient.get(`${ADMIN_BASE_URL}/tests/${testId}`);
  },

  /**
   * Tạo đề thi mới
   * @param {Object} data - Cục JSON test_data
   * @returns Promise
   */
  createTest: (data) => {
    return axiosClient.post(`${ADMIN_BASE_URL}/tests`, data);
  },

  /**
   * Cập nhật đề thi (Sử dụng PATCH theo đúng Backend)
   * @param {number} testId 
   * @param {Object} data 
   * @returns Promise
   */
  updateTest: (testId, data) => {
    return axiosClient.patch(`${ADMIN_BASE_URL}/tests/${testId}`, data);
  },

  /**
   * Xóa đề thi
   * @param {number} testId 
   * @returns Promise
   */
  deleteTest: (testId) => {
    return axiosClient.delete(`${ADMIN_BASE_URL}/tests/${testId}`);
  },

  /**
   * Upload File Audio
   * Gọi đến route: /aptis/listening/upload
   * Trả về: { "url": "..." }
   * @param {File} file 
   * @returns Promise
   */
  uploadAudio: (file) => {
    const formData = new FormData();
    formData.append('file', file); // Chú ý: Backend yêu cầu tên field là 'file'
    return axiosClient.post(`/aptis/listening/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

export default listeningAptisAdminApi;