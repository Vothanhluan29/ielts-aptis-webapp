import axiosClient from '../../../services/axiosClient';

const adminApi = {
  getStats: () => {
    return axiosClient.get('/admin/stats');
  },
};

export default adminApi;