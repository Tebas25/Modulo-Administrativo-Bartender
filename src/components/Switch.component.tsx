interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'focus-visible:outline-gold-500 relative h-9 w-16 shrink-0 cursor-pointer rounded-full transition-colors duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked
          ? 'bg-gold-500 shadow-inner'
          : 'bg-stone-300 ring-1 ring-stone-400/60 hover:bg-stone-400/80',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'absolute top-0.5 left-0.5 size-8 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200',
          checked ? 'translate-x-7' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}
