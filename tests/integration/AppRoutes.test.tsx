import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ACCESS_TOKEN_KEY } from '../../src/constants/endpoints.constants';
import { AuthProvider } from '../../src/providers/AuthProvider';
import AppRoutes from '../../src/routes/AppRoutes';
import { validToken } from '../helpers/jwt';

vi.mock('../../src/pages/DrinkPage', () => ({
  default: () => <p>Pantalla de menú</p>,
}));

const renderAt = (path: string) =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthProvider>,
  );

const loginTitle = () => screen.queryByText('Panel de administrador');
const menuScreen = () => screen.queryByText('Pantalla de menú');

describe('AppRoutes sin sesión', () => {
  it.each(['/', '/login', '/menu', '/ruta-inexistente'])(
    '%s termina en el login',
    (path) => {
      renderAt(path);

      expect(loginTitle()).toBeInTheDocument();
      expect(menuScreen()).not.toBeInTheDocument();
    },
  );
});

describe('AppRoutes con sesión', () => {
  it.each(['/login', '/ruta-inexistente'])('%s termina en el menú', (path) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, validToken());

    renderAt(path);

    expect(menuScreen()).toBeInTheDocument();
    expect(loginTitle()).not.toBeInTheDocument();
  });

  it('/ pasa por el login y termina en el menú', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, validToken());

    renderAt('/');

    expect(menuScreen()).toBeInTheDocument();
  });

  it('/menu muestra la pantalla dentro del layout y su enlace del sidebar queda activo', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, validToken());

    renderAt('/menu');

    expect(menuScreen()).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Configuración de menú' }),
    ).toHaveAttribute('aria-current', 'page');
  });
});
