import axios from 'axios';

const API_BASE_URL = 'https://inventory-backend1-vpd8.onrender.com/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // Timeout after 5 seconds
});

// Axios response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's a network error
    if (!error.response) {
      console.warn('API connection error: network unreachable or CORS issues.', API_BASE_URL);
    }
    return Promise.reject(error);
  }
);
