import { createContext } from 'react';
import type { LoginDTO } from '../types/auth.dto';

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (credencial: LoginDTO) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
