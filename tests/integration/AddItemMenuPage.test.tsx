import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../src/api/axios.instance';
import { ToastProvider } from '../../src/components/Toast.provider';
import { API_BASE_URL } from '../../src/constants/endpoints.constants';
import { AddItemMenuModal } from '../../src/pages/AddItemMenuPage';
import { mockGet, networkError, ok } from '../helpers/catalog';

const OPTIONS = [{ value: 'CBT000T', label: 'Cobot JAKA' }];
const ALL_ITEMS_URL = `${API_BASE_URL}/catalog/all-items`;

const CATALOG_ITEMS = {
  items: [
    { id_item: 1, nombre_item: 'Mojito Clásico' },
    { id_item: 2, nombre_item: 'Ron con Cola' },
  ],
};

function renderModal() {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  render(
    <ToastProvider>
      <AddItemMenuModal
        cobotOptions={OPTIONS}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </ToastProvider>,
  );
  const dialog = screen.getByRole('dialog', {
    name: 'Agregar bebidas al menú',
  });
  return { dialog, onClose, onSuccess };
}

describe('AddItemMenuModal', () => {
  it('al guardar vacío muestra el error de validación y no llama a la API', async () => {
    const user = userEvent.setup();
    mockGet({ [ALL_ITEMS_URL]: () => CATALOG_ITEMS });
    const post = vi.spyOn(apiClient, 'post');
    const { dialog, onSuccess } = renderModal();

    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }));

    expect(
      await within(dialog).findByText('Agregue el precio de la bebida'),
    ).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('al guardar con datos válidos envía el POST, muestra toast de éxito y ejecuta onSuccess', async () => {
    const user = userEvent.setup();
    mockGet({ [ALL_ITEMS_URL]: () => CATALOG_ITEMS });
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue(ok({ mensaje: 'Agregado correctamente' }));
    const { dialog, onSuccess } = renderModal();

    await user.click(within(dialog).getByRole('button', { name: /^Cobot/i }));
    await user.click(
      within(dialog).getByRole('option', { name: 'Cobot JAKA' }),
    );

    await user.click(within(dialog).getByRole('button', { name: /^Bebida/i }));
    await user.click(
      await within(dialog).findByRole('option', { name: 'Mojito Clásico' }),
    );

    await user.type(within(dialog).getByLabelText('Precio'), '5.50');
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('si el servidor falla, muestra el error en el formulario y en el toast y no cierra el modal', async () => {
    const user = userEvent.setup();
    mockGet({ [ALL_ITEMS_URL]: () => CATALOG_ITEMS });
    vi.spyOn(apiClient, 'post').mockRejectedValue(networkError());
    const { dialog, onSuccess } = renderModal();

    await user.click(within(dialog).getByRole('button', { name: /^Cobot/i }));
    await user.click(
      within(dialog).getByRole('option', { name: 'Cobot JAKA' }),
    );

    await user.click(within(dialog).getByRole('button', { name: /^Bebida/i }));
    await user.click(
      await within(dialog).findByRole('option', { name: 'Mojito Clásico' }),
    );

    await user.type(within(dialog).getByLabelText('Precio'), '5.50');
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Ha ocurrido un error. Inténtelo de nuevo más tarde',
    );
    expect(onSuccess).not.toHaveBeenCalled();
    expect(
      within(dialog).getByRole('button', { name: 'Guardar' }),
    ).toBeEnabled();
  });
});
