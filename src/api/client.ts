import axios from 'axios';

// Get API base URL from environment variable, default to localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Axios client instance for all API calls
 * Automatically includes auth token in headers
 * Handles 401 unauthorized errors globally
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

/**
 * Request interceptor: Add JWT token to all requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle auth errors globally
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Helper function to handle API errors consistently
 */
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || error.response.statusText || 'Server error occurred';
  } else if (error.request) {
    // Request made but no response received
    return 'No response from server. Please check your connection.';
  } else {
    // Error setting up the request
    return error.message || 'An unexpected error occurred';
  }
};
