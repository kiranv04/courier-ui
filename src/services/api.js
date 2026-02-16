import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Optional: only act if we're not already on login page
      if (!window.location.pathname.includes('/login')) {
        // You can call your logout mutation here if you want full cleanup
        // Or simplest: hard redirect
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;