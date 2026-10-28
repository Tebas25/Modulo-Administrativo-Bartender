import { within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';
import { vi } from 'vitest';
import { apiClient } from '../../src/api/axios.instance';
import { API_BASE_URL } from '../../src/constants/endpoints.constants';
import type { CobotDto } from '../../src/types/cobot.dto';
import type { DrinksDto } from '../../src/types/drinks.dto';

export const COBOT_ID = 'CBT000T';
export const COBOTS_URL = `${API_BASE_URL}/catalog/cobots`;
export const drinksUrl = (cobotId: string) =>
  `${API_BASE_URL}/admin/catalog/get/${cobotId}`;

export const COBOTS: CobotDto = {
  items: [
    { id_cobot: 'CBT000T', nombre_cobot: 'Cobot JAKA' },
    { id_cobot: 'CBT001', nombre_cobot: 'Cobot Norte' },
  ],
};

export const MENU_JAKA: DrinksDto = {
  items: [
    { nombre_item: 'Mojito Clásico', precio_item: '5.50', estado: true },
    { nombre_item: 'Cerveza Artesanal', precio_item: '3.50', estado: false },
  ],
};

export const MENU_NORTE: DrinksDto = {
  items: [{ nombre_item: 'Whisky', precio_item: '7.00', estado: true }],
};

// Cuerpo que debe recibir el backend tras llenar el formulario con fillDrinkForm.
export const NEW_DRINK_PAYLOAD = {
  nombre_item: 'Ron con Cola',
  precio_item: 5.5,
  estado: true,
  ingredientes: 'Ron, Coca-Cola',
  codigo_modbus: 7,
  id_cobot: COBOT_ID,
};

export const ok = (data: unknown) => ({ data }) as AxiosResponse;

export const networkError = () =>
  new AxiosError('Network Error', 'ERR_NETWORK');

// Promesa que se resuelve cuando la prueba lo decide (para controlar el orden de las respuestas).
export const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

// Servidor falso: cada URL responde lo que devuelve su función (o rechaza si lanza).
export const mockGet = (routes: Record<string, () => unknown>) =>
  vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
    const route = routes[url];
    if (!route) throw new Error(`Sin ruta simulada para GET ${url}`);
    return ok(await route());
  });

export const countCalls = (
  spy: { mock: { calls: unknown[][] } },
  url: string,
) => spy.mock.calls.filter(([calledUrl]) => calledUrl === url).length;

// Llena el formulario de "Agregar bebida" con los valores de NEW_DRINK_PAYLOAD.
export async function fillDrinkForm(user: UserEvent, dialog: HTMLElement) {
  const form = within(dialog);
  await user.click(form.getByRole('button', { name: /^Cobot/ }));
  await user.click(form.getByRole('option', { name: 'Cobot JAKA' }));
  await user.type(form.getByLabelText('Nombre'), 'Ron con Cola');
  await user.type(form.getByLabelText('Ingredientes'), 'Ron, Coca-Cola');
  await user.type(form.getByLabelText('Precio'), '5.5');
  await user.type(form.getByLabelText('Código Modbus'), '7');
}
