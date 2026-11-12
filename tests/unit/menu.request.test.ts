import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../src/api/axios.instance';
import { addDrinkMenu } from '../../src/api/menu.request';
import { MENU_ERROR_MESSAGES } from '../../src/constants/endpoints.constants';
import type { AddMenuItemDto } from '../../src/types/menu.dto';

const newItem: AddMenuItemDto = {
  itemName: 'Mojito Clásico',
  cobotId: 'CBT000T',
  itemPrice: 5.5,
};

describe('addDrinkMenu', () => {
  it('envía el POST con el cuerpo traducido a los nombres del backend', async () => {
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: { mensaje: 'ok' } } as AxiosResponse);

    await expect(addDrinkMenu(newItem)).resolves.toBeUndefined();

    expect(post).toHaveBeenCalledWith('/catalog/update-item/new', {
      nombre_item: 'Mojito Clásico',
      id_cobot: 'CBT000T',
      precio_item: 5.5,
    });
  });

  it('traduce un error de Axios al mensaje amigable y conserva la causa', async () => {
    const cause = new AxiosError('Network Error', 'ERR_NETWORK');
    vi.spyOn(apiClient, 'post').mockRejectedValue(cause);

    const error = await addDrinkMenu(newItem).catch(
      (caught: unknown) => caught as Error,
    );

    expect(error).toBeInstanceOf(Error);
    // Hoy la request usa "unavailable"; si pasa a MENU_ERROR_MESSAGES.addMenu, cambia esta línea.
    expect((error as Error).message).toBe(MENU_ERROR_MESSAGES.unavailable);
    expect((error as Error).cause).toBe(cause);
  });
});
