import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../src/api/axios.instance';
import {
  createNewDrink,
  getAllDrinks,
  getAllItemDrinks,
  updateDrinkAvailability,
} from '../../src/api/drinks.request';
import {
  API_BASE_URL,
  DRINKS_ERROR_MESSAGES,
} from '../../src/constants/endpoints.constants';
import type { DrinksDto, GetDrinkCatalogDto } from '../../src/types/drinks.dto';

const COBOT_ID = 'CBT000T';

const ok = (data: unknown) => ({ data }) as AxiosResponse;

const networkError = () => new AxiosError('Network Error', 'ERR_NETWORK');

// Espera a que la promesa se rechace y devuelve el error para inspeccionarlo.
const captureError = async (promise: Promise<unknown>): Promise<Error> => {
  try {
    await promise;
  } catch (error) {
    return error as Error;
  }
  throw new Error('La promesa debía rechazarse');
};

describe('getAllDrinks', () => {
  it('pide las bebidas del cobot y devuelve el cuerpo de la respuesta', async () => {
    const data: DrinksDto = {
      items: [
        { nombre_item: 'Mojito Clásico', precio_item: '5.50', estado: true },
      ],
    };
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue(ok(data));

    const result = await getAllDrinks(COBOT_ID);

    expect(get).toHaveBeenCalledWith(
      `${API_BASE_URL}/admin/catalog/get/${COBOT_ID}`,
    );
    expect(result).toEqual(data);
  });

  it('traduce un error de Axios al mensaje amigable y conserva la causa', async () => {
    const cause = networkError();
    vi.spyOn(apiClient, 'get').mockRejectedValue(cause);

    const error = await captureError(getAllDrinks(COBOT_ID));

    expect(error.message).toBe(DRINKS_ERROR_MESSAGES.unavailable);
    expect(error.cause).toBe(cause);
  });
});

// En describe('getAllItemDrinks', ...) dentro de tests/unit/drinks.request.test.ts:
describe('getAllItemDrinks', () => {
  it('pide el catálogo completo de bebidas y devuelve el cuerpo de la respuesta', async () => {
    const data: GetDrinkCatalogDto = {
      items: [
        {
          id_item: 1,
          nombre_item: 'Mojito Clásico',
        },
      ],
    };
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue(ok(data));

    const result = await getAllItemDrinks();

    expect(get).toHaveBeenCalledWith(`${API_BASE_URL}/catalog/all-items`);
    expect(result).toEqual(data);
  });

  it('traduce un error de Axios al mensaje amigable y conserva la causa', async () => {
    const cause = networkError();
    vi.spyOn(apiClient, 'get').mockRejectedValue(cause);

    const error = await captureError(getAllItemDrinks());

    expect(error.message).toBe(DRINKS_ERROR_MESSAGES.unavailable);
    expect(error.cause).toBe(cause);
  });
});

describe('updateDrinkAvailability', () => {
  it('envía el PATCH con los nombres que espera el backend', async () => {
    const patch = vi
      .spyOn(apiClient, 'patch')
      .mockResolvedValue(ok({ status: 'success' }));

    await expect(
      updateDrinkAvailability(COBOT_ID, 'CocaCola', true),
    ).resolves.toBeUndefined();

    expect(patch).toHaveBeenCalledWith('/catalog/update-state', {
      item_state: true,
      item_name: 'CocaCola',
      id_cobot: COBOT_ID,
    });
  });

  it('traduce un error de Axios al mensaje de estado y conserva la causa', async () => {
    const cause = networkError();
    vi.spyOn(apiClient, 'patch').mockRejectedValue(cause);

    const error = await captureError(
      updateDrinkAvailability(COBOT_ID, 'CocaCola', false),
    );

    expect(error.message).toBe(DRINKS_ERROR_MESSAGES.updateStateFailed);
    expect(error.cause).toBe(cause);
  });
});

describe('createNewDrink', () => {
  // Crear una bebida ahora es crear un ítem del catálogo: sin precio, estado ni cobot.
  const newDrink: Parameters<typeof createNewDrink>[0] = {
    itemName: 'Ron con Cola',
    ingredients: 'Ron, Coca-Cola',
    image: 'ron-con-cola.png',
    modbusCode: 7,
  };

  it('envía el POST con el cuerpo traducido a los nombres del backend', async () => {
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue(ok({ mensaje: 'Item creado' }));

    await expect(createNewDrink(newDrink)).resolves.toBeUndefined();

    expect(post).toHaveBeenCalledWith('/catalog/add-item', {
      nombre_item: 'Ron con Cola',
      ingredientes: 'Ron, Coca-Cola',
      imagen: 'ron-con-cola.png',
      codigo_modbus: 7,
    });
  });

  it('traduce un error de Axios al mensaje de creación y conserva la causa', async () => {
    const cause = networkError();
    vi.spyOn(apiClient, 'post').mockRejectedValue(cause);

    const error = await captureError(createNewDrink(newDrink));

    expect(error.message).toBe(DRINKS_ERROR_MESSAGES.createNewDrink);
    expect(error.cause).toBe(cause);
  });
});
