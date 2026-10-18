import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { loginUser } from '../../src/api/auth.request';
import {
  ACCESS_TOKEN_KEY,
  AUTH_UNAUTHORIZED_EVENT,
} from '../../src/constants/endpoints.constants';
import { useAuth } from '../../src/hooks/useAuth';
import { AuthProvider } from '../../src/providers/AuthProvider';
import { expiredToken, validToken } from '../helpers/jwt';

vi.mock('../../src/api/auth.request');

const credentials = { email: 'admin@bar.com', password: '123456' };

const renderAuth = () => renderHook(() => useAuth(), { wrapper: AuthProvider });

describe('AuthProvider + useAuth', () => {
  it('inicia sin sesión cuando no hay token guardado', () => {
    const { result } = renderAuth();

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('inicia con sesión cuando ya hay un token en localStorage', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, validToken());

    const { result } = renderAuth();

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('login guarda el token y marca la sesión como activa', async () => {
    vi.mocked(loginUser).mockResolvedValue({
      access_token: 'nuevo-token',
      token_type: 'bearer',
    });
    const { result } = renderAuth();

    await act(async () => {
      await result.current.login(credentials);
    });

    expect(loginUser).toHaveBeenCalledWith(credentials);
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('nuevo-token');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('login fallido propaga el error y no guarda nada', async () => {
    vi.mocked(loginUser).mockRejectedValue(new Error('Credenciales inválidas'));
    const { result } = renderAuth();

    await act(async () => {
      await expect(result.current.login(credentials)).rejects.toThrow(
        'Credenciales inválidas',
      );
    });

    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logout borra el token y cierra la sesión', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, validToken());
    const { result } = renderAuth();

    act(() => {
      result.current.logout();
    });

    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('useAuth lanza un error si se usa fuera del provider', () => {
    // React imprime el error en consola; lo silenciamos para no ensuciar la salida
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth debe usarse dentro de un <AuthProvider>',
    );
  });

  it('inicia sin sesión y borra el token cuando está vencido', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, expiredToken());

    const { result } = renderAuth();

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
  });

  it('el evento de no autorizado cierra la sesión', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, validToken());
    const { result } = renderAuth();

    act(() => {
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    });

    expect(result.current.isAuthenticated).toBe(false);
  });
});
