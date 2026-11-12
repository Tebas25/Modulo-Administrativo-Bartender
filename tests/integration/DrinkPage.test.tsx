import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../src/api/axios.instance';
import { ToastProvider } from '../../src/components/Toast.provider';
import {
  API_BASE_URL,
  COBOT_ERROR_MESSAGES,
} from '../../src/constants/endpoints.constants';
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

const renderPage = () =>
  render(
    <ToastProvider>
      <DrinkPage />
    </ToastProvider>,
  );

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
    renderPage();

    expect(
      screen.getByText('Elija un cobot para ver y configurar su menú.'),
    ).toBeInTheDocument();
    await waitFor(() => expect(getCobotTrigger()).toBeEnabled());
    expect(
      screen.getByRole('button', { name: 'Crear nueva bebida' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Añadir bebida al menú' }),
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
    renderPage();

    await chooseCobot(user, 'Cobot JAKA');
    const table = await screen.findByRole('table', {
      name: 'Bebidas del menú',
    });
    expect(within(table).getByText('Mojito Clásico')).toBeInTheDocument();

    await chooseCobot(user, 'Cobot Norte');
    expect(await screen.findByText('Whisky')).toBeInTheDocument();
    expect(screen.queryByText('Mojito Clásico')).not.toBeInTheDocument();
  });

  it('si falla la lista de cobots, muestra el error y no deja crear ni añadir bebidas', async () => {
    mockGet({
      [COBOTS_URL]: () => {
        throw networkError();
      },
    });
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      COBOT_ERROR_MESSAGES.unavailable,
    );
    expect(
      screen.getByRole('button', { name: 'Crear nueva bebida' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Añadir bebida al menú' }),
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
    renderPage();
    await chooseCobot(user, 'Cobot JAKA');
    await screen.findByRole('table', { name: 'Bebidas del menú' });

    await user.click(
      screen.getByRole('button', { name: 'Crear nueva bebida' }),
    );
    const dialog = screen.getByRole('dialog', { name: 'Crear nueva bebida' });
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

  it('al hacer clic en "Añadir bebida al menú" abre el modal correspondiente y permite cerrarlo', async () => {
    const user = userEvent.setup();
    mockGet({
      [COBOTS_URL]: () => COBOTS,
      [`${API_BASE_URL}/catalog/all-items`]: () => ({
        items: [{ id_item: 1, nombre_item: 'Mojito Clásico' }],
      }),
    });
    renderPage();

    const addBtn = await screen.findByRole('button', {
      name: 'Añadir bebida al menú',
    });
    await waitFor(() => expect(addBtn).toBeEnabled());
    await user.click(addBtn);

    const dialog = screen.getByRole('dialog', {
      name: 'Agregar bebidas al menú',
    });
    expect(dialog).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('si la respuesta de un cobot anterior llega tarde, no pisa la tabla del cobot elegido', async () => {
    const user = userEvent.setup();
    const slowJaka = deferred<DrinksDto>();
    mockGet({
      [COBOTS_URL]: () => COBOTS,
      [drinksUrl('CBT000T')]: () => slowJaka.promise,
      [drinksUrl('CBT001')]: () => MENU_NORTE,
    });
    renderPage();

    await chooseCobot(user, 'Cobot JAKA');
    await chooseCobot(user, 'Cobot Norte');
    expect(await screen.findByText('Whisky')).toBeInTheDocument();

    await act(async () => {
      slowJaka.resolve(MENU_JAKA);
    });

    expect(screen.getByText('Whisky')).toBeInTheDocument();
    expect(screen.queryByText('Mojito Clásico')).not.toBeInTheDocument();
  });
});
