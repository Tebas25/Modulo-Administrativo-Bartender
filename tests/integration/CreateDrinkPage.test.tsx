import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../src/api/axios.instance';
import { DRINKS_ERROR_MESSAGES } from '../../src/constants/endpoints.constants';
import { CreateDrinkModal } from '../../src/pages/CreateDrinkPage';
import {
  NEW_DRINK_PAYLOAD,
  fillDrinkForm,
  networkError,
  ok,
} from '../helpers/catalog';

const OPTIONS = [{ value: 'CBT000T', label: 'Cobot JAKA' }];

function renderModal() {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  render(
    <CreateDrinkModal
      cobotOptions={OPTIONS}
      onClose={onClose}
      onSuccess={onSuccess}
    />,
  );
  const dialog = screen.getByRole('dialog', { name: 'Agregar bebida' });
  return { dialog, onClose, onSuccess };
}

describe('CreateDrinkModal', () => {
  it('al guardar vacío muestra el error de cada campo y no llama a la API', async () => {
    const user = userEvent.setup();
    const post = vi.spyOn(apiClient, 'post');
    const { dialog, onSuccess } = renderModal();

    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }));

    expect(
      await screen.findByText('Ingrese el nombre de la bebida'),
    ).toBeInTheDocument();
    expect(screen.getByText('Ingrese los ingredientes')).toBeInTheDocument();
    expect(screen.getByText('Ingrese el precio')).toBeInTheDocument();
    expect(screen.getByText('Ingrese el código Modbus')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('al guardar con datos válidos envía el cuerpo correcto y avisa del éxito', async () => {
    const user = userEvent.setup();
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue(ok({ mensaje: 'Item creado correctamente' }));
    const { dialog, onSuccess } = renderModal();

    await fillDrinkForm(user, dialog);
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(post).toHaveBeenCalledWith('/catalog/add-item', NEW_DRINK_PAYLOAD);
  });

  it('si el servidor falla, muestra el error, no avisa del éxito y deja corregir', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, 'post').mockRejectedValue(networkError());
    const { dialog, onSuccess } = renderModal();

    await fillDrinkForm(user, dialog);
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      DRINKS_ERROR_MESSAGES.createNewDrink,
    );
    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'Guardar' }),
    ).toBeEnabled();
  });
});
