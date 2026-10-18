import axios, { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { loginUser } from '../../src/api/auth.request';
import { LOGIN_ERROR_MESSAGES } from '../../src/api/auth.request';

const credentials = { email: 'admin@bar.com', password: '123456' };

const errorWithStatus = (status: number) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { detail: 'texto interno del backend' },
    status,
    statusText: '',
    headers: {},
    config: {},
  } as AxiosResponse);

describe('loginUser', () => {
  it('devuelve el token cuando el login es exitoso', async () => {
    const data = { access_token: 'abc.def.ghi', token_type: 'bearer' };
    vi.spyOn(axios, 'post').mockResolvedValue({ data });

    await expect(loginUser(credentials)).resolves.toEqual(data);
  });

  it.each([400, 401, 404, 422])(
    'con status %i lanza el mensaje genérico de credenciales',
    async (status) => {
      const axiosError = errorWithStatus(status);
      vi.spyOn(axios, 'post').mockRejectedValue(axiosError);

      const promise = loginUser(credentials);

      await expect(promise).rejects.toThrow(
        LOGIN_ERROR_MESSAGES.invalidCredentials,
      );
      await expect(promise).rejects.toMatchObject({ cause: axiosError });
    },
  );

  it('no filtra el texto interno del backend', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(errorWithStatus(401));

    await expect(loginUser(credentials)).rejects.not.toThrow(
      'texto interno del backend',
    );
  });

  it('con error 500 lanza el mensaje de servidor no disponible', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(errorWithStatus(500));

    await expect(loginUser(credentials)).rejects.toThrow(
      LOGIN_ERROR_MESSAGES.unavailable,
    );
  });

  it('sin respuesta (red caída) lanza el mensaje de servidor no disponible', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(
      new AxiosError('Network Error', 'ERR_NETWORK'),
    );

    await expect(loginUser(credentials)).rejects.toThrow(
      LOGIN_ERROR_MESSAGES.unavailable,
    );
  });

  it('relanza los errores que no son de Axios', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(new TypeError('boom'));

    await expect(loginUser(credentials)).rejects.toThrow('boom');
  });
});
