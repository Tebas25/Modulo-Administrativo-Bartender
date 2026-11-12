import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from '../../src/components/Toast.provider';
import '@testing-library/jest-dom/vitest';

type Toasts = ReturnType<typeof useToast>;

function Trigger({ show }: { show: (toast: Toasts) => void }) {
  const toast = useToast();
  return (
    <button type="button" onClick={() => show(toast)}>
      Mostrar
    </button>
  );
}

function renderToasts(show: (toast: Toasts) => void) {
  render(
    <ToastProvider>
      <Trigger show={show} />
    </ToastProvider>,
  );
}

const showToasts = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Mostrar' }));

const getRegion = () => screen.getByRole('region', { name: 'Notificaciones' });

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('muestra el aviso con su título y cuerpo: los errores como alerta y el resto como estado', () => {
    renderToasts((toast) => {
      toast.success({ title: 'Guardado', body: 'Todo salió bien' });
      toast.error({ title: 'Falló', body: 'Algo salió mal' });
    });

    showToasts();

    const status = within(getRegion()).getByRole('status');
    expect(status).toHaveTextContent('Guardado');
    expect(status).toHaveTextContent('Todo salió bien');
    expect(within(getRegion()).getByRole('alert')).toHaveTextContent('Falló');
  });

  it('se cierra solo al cumplirse su duración, pero no antes; con duración 0 se queda', () => {
    renderToasts((toast) => {
      toast.info({ title: 'Corto', duration: 1000 });
      toast.info({ title: 'Fijo', duration: 0 });
    });
    showToasts();

    advance(900);
    expect(screen.getByText('Corto')).toBeInTheDocument();

    advance(400);
    expect(screen.queryByText('Corto')).not.toBeInTheDocument();

    advance(60_000);
    expect(screen.getByText('Fijo')).toBeInTheDocument();
  });

  it('el botón de cerrar quita el aviso al terminar su animación de salida', () => {
    renderToasts((toast) => {
      toast.info({ title: 'Aviso', duration: 0 });
    });
    showToasts();

    fireEvent.click(within(screen.getByRole('status')).getByRole('button'));

    advance(250);
    expect(screen.queryByText('Aviso')).not.toBeInTheDocument();
  });

  it('muestra como máximo 4 avisos a la vez y descarta los más antiguos', () => {
    let count = 0;
    renderToasts((toast) => {
      toast.info({ title: `Aviso ${++count}`, duration: 0 });
    });

    for (let i = 0; i < 5; i += 1) {
      showToasts();
    }

    expect(within(getRegion()).getAllByRole('status')).toHaveLength(4);
    expect(screen.queryByText('Aviso 1')).not.toBeInTheDocument();
    expect(screen.getByText('Aviso 5')).toBeInTheDocument();
  });

  it('useToast fuera del proveedor lanza un error claro', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<Trigger show={vi.fn()} />)).toThrow(
      'useToast debe usarse dentro de <ToastProvider>',
    );
  });
});
