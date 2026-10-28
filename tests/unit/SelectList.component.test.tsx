import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  SelectList,
  type SelectOption,
} from '../../src/components/SelectList.component';

const OPTIONS: SelectOption[] = [
  { value: 'CBT000T', label: 'Cobot JAKA' },
  { value: 'CBT001', label: 'Cobot Estación Norte' },
  { value: 'CBT002', label: 'Cobot Pruebas' },
];

// El componente es controlado: este envoltorio guarda el valor igual que lo hace la pantalla.
function Harness({ onChange }: { onChange?: (value: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <SelectList
      label="Cobot"
      options={OPTIONS}
      value={value}
      placeholder="Seleccione un cobot"
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

// Su nombre accesible es "Cobot" + el valor mostrado; el botón de limpiar no empieza así.
const getTrigger = () => screen.getByRole('button', { name: /^Cobot/ });

describe('SelectList', () => {
  it('abre la lista con todas las opciones y deja el foco en el buscador', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.click(getTrigger());

    expect(
      screen.getAllByRole('option').map((option) => option.textContent),
    ).toEqual(['Cobot JAKA', 'Cobot Estación Norte', 'Cobot Pruebas']);
    expect(screen.getByRole('combobox')).toHaveFocus();
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');
  });

  it('filtra sin distinguir tildes ni mayúsculas y avisa cuando no hay resultados', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(getTrigger());
    const search = screen.getByRole('combobox');

    await user.type(search, 'ESTACION');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(
      screen.getByRole('option', { name: 'Cobot Estación Norte' }),
    ).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'zzz');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  it('al elegir con el clic avisa del valor, cierra la lista y devuelve el foco', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(getTrigger());
    await user.click(
      screen.getByRole('option', { name: 'Cobot Estación Norte' }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('CBT001');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(getTrigger()).toHaveTextContent('Cobot Estación Norte');
    expect(getTrigger()).toHaveFocus();
  });

  it('el botón de limpiar vuelve a "ninguno" y desaparece', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.click(getTrigger());
    await user.click(screen.getByRole('option', { name: 'Cobot JAKA' }));

    await user.click(screen.getByRole('button', { name: 'Limpiar selección' }));

    expect(onChange).toHaveBeenLastCalledWith('');
    expect(getTrigger()).toHaveTextContent('Seleccione un cobot');
    expect(
      screen.queryByRole('button', { name: 'Limpiar selección' }),
    ).not.toBeInTheDocument();
  });

  it('se maneja con el teclado: ↓ abre y mueve, Enter elige y Esc cierra', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.tab();
    expect(getTrigger()).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('CBT001');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(getTrigger()).toHaveFocus();
  });
});
