import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-stone-100 text-stone-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out">
        <header className="bg-bar-950 border-gold-500/40 flex h-24 items-center justify-between border-b px-6 shadow-md md:px-8">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Mostrar menú lateral"
                title="Mostrar menú lateral"
                className="text-steel-300 hover:bg-bar-800 hover:text-gold-500 focus-visible:outline-gold-500 flex size-11 cursor-pointer items-center justify-center rounded-xl border border-white/10 transition-colors focus-visible:outline-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
            )}

            <div className="flex items-center gap-3">
              <span className="bg-gold-500 h-8 w-1.5 rounded-full" />
              <p className="text-xl font-extrabold tracking-tight text-white md:text-3xl">
                Panel Administrador{' '}
                <span className="text-gold-500 font-semibold">
                  | Rony Bartender
                </span>
              </p>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
          <div className="mx-auto max-w-6xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
