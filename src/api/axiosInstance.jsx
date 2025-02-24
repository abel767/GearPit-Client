import axios from 'axios';
import { store } from '../redux/store';
import { userLogout } from '../redux/Slices/userSlice';
import { adminLogout } from '../redux/Slices/adminSlice';

// Determine the appropriate baseURL based on the current environment
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
const backendUrl = isLocalhost 
                  ? 'http://localhost:3000' 
                  : import.meta.env.VITE_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
  }
});

// Rest of your code remains the same
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.user.tokens?.accessToken;
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          }).catch(err => Promise.reject(err));
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axiosInstance.post('/user/refresh-token');
        const { accessToken } = response.data;

        if (accessToken) {
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          processQueue(null, accessToken);
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        const state = store.getState();
        if (state.admin.isAuthenticated) {
          store.dispatch(adminLogout());
        } else if (state.user.isAuthenticated) {
          store.dispatch(userLogout());
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;