import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '../../src/components/Modal.component';

// jsdom no dispara "cancel" al pulsar Esc, así que se emite el evento a mano.
const pressEscape = (dialog: HTMLElement) =>
  fireEvent(dialog, new Event('cancel', { cancelable: true }));

describe('Modal', () => {
  it('se abre como diálogo con su título, su contenido y su pie', () => {
    render(
      <Modal
        title="Agregar bebida"
        onClose={vi.fn()}
        footer={<button type="button">Guardar</button>}
      >
        Contenido del formulario
      </Modal>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Agregar bebida' });
    expect(dialog).toHaveAttribute('open');
    expect(screen.getByText('Contenido del formulario')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('Esc pide cerrar, salvo que esté ocupado, y nunca deja que se cierre solo', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal title="Agregar bebida" onClose={onClose}>
        Contenido
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');

    // false = se llamó a preventDefault: el cierre lo decide quien usa el modal.
    expect(pressEscape(dialog)).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <Modal title="Agregar bebida" onClose={onClose} isBusy>
        Contenido
      </Modal>,
    );
    expect(pressEscape(dialog)).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra al hacer clic en el fondo, pero no dentro ni al arrastrar desde dentro', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Agregar bebida" onClose={onClose}>
        Contenido
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    const content = screen.getByText('Contenido');

    await user.click(content);
    expect(onClose).not.toHaveBeenCalled();

    // Empieza dentro de la tarjeta y termina en el fondo: no debe cerrar.
    fireEvent.pointerDown(content);
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();

    await user.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
