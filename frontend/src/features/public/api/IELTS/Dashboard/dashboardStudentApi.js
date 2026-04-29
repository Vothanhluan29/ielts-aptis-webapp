import axiosClient from '../../../../../services/axiosClient'; 

const BASE_URL = '/stats';

export const dashboardStudentApi = {

  getOverviewStats: () => {
    return axiosClient.get(`${BASE_URL}/overview`);
  },


  getProgressData: () => {
    return axiosClient.get(`${BASE_URL}/progress`);
  },


  getRecentActivities: (limit = 10) => {
    return axiosClient.get(`${BASE_URL}/activities`, {
      params: { limit }
    });
  }
};