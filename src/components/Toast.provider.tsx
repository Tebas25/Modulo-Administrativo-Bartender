import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ToastCard, type ToastVariant } from './ToastCards.component';

export interface ToastOptions {
  variant?: ToastVariant;
  title: string;
  body?: string;
  /** ms. Usa 0 para que no se cierre solo */
  duration?: number;
}

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  body?: string;
  leaving: boolean;
}

type ShortcutOptions = Omit<ToastOptions, 'variant'>;

interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  success: (options: ShortcutOptions) => string;
  info: (options: ShortcutOptions) => string;
  warning: (options: ShortcutOptions) => string;
  error: (options: ShortcutOptions) => string;
}

const MAX_TOASTS = 4;
const EXIT_MS = 200; // debe coincidir con --animate-toast-out

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 6000,
  info: 6000,
  warning: 8000,
  error: 10000,
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const counter = useRef(0);

  const dismissToast = useCallback((id: string) => {
    // Cancela el auto-cierre pendiente
    const autoClose = timers.current.get(id);
    if (autoClose) clearTimeout(autoClose);

    // 1) marca como "saliendo" para disparar la animación
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    );

    // 2) lo elimina cuando termina la animación
    const exitKey = `exit-${id}`;
    if (timers.current.has(exitKey)) return;
    timers.current.set(
      exitKey,
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        timers.current.delete(id);
        timers.current.delete(exitKey);
      }, EXIT_MS),
    );
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = `toast-${++counter.current}`;
      const variant = options.variant ?? 'info';
      const duration = options.duration ?? DEFAULT_DURATION[variant];

      const item: ToastItem = {
        id,
        variant,
        title: options.title,
        body: options.body,
        leaving: false,
      };

      setToasts((prev) => [...prev, item].slice(-MAX_TOASTS));

      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismissToast(id), duration),
        );
      }
      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach(clearTimeout);
      map.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      dismissToast,
      success: (o) => showToast({ ...o, variant: 'success' }),
      info: (o) => showToast({ ...o, variant: 'info' }),
      warning: (o) => showToast({ ...o, variant: 'warning' }),
      error: (o) => showToast({ ...o, variant: 'error' }),
    }),
    [showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        role="region"
        aria-label="Notificaciones"
        className="pointer-events-none fixed top-28 right-4 z-50 flex w-full max-w-sm flex-col gap-3 md:right-8"
      >
        {toasts.map(({ id, variant, title, body, leaving }) => (
          <ToastCard
            key={id}
            variant={variant}
            title={title}
            body={body}
            onDismiss={() => dismissToast(id)}
            className={
              leaving
                ? 'animate-toast-out pointer-events-none motion-reduce:animate-none'
                : 'animate-toast-in pointer-events-auto motion-reduce:animate-none'
            }
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>');
  }
  return ctx;
}
