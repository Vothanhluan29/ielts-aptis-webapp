import axios from 'axios';
import { message } from 'antd';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL_LOCAL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  (error) => {
    const { response } = error;

    if (response && response.status === 401) {
      localStorage.removeItem('access_token');

      if (window.location.pathname !== '/login') {
        message.error('Session expired. Please log in again!');

        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
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