import axiosClient from '../../../../../services/axiosClient'; 

const dashboardAptisStudentApi = {

  getOverviewStats: () => {
    const url = '/aptis/stats/overview';
    return axiosClient.get(url);
  },

 
  getProgressData: () => {
    const url = '/aptis/stats/progress';
    return axiosClient.get(url);
  },

 
  getRecentActivities: (limit = 10) => {
    const url = '/aptis/stats/activities';
    return axiosClient.get(url, { params: { limit } });
  }
};

export default dashboardAptisStudentApi;