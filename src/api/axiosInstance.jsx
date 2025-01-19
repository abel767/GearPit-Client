import axios from 'axios';
import { refreshToken, handleAuthError } from '../services/authService';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // You could add common headers here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.url?.includes('refresh-token')) {
            
            originalRequest._retry = true;

            try {
                await refreshToken();
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Handle refresh failure
                handleAuthError();
                window.dispatchEvent(new CustomEvent('auth-error', {
                    detail: { message: 'Session expired. Please login again.' }
                }));
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;