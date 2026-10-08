import { Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';

function DashboardPlaceholder() {
  return <h1>Panel de Administración (Protegido)</h1>;
}

export default function AppRoute() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPlaceholder />} />
      </Route>
    </Routes>
  );
}
