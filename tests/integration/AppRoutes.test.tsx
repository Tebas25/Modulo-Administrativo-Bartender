import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ACCESS_TOKEN_KEY } from '../../src/constants/endpoints.constants';
import { AuthProvider } from '../../src/providers/AuthProvider';
import AppRoutes from '../../src/routes/AppRoutes';

const renderAt = (path: string) =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthProvider>,
  );

const loginTitle = () => screen.queryByText('Panel de administrador');
const dashboardTitle = () =>
  screen.queryByText('Panel de Administración (Protegido)');

describe('AppRoutes sin sesión', () => {
  it.each(['/', '/login', '/dashboard', '/ruta-inexistente'])(
    '%s termina en el login',
    (path) => {
      renderAt(path);

      expect(loginTitle()).toBeInTheDocument();
      expect(dashboardTitle()).not.toBeInTheDocument();
    },
  );
});

describe('AppRoutes con sesión', () => {
  it.each(['/login', '/dashboard', '/ruta-inexistente'])(
    '%s termina en el dashboard',
    (path) => {
      localStorage.setItem(ACCESS_TOKEN_KEY, 'token-valido');

      renderAt(path);

      expect(dashboardTitle()).toBeInTheDocument();
      expect(loginTitle()).not.toBeInTheDocument();
    },
  );

  it('/ pasa por el login y termina en el dashboard', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'token-valido');

    renderAt('/');

    expect(dashboardTitle()).toBeInTheDocument();
  });
});
