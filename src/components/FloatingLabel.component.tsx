import React, { useId } from 'react';

export type InputStatus = 'default' | 'success' | 'error';
export type InputTone = 'dark' | 'light';

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  status?: InputStatus;
  helperText?: string;
  tone?: InputTone;
}

interface StatusStyle {
  input: string;
  label: string;
  helper: string;
}

const toneStyles: Record<
  InputTone,
  { text: string; status: Record<InputStatus, StatusStyle> }
> = {
  dark: {
    text: 'text-slate-100',
    status: {
      default: {
        input: 'border-steel-400/50 focus:border-gold-500',
        label: 'text-slate-400 peer-focus:text-gold-500',
        helper: 'text-slate-400',
      },
      success: {
        input: 'border-emerald-400 focus:border-emerald-400',
        label: 'text-emerald-400 peer-focus:text-emerald-400',
        helper: 'text-emerald-400',
      },
      error: {
        input: 'border-red-400 focus:border-red-400',
        label: 'text-red-400 peer-focus:text-red-400',
        helper: 'text-red-400',
      },
    },
  },
  light: {
    text: 'text-black',
    status: {
      default: {
        input: 'border-slate-300 focus:border-navy-600',
        label: 'text-slate-500 peer-focus:text-navy-600',
        helper: 'text-slate-600',
      },
      success: {
        input: 'border-emerald-600 focus:border-emerald-600',
        label: 'text-emerald-700 peer-focus:text-emerald-700',
        helper: 'text-emerald-700',
      },
      error: {
        input: 'border-red-600 focus:border-red-600',
        label: 'text-red-600 peer-focus:text-red-600',
        helper: 'text-red-600',
      },
    },
  },
};

export const FloatingInput = React.forwardRef<
  HTMLInputElement,
  FloatingInputProps
>(
  (
    {
      label,
      status = 'default',
      helperText,
      tone = 'dark',
      className = '',
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helperId = `${inputId}-helper`;
    const { text, status: statusByTone } = toneStyles[tone];
    const styles = statusByTone[status];

    return (
      <div className="w-full">
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            placeholder=" "
            aria-invalid={status === 'error'}
            aria-describedby={helperText ? helperId : undefined}
            className={[
              'peer block w-full appearance-none border-0 border-b-2',
              `bg-transparent px-0 py-3 text-base ${text}`,
              'focus:ring-0 focus:outline-none',
              styles.input,
              className,
            ].join(' ')}
            {...props}
          />
          <label
            htmlFor={inputId}
            className={[
              'pointer-events-none absolute start-0 top-3 origin-[0]',
              '-translate-y-6 scale-75 transform text-base duration-300',
              'peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100',
              'peer-focus:-translate-y-6 peer-focus:scale-75',
              styles.label,
            ].join(' ')}
          >
            {label}
          </label>
        </div>

        {helperText && (
          <p id={helperId} className={`mt-1 text-xs ${styles.helper}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

FloatingInput.displayName = 'FloatingInput';
