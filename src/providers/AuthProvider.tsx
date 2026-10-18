import React, { useCallback, useEffect, useState, type ReactNode } from 'react';
import { loginUser } from '../api/auth.request';
import { AuthContext } from './AuthContext';
import {
  ACCESS_TOKEN_KEY,
  AUTH_UNAUTHORIZED_EVENT,
} from '../constants/endpoints.constants';
import type { LoginDTO } from '../types/auth.dto';
import { getStoredToken } from '../utils/session';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getStoredToken);

  const login = async (credencials: LoginDTO) => {
    const data = await loginUser(credencials);
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    setToken(data.access_token);
  };

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setToken(null);
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, logout);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, logout);
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
