import axios from 'axios';

// ✅ Fallback added (VERY IMPORTANT)
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://team-task-manager-production-3a26.up.railway.app';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle expired token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // redirect only if not already on auth pages
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/signup')
      ) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;