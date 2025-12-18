import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api` || '/api',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        type: 'network'
      });
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || 'Authentication failed';
      
      // Only redirect and clear token if not on login/register/settings pages
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register') &&
          !window.location.pathname.includes('/settings')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      // Return error with response data intact
      return Promise.reject(error);
    }

    // Handle other HTTP errors - return original error
    return Promise.reject(error);
  }
);

export default api;