import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes.constants';
import { Button } from '../Button.component';

const NAV_ITEMS = [{ to: ROUTES.menu, label: 'Configuración de menú' }];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'focus-visible:outline-gold-500 rounded-xl px-6 py-5 text-2xl font-bold transition-colors',
    'focus-visible:outline-2',
    isActive
      ? 'bg-gold-500 text-bar-950 shadow-inner'
      : 'text-steel-300 hover:bg-white/10',
  ].join(' ');

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="bg-bar-900 flex flex-col md:w-80 md:shrink-0 xl:w-96">
      <nav aria-label="Principal" className="flex flex-1 flex-col gap-3 p-4">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Button
          variant="destructive"
          size="lg"
          className="w-full"
          onClick={logout}
        >
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
