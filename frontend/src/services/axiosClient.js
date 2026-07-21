import axios from 'axios';
import { message } from 'antd';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = () => {
  refreshSubscribers.map((cb) => cb());
};

axiosClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const { response, config } = error;
    const originalRequest = config;

    if (response && response.status === 401) {
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/google')) {
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          
          isRefreshing = false;
          onRefreshed();
          refreshSubscribers = [];

          return axiosClient(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];

          if (window.location.pathname !== '/login') {
            message.error('Session expired. Please log in again!');
            setTimeout(() => {
              window.location.href = '/login';
            }, 1000);
          }
          return Promise.reject(refreshError);
        }
      } else {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(axiosClient(originalRequest));
          });
        });
      }
    }

    if (response && response.status === 403) {
      const detail = response.data?.detail || "You don't have permission to perform this action";
      message.error(`Access denied: ${detail}`);
    }

    if (response && response.status === 422) {
      message.error('Invalid request data. Please check the form again!');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;