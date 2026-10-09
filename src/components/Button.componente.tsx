import React from 'react';

export type ButtonVariant =
  | 'primary' // Azul estándar
  | 'success' // Verde sólido
  | 'info' // Celeste / Cyan
  | 'warning' // Amarillo / Dorado
  | 'destructive' // Rojo sólido
  | 'neutral' // Gris tenue (Cancel)
  | 'outline-success'
  | 'outline-info'
  | 'outline-warning'
  | 'outline-destructive'
  | 'outline-primary'
  | 'outline-neutral';

export type SizeButton = 'sm' | 'default' | 'lg';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-500 shadow-sm shadow-blue-500/20',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm shadow-emerald-500/20',
  info: 'bg-[#3b9ab8] text-white hover:bg-[#32839c]',
  warning: 'bg-[#e5a83b] text-zinc-900 hover:bg-[#cf9632] font-semibold',
  destructive: 'bg-[#c94a4a] text-white hover:bg-[#b23f3f]',
  neutral:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',

  'outline-primary':
    'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50',
  'outline-success':
    'bg-transparent border border-emerald-600 text-emerald-600 hover:bg-emerald-50',
  'outline-info':
    'bg-transparent border border-[#3b9ab8] text-[#3b9ab8] hover:bg-cyan-50',
  'outline-warning':
    'bg-transparent border border-[#e5a83b] text-[#c98e29] hover:bg-amber-50',
  'outline-destructive':
    'bg-transparent border border-[#c94a4a] text-[#c94a4a] hover:bg-red-50',
  'outline-neutral':
    'bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50',
};

const sizeStyles: Record<SizeButton, string> = {
  sm: 'h-8 px-3 text-xs',
  default: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: SizeButton;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      type = 'button',
      size = 'default',
      className = '',
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md font-medium',
        'transition-colors focus-visible:ring-2 focus-visible:outline-none',
        'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
      {...props}
    />
  ),
);
