import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type { LoginResponse, UserResponse, Role } from '@/types/api';

interface AuthUser {
  id: string;
  name: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem('accessToken')));

  const refreshUser = useCallback(async () => {
    const { data } = await api.get<UserResponse>('/api/v1/auth/me');
    setUser({ id: data.id, name: data.name, role: data.role });
  }, []);

  // Hydrate session on mount via GET /api/v1/auth/me
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    api
      .get<UserResponse>('/api/v1/auth/me')
      .then(({ data }) => {
        setUser({ id: data.id, name: data.name, role: data.role });
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        queryClient.clear();
      })
      .finally(() => setIsLoading(false));
  }, [queryClient]);

  // Listen for global auth:logout events triggered by 401 interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      queryClient.clear();
    };
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, [queryClient]);

  const login = useCallback(async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/api/v1/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    queryClient.clear();
    setUser({ id: data.userId, name: data.name, role: data.role });
    return data;
  }, [queryClient]);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch {
      // Best-effort; clear client state regardless
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
