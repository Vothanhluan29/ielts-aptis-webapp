import axiosClient from '../../../../services/axiosClient';

const adminUserApi = {
  // 1. Lấy tất cả (Dùng mặc định skip=0, limit=100 như Backend)
 getAllUsers: (skip = 0, limit = 1000) => {
    return axiosClient.get(`/users/?skip=${skip}&limit=${limit}`);
  },

  // 2. Lấy chi tiết
  getUserDetail: (userId) => {
    return axiosClient.get(`/users/${userId}`);
  },

  // 3. Cập nhật (full_name, role, is_active)
  updateUserByAdmin: (userId, updateData) => {
    return axiosClient.patch(`/users/${userId}`, updateData);
  },

  // 4. Xóa tài khoản
  deleteUserByAdmin: (userId) => {
    return axiosClient.delete(`/users/${userId}`);
  }
};

export default adminUserApi;