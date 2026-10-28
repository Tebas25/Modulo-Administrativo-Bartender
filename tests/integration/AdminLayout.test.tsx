import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import AdminLayout from '../../src/components/layout/AdminLayout';
import { ROUTES } from '../../src/constants/routes.constants';
import { ACCESS_TOKEN_KEY } from '../../src/constants/endpoints.constants';
import { AuthProvider } from '../../src/providers/AuthProvider';
import { ProtectedRoute } from '../../src/routes/ProtectedRoute';
import { validToken } from '../helpers/jwt';

// El layout se prueba con una pantalla falsa: aquí no importa qué hay dentro del Outlet.
function renderLayout() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[ROUTES.menu]}>
        <Routes>
          <Route path={ROUTES.login} element={<p>Pantalla de login</p>} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route
                path={ROUTES.menu}
                element={<p>Contenido de la pantalla</p>}
              />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('AdminLayout', () => {
  beforeEach(() => {
    localStorage.setItem(ACCESS_TOKEN_KEY, validToken());
  });

  it('muestra la pantalla dentro del layout y marca como activo el enlace de la ruta actual', () => {
    renderLayout();

    expect(screen.getByText('Contenido de la pantalla')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Configuración de menú' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('cerrar sesión borra el token y lleva al login', async () => {
    const user = userEvent.setup();
    renderLayout();

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    expect(
      screen.queryByText('Contenido de la pantalla'),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
  });

  it('el menú lateral se oculta y se vuelve a mostrar desde el encabezado', async () => {
    const user = userEvent.setup();
    renderLayout();
    expect(
      screen.queryByRole('button', { name: 'Mostrar menú lateral' }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Ocultar menú lateral' }),
    );
    expect(
      screen.getByRole('button', { name: 'Mostrar menú lateral' }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Mostrar menú lateral' }),
    );
    expect(
      screen.queryByRole('button', { name: 'Mostrar menú lateral' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Ocultar menú lateral' }),
    ).toBeInTheDocument();
  });
});
