import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const baseURL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8080';

const api = axios.create({
  baseURL,
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

// ──── Response: handle 401 globally with refresh token rotation ───────────────
let refreshPromise: Promise<string> | null = null;

function clearAuthAndNotify() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.dispatchEvent(new Event('auth:logout'));
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest) {
      const url = originalRequest.url || '';
      const isAuthEndpoint = url.includes('/api/v1/auth/login') || url.includes('/api/v1/auth/refresh');

      if (isAuthEndpoint) {
        if (url.includes('/api/v1/auth/refresh')) {
          clearAuthAndNotify();
        }
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        clearAuthAndNotify();
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        clearAuthAndNotify();
        return Promise.reject(error);
      }

      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${baseURL}/api/v1/auth/refresh`, { refreshToken })
          .then((res) => {
            const { accessToken, refreshToken: newRefreshToken } = res.data;
            localStorage.setItem('accessToken', accessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            return accessToken;
          })
          .catch((refreshError) => {
            clearAuthAndNotify();
            throw refreshError;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        const newAccessToken = await refreshPromise;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
