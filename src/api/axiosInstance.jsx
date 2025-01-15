// utils/axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true // Important for sending cookies
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't retry if it's already been retried or it's a 401 from the refresh endpoint
        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.url?.includes('refresh-token')) {
            
            originalRequest._retry = true;

            try {
                // The refresh endpoint will automatically set new cookies
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/user/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                // Retry the original request
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Handle refresh failure (e.g., redirect to login)
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