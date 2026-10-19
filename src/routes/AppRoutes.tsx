import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES } from '../constants/routes.constants';
import AdminLayout from '../components/layout/AdminLayout';
import DrinksPage from '../pages/DrinkPage';

export default function AppRoute() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.login} replace />} />
      <Route path={ROUTES.login} element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.resume} element={<DrinksPage />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.resume} replace />} />
      </Route>
    </Routes>
  );
}
