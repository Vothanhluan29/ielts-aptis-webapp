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

const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
};

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
        localStorage.removeItem('access_token');
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
          
          const newAccessToken = res.data.access_token;
          localStorage.setItem('access_token', newAccessToken);
          
          isRefreshing = false;
          onRefreshed(newAccessToken);
          refreshSubscribers = [];

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest).then(res => res.data);
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];
          localStorage.removeItem('access_token');

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
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axios(originalRequest).then(res => res.data));
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