import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes.constants';
import { Button } from '../Button.component';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [{ to: ROUTES.menu, label: 'Configuración de menú' }];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'focus-visible:outline-gold-500 flex items-center rounded-xl px-5 py-4 text-lg font-bold whitespace-nowrap transition-colors',
    'focus-visible:outline-2',
    isActive
      ? 'bg-gold-500 text-bar-950 shadow-sm'
      : 'text-steel-300 hover:bg-bar-800 hover:text-white',
  ].join(' ');

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout } = useAuth();

  return (
    <aside
      aria-hidden={!isOpen}
      className={[
        'bg-bar-900 border-gold-500/20 sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden border-r transition-all duration-300 ease-in-out',
        isOpen ? 'w-72 opacity-100 md:w-80' : 'w-0 border-r-0 opacity-0',
      ].join(' ')}
    >
      <div className="flex h-full w-72 flex-col md:w-80">
        <div className="flex h-24 items-center justify-between border-b border-white/10 px-6">
          <div>
            <p className="text-gold-500 text-xs font-bold tracking-widest uppercase">
              SteamLabs
            </p>
            <p className="mt-0.5 text-lg font-extrabold tracking-tight text-white">
              Módulo de Control
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Ocultar menú lateral"
            title="Ocultar menú lateral"
            className="text-steel-300 hover:bg-bar-800 hover:text-gold-500 focus-visible:outline-gold-500 flex size-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 transition-colors focus-visible:outline-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
              />
            </svg>
          </button>
        </div>

        {/* Navegación */}
        <nav aria-label="Principal" className="flex flex-1 flex-col gap-2 p-4">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Cerrar sesión */}
        <div className="border-t border-white/10 p-4">
          <Button
            variant="destructive"
            size="lg"
            className="w-full whitespace-nowrap"
            onClick={logout}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </aside>
  );
}
