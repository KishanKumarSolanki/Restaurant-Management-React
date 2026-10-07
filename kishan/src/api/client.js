import axios from 'axios';

export const TOKEN_KEY = 'cafe_token';

function resolveApiBaseURL(value) {
  if (!value) return '/api';

  const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  const path = url.pathname.replace(/\/+$/, '');
  url.pathname = path.endsWith('/api') ? path : `${path}/api`;
  return url.toString().replace(/\/$/, '');
}

const api = axios.create({ baseURL: resolveApiBaseURL(import.meta.env.VITE_API_URL?.trim()) });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const isPublicCall = config.url?.startsWith('/public/');
  if (token && !isPublicCall) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// token expire / invalid -> login page
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    const isAuthCall = url.startsWith('/auth/login') || url.startsWith('/auth/register');
    const isPublicCall = url.startsWith('/public/');
    if (error.response?.status === 401 && !isAuthCall && !isPublicCall) {
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const fieldErrors = (err) => err?.response?.data?.errors || {};
export const errorMessage = (err) => err?.response?.data?.message || err?.message || 'Something went wrong.';
