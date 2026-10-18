import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../../src/components/Button.component';

describe('Button', () => {
  it('muestra su contenido y es type="button" por defecto', () => {
    render(<Button>Guardar</Button>);

    expect(screen.getByRole('button', { name: 'Guardar' })).toHaveAttribute(
      'type',
      'button',
    );
  });

  it('respeta type="submit" cuando se indica', () => {
    render(<Button type="submit">Enviar</Button>);

    expect(screen.getByRole('button', { name: 'Enviar' })).toHaveAttribute(
      'type',
      'submit',
    );
  });

  it('ejecuta onClick al hacer clic', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Aceptar</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Aceptar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('no ejecuta onClick cuando está deshabilitado', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Aceptar
      </Button>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Aceptar' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('aplica la variante y añade className externo', () => {
    render(
      <Button variant="success" className="mi-clase">
        Ok
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Ok' });
    expect(button).toHaveClass('bg-emerald-600', 'mi-clase');
  });

  it('reenvía la ref al elemento button', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
