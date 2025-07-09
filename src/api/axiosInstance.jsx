import axios from 'axios';
import { store } from '../redux/store';
import { userLogout, updateTokens } from '../redux/Slices/userSlice';
import { adminLogout } from '../redux/Slices/adminSlice';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://gearpit-server.onrender.com';

console.log('Backend URL:', backendUrl);

const axiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true, // CRITICAL: This must be true for cookies
  timeout: 30000,
  headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
  }
});

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

// Request interceptor - FIXED
axiosInstance.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.user.tokens?.accessToken;
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log('Request with token:', config.url);
  } else {
    console.log('Request without token:', config.url);
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor - FIXED
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
          store.dispatch(updateTokens({ accessToken }));
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        
        // Clear tokens and logout
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