import axios from 'axios';
import { message } from 'antd';
import useAuthStore from '../store/authStore';

// In production, send API traffic through the same-origin Nginx proxy. This
// avoids browser CORS failures when the UI and API use different hostnames.
const API_BASE_URL = import.meta.env.PROD ? '/api' : import.meta.env.VITE_API_BASE_URL;

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

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

    if (response?.status === 401 && originalRequest) {
      const requestUrl = originalRequest.url || '';
      if (
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/refresh') ||
        requestUrl.includes('/auth/google')
      ) {
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          if (!refreshPromise) {
            refreshPromise = axios.post(
              `${API_BASE_URL}/auth/refresh`,
              {},
              { withCredentials: true }
            )
              .catch((refreshError) => {
                useAuthStore.getState().handleSessionExpired();
                throw refreshError;
              })
              .finally(() => {
                refreshPromise = null;
              });
          }

          await refreshPromise;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
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
