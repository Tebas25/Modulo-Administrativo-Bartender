import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const isAuthenticaded: boolean = false;
  // if (isLoading) return <div>Cargando...</div>

  if (!isAuthenticaded) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
