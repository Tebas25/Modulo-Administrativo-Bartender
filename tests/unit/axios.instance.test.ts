import { AxiosError, type AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../src/api/axios.instance';
import {
  ACCESS_TOKEN_KEY,
  AUTH_UNAUTHORIZED_EVENT,
} from '../../src/constants/endpoints.constants';

const originalAdapter = apiClient.defaults.adapter;

const respondWith = (status: number) => {
  apiClient.defaults.adapter = async (config) => {
    const response = {
      data: {},
      status,
      statusText: '',
      headers: {},
      config,
    } as AxiosResponse;
    if (status >= 400) {
      throw new AxiosError(
        'fallo',
        'ERR_BAD_REQUEST',
        config,
        undefined,
        response,
      );
    }
    return response;
  };
};

describe('apiClient', () => {
  const onUnauthorized = vi.fn();

  beforeEach(() => {
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
  });

  afterEach(() => {
    window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    onUnauthorized.mockClear();
    apiClient.defaults.adapter = originalAdapter;
  });

  it('añade Authorization: Bearer cuando hay token', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'mi-token');
    respondWith(200);

    const response = await apiClient.get('/ruta');

    expect(response.config.headers.get('Authorization')).toBe(
      'Bearer mi-token',
    );
  });

  it('no añade la cabecera cuando no hay token', async () => {
    respondWith(200);

    const response = await apiClient.get('/ruta');

    expect(response.config.headers.get('Authorization')).toBeUndefined();
  });

  it('con 401 y token: borra el token, emite el evento y relanza el error', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'mi-token');
    respondWith(401);

    await expect(apiClient.get('/ruta')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('con 401 y sin token: no emite el evento, pero relanza el error', async () => {
    respondWith(401);

    await expect(apiClient.get('/ruta')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('con 500 no cierra la sesión pero relanza el error', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'mi-token');
    respondWith(500);

    await expect(apiClient.get('/ruta')).rejects.toMatchObject({
      response: { status: 500 },
    });

    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('mi-token');
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
