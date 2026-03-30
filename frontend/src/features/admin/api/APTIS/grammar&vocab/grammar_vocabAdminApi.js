import axiosClient from '../../../../../services/axiosClient';

// Cấu hình URL gốc khớp với prefix của Backend Router dành cho Admin
const BASE_URL = '/aptis/grammar-vocab/admin';

const grammarVocabAdminApi = {
  /**
   * Lấy danh sách đề thi Grammar & Vocab
   * @param {Object} params - { skip, limit, is_mock_selector }
   * @returns Promise
   */
  getTests: (params) => {
    return axiosClient.get(`${BASE_URL}/tests`, { params });
  },

  /**
   * Lấy chi tiết một đề thi (Bao gồm cả đáp án đúng)
   * @param {number} testId 
   * @returns Promise
   */
  getTestDetail: (testId) => {
    return axiosClient.get(`${BASE_URL}/tests/${testId}`);
  },

  /**
   * Tạo đề thi mới
   * @param {Object} data - Payload chứa title, time_limit, is_published, is_full_test_only, questions...
   * @returns Promise
   */
  createTest: (data) => {
    return axiosClient.post(`${BASE_URL}/tests`, data);
  },

  /**
   * Cập nhật đề thi (Sử dụng cơ chế ghi đè list questions)
   * @param {number} testId 
   * @param {Object} data - Payload cập nhật
   * @returns Promise
   */
  updateTest: (testId, data) => {
    return axiosClient.put(`${BASE_URL}/tests/${testId}`, data);
  },

  /**
   * Xóa đề thi
   * @param {number} testId 
   * @returns Promise
   */
  deleteTest: (testId) => {
    return axiosClient.delete(`${BASE_URL}/tests/${testId}`);
  }
};

export default grammarVocabAdminApi;