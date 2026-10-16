import { ACCESS_TOKEN_KEY } from '../constants/endpoints.constants';
import { isTokenValid } from './jwt';

export function getStoredToken(): string | null {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (token && !isTokenValid(token)) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return null;
  }

  return token;
}
