import React, { useState, type ReactNode } from 'react';
import { loginUser } from '../api/auth.request';
import { AuthContext } from './AuthContext';
import { ACCESS_TOKEN_KEY } from '../constants/endpoints.constants';
import type { LoginDTO } from '../types/auth.dto';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(ACCESS_TOKEN_KEY),
  );

  const login = async (credencials: LoginDTO) => {
    const data = await loginUser(credencials);
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    setToken(data.access_token);
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
