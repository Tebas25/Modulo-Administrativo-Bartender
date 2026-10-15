import { Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES } from '../constants/routes.constants';

function DashboardPlaceholder() {
  return <h1>Panel de Administración (Protegido)</h1>;
}

export default function AppRoute() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.dashboard} element={<DashboardPlaceholder />} />
      </Route>
    </Routes>
  );
}
