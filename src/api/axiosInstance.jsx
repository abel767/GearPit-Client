import axios from 'axios';
import { store } from '../redux/store';
import { userLogout, updateTokens } from '../redux/Slices/userSlice';
import { adminLogout } from '../redux/Slices/adminSlice';

// Create axios instance with proper configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // Essential for cookies to work
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// State for tracking refresh token requests
let isRefreshing = false;
let failedQueue = [];

// Process all failed requests in the queue
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

// Request interceptor to add auth token
axiosInstance.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.user.tokens?.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Only handle 401 errors and avoid infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If already refreshing, add to queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/user/refresh-token`,
          {},
          { withCredentials: true } // Important for sending cookies
        );

        const { accessToken } = refreshResponse.data;

        if (accessToken) {
          // Update Redux store with new token
          store.dispatch(updateTokens({ accessToken }));

          // Update current request headers
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Process queued requests
          processQueue(null, accessToken);

          // Retry original request
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear queue and logout user
        processQueue(refreshError, null);
        const state = store.getState();
        
        if (state.admin.isAuthenticated) {
          store.dispatch(adminLogout());
        } else if (state.user.isAuthenticated) {
          store.dispatch(userLogout());
        }
        
        // Redirect to login page if needed
        if (window.location.pathname !== '/user/login') {
          window.location.href = '/user/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For non-401 errors or if refresh failed, just reject
    return Promise.reject(error);
  }
);

export default axiosInstance;