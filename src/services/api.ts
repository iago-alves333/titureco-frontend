import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// ──── Request: inject JWT ─────────────────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ──── Response: handle 401 globally ───────────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Navigation is handled by React (AuthContext + ProtectedRoute),
      // not by a hard browser redirect that reloads the entire SPA.
    }
    return Promise.reject(error);
  },
);

export default api;
