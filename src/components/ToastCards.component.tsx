'use client';

import { CircleCheck, Info, TriangleAlert, CircleAlert, X } from 'lucide-react';
import { cn } from '../utils/cn';

export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

interface ToastCardProps {
  variant?: ToastVariant;
  title: string;
  body?: string;
  onDismiss?: () => void;
  className?: string;
}

// Configuración unificada: Ícono, color del borde izquierdo y color del ícono
const toastConfig: Record<
  ToastVariant,
  { icon: React.ElementType; borderClass: string; iconClass: string }
> = {
  success: {
    icon: CircleCheck,
    borderClass: 'border-l-emerald-500',
    iconClass: 'text-emerald-500',
  },
  info: {
    icon: Info,
    borderClass: 'border-l-blue-500',
    iconClass: 'text-blue-500',
  },
  warning: {
    icon: TriangleAlert,
    borderClass: 'border-l-amber-500',
    iconClass: 'text-amber-500',
  },
  error: {
    icon: CircleAlert,
    borderClass: 'border-l-red-500',
    iconClass: 'text-red-500',
  },
};

export function ToastCard({
  variant = 'info',
  title,
  body,
  onDismiss,
  className,
}: ToastCardProps) {
  const { icon: Icon, borderClass, iconClass } = toastConfig[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        // Base de Tailwind: Medidas del enfoque 2 + Borde izquierdo grueso del enfoque 1
        'border-border bg-background flex w-full items-start gap-3 rounded-lg border p-4 shadow-sm transition-all',
        'border-l-[4px]',
        borderClass,
        className,
      )}
    >
      <Icon
        className={cn('mt-0.5 size-5 shrink-0', iconClass)}
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-foreground text-sm font-semibold">{title}</span>
        {body && <span className="text-muted-foreground text-xs">{body}</span>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-muted-foreground hover:bg-foreground/10 hover:text-foreground focus-visible:ring-ring shrink-0 rounded-sm p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
