import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ Handle 401 errors (but NOT for login page)
axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // ✅ Only redirect if it's NOT the login endpoint
        if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Create typed wrapper
const apiClient = {
    get: <T = any>(url: string, config?: any): Promise<T> => {
        return axiosInstance.get(url, config);
    },
    post: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
        return axiosInstance.post(url, data, config);
    },
    put: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
        return axiosInstance.put(url, data, config);
    },
    delete: <T = any>(url: string, config?: any): Promise<T> => {
        return axiosInstance.delete(url, config);
    },
    patch: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
        return axiosInstance.patch(url, data, config);
    },
};

export default apiClient;
