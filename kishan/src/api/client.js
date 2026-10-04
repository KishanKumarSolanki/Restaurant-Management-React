import axios from 'axios';

export const TOKEN_KEY = 'cafe_token';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// token expire / invalid -> login page
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    const isAuthCall = url.startsWith('/auth/login') || url.startsWith('/auth/register');
    if (error.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const fieldErrors = (err) => err?.response?.data?.errors || {};
export const errorMessage = (err) => err?.response?.data?.message || err?.message || 'Something went wrong.';
