import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ACCESS_TOKEN_KEY } from '../../src/constants/endpoints.constants';
import { AuthProvider } from '../../src/providers/AuthProvider';
import { ProtectedRoute } from '../../src/routes/ProtectedRoute';

const renderAt = (path: string) =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<h1>Pantalla de login</h1>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<h1>Contenido privado</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );

describe('ProtectedRoute', () => {
  it('redirige a /login cuando no hay sesión', () => {
    renderAt('/dashboard');

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  it('muestra el contenido cuando hay sesión', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'token-valido');

    renderAt('/dashboard');

    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
    expect(screen.queryByText('Pantalla de login')).not.toBeInTheDocument();
  });
});
