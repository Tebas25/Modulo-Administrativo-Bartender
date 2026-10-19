import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="bg-navy-600 px-6 py-6 md:px-10 md:py-8">
        <p className="text-2xl font-bold text-white md:text-4xl">
          Panel administrador - Rony Bartender
        </p>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar />
        <main className="min-w-0 flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
