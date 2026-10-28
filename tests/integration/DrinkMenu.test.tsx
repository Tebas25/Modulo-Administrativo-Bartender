import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../src/api/axios.instance';
import { DRINKS_ERROR_MESSAGES } from '../../src/constants/endpoints.constants';
import DrinkMenu from '../../src/pages/DrinkMenu';
import {
  COBOT_ID,
  MENU_JAKA,
  deferred,
  drinksUrl,
  mockGet,
  networkError,
  ok,
} from '../helpers/catalog';

const getToggle = (drinkName: string) =>
  screen.findByRole('switch', { name: `Disponibilidad de ${drinkName}` });

describe('DrinkMenu', () => {
  it('muestra "cargando" y luego la tabla con el precio y la disponibilidad de cada bebida', async () => {
    mockGet({ [drinksUrl(COBOT_ID)]: () => MENU_JAKA });
    render(<DrinkMenu cobotId={COBOT_ID} />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    const table = await screen.findByRole('table', {
      name: 'Bebidas del menú',
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(within(table).getByText('$5.50')).toBeInTheDocument();
    expect(await getToggle('Mojito Clásico')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(await getToggle('Cerveza Artesanal')).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('el toggle espera al servidor: se bloquea mientras responde y luego cambia', async () => {
    const user = userEvent.setup();
    mockGet({ [drinksUrl(COBOT_ID)]: () => MENU_JAKA });
    const response = deferred<void>();
    const patch = vi.spyOn(apiClient, 'patch').mockImplementation(async () => {
      await response.promise;
      return ok({ status: 'success' });
    });
    render(<DrinkMenu cobotId={COBOT_ID} />);
    const toggle = await getToggle('Mojito Clásico');

    await user.click(toggle);

    expect(patch).toHaveBeenCalledWith('/catalog/update-state', {
      item_state: false,
      item_name: 'Mojito Clásico',
      id_cobot: COBOT_ID,
    });
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    response.resolve();

    await waitFor(() =>
      expect(toggle).toHaveAttribute('aria-checked', 'false'),
    );
    expect(toggle).toBeEnabled();
  });

  it('si el toggle falla, avisa, conserva el estado anterior y desbloquea el switch', async () => {
    const user = userEvent.setup();
    mockGet({ [drinksUrl(COBOT_ID)]: () => MENU_JAKA });
    vi.spyOn(apiClient, 'patch').mockRejectedValue(networkError());
    render(<DrinkMenu cobotId={COBOT_ID} />);
    const toggle = await getToggle('Mojito Clásico');

    await user.click(toggle);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      DRINKS_ERROR_MESSAGES.updateStateFailed,
    );
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toBeEnabled();
  });

  it('si falla la carga inicial, muestra el error y no dibuja la tabla', async () => {
    mockGet({
      [drinksUrl(COBOT_ID)]: () => {
        throw networkError();
      },
    });
    render(<DrinkMenu cobotId={COBOT_ID} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      DRINKS_ERROR_MESSAGES.unavailable,
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
