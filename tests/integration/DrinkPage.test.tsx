import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../src/api/axios.instance';
import { COBOT_ERROR_MESSAGES } from '../../src/constants/endpoints.constants';
import DrinkPage from '../../src/pages/DrinkPage';
import type { DrinksDto } from '../../src/types/drinks.dto';
import {
  COBOTS,
  COBOTS_URL,
  MENU_JAKA,
  MENU_NORTE,
  NEW_DRINK_PAYLOAD,
  countCalls,
  deferred,
  drinksUrl,
  fillDrinkForm,
  mockGet,
  networkError,
  ok,
} from '../helpers/catalog';

// El selector de la página es el único botón con aria-expanded="false" mientras no hay modal.
const getCobotTrigger = () => screen.getByRole('button', { expanded: false });

async function chooseCobot(user: UserEvent, name: string) {
  await waitFor(() => expect(getCobotTrigger()).toBeEnabled());
  await user.click(getCobotTrigger());
  await user.click(screen.getByRole('option', { name }));
}

describe('DrinkPage', () => {
  it('al entrar pide elegir un cobot y no muestra ninguna tabla', async () => {
    mockGet({ [COBOTS_URL]: () => COBOTS });
    render(<DrinkPage />);

    expect(
      screen.getByText('Elija un cobot para ver y configurar su menú.'),
    ).toBeInTheDocument();
    await waitFor(() => expect(getCobotTrigger()).toBeEnabled());
    expect(
      screen.getByRole('button', { name: 'Agregar bebida' }),
    ).toBeEnabled();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('al elegir un cobot carga su tabla, y al cambiar de cobot la reemplaza', async () => {
    const user = userEvent.setup();
    mockGet({
      [COBOTS_URL]: () => COBOTS,
      [drinksUrl('CBT000T')]: () => MENU_JAKA,
      [drinksUrl('CBT001')]: () => MENU_NORTE,
    });
    render(<DrinkPage />);

    await chooseCobot(user, 'Cobot JAKA');
    const table = await screen.findByRole('table', {
      name: 'Bebidas del menú',
    });
    expect(within(table).getByText('Mojito Clásico')).toBeInTheDocument();

    await chooseCobot(user, 'Cobot Norte');
    expect(await screen.findByText('Whisky')).toBeInTheDocument();
    expect(screen.queryByText('Mojito Clásico')).not.toBeInTheDocument();
  });

  it('si falla la lista de cobots, muestra el error y no deja agregar bebidas', async () => {
    mockGet({
      [COBOTS_URL]: () => {
        throw networkError();
      },
    });
    render(<DrinkPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      COBOT_ERROR_MESSAGES.unavailable,
    );
    expect(
      screen.getByRole('button', { name: 'Agregar bebida' }),
    ).toBeDisabled();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('al crear una bebida cierra el modal y recarga la tabla con la bebida nueva', async () => {
    const user = userEvent.setup();
    let menu: DrinksDto = MENU_JAKA;
    const get = mockGet({
      [COBOTS_URL]: () => COBOTS,
      [drinksUrl('CBT000T')]: () => menu,
    });
    const post = vi.spyOn(apiClient, 'post').mockImplementation(async () => {
      menu = {
        items: [
          ...MENU_JAKA.items,
          { nombre_item: 'Ron con Cola', precio_item: '5.50', estado: true },
        ],
      };
      return ok({ mensaje: 'Item creado correctamente' });
    });
    render(<DrinkPage />);
    await chooseCobot(user, 'Cobot JAKA');
    await screen.findByRole('table', { name: 'Bebidas del menú' });

    await user.click(screen.getByRole('button', { name: 'Agregar bebida' }));
    const dialog = screen.getByRole('dialog', { name: 'Agregar bebida' });
    await fillDrinkForm(user, dialog);
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/catalog/add-item', NEW_DRINK_PAYLOAD),
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(await screen.findByText('Ron con Cola')).toBeInTheDocument();
    expect(countCalls(get, drinksUrl('CBT000T'))).toBe(2);
  });

  it('si la respuesta de un cobot anterior llega tarde, no pisa la tabla del cobot elegido', async () => {
    const user = userEvent.setup();
    const slowJaka = deferred<DrinksDto>();
    mockGet({
      [COBOTS_URL]: () => COBOTS,
      [drinksUrl('CBT000T')]: () => slowJaka.promise,
      [drinksUrl('CBT001')]: () => MENU_NORTE,
    });
    render(<DrinkPage />);

    await chooseCobot(user, 'Cobot JAKA'); // su respuesta tarda
    await chooseCobot(user, 'Cobot Norte'); // el admin cambia antes de que llegue
    expect(await screen.findByText('Whisky')).toBeInTheDocument();

    await act(async () => {
      slowJaka.resolve(MENU_JAKA);
    });

    expect(screen.getByText('Whisky')).toBeInTheDocument();
    expect(screen.queryByText('Mojito Clásico')).not.toBeInTheDocument();
  });
});
