import axiosClient from '../../../services/axiosClient';

const BASE_URL = '/subscriptions';

export const subscriptionApi = {
  getMyUsage: () => {
    return axiosClient.get(`${BASE_URL}/usage`);
  },
};