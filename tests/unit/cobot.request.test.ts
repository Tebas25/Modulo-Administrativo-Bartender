import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../src/api/axios.instance';
import { getAllCobots } from '../../src/api/cobot.request';
import {
  API_BASE_URL,
  COBOT_ERROR_MESSAGES,
} from '../../src/constants/endpoints.constants';
import type { CobotDto } from '../../src/types/cobot.dto';

describe('getAllCobots', () => {
  it('pide la lista de cobots y devuelve el cuerpo de la respuesta', async () => {
    const data: CobotDto = {
      items: [{ id_cobot: 'CBT000T', nombre_cobot: 'Cobot JAKA' }],
    };
    const get = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ data } as AxiosResponse);

    const result = await getAllCobots();

    expect(get).toHaveBeenCalledWith(`${API_BASE_URL}/catalog/cobots`);
    expect(result).toEqual(data);
  });

  it('traduce un error de Axios al mensaje amigable y conserva la causa', async () => {
    const cause = new AxiosError('Network Error', 'ERR_NETWORK');
    vi.spyOn(apiClient, 'get').mockRejectedValue(cause);

    const error = await getAllCobots().catch(
      (caught: unknown) => caught as Error,
    );

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(COBOT_ERROR_MESSAGES.unavailable);
    expect((error as Error).cause).toBe(cause);
  });
});
