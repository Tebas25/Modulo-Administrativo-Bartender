type LoadingSize = 'sm' | 'md' | 'lg';

const SPINNER_SIZE: Record<LoadingSize, string> = {
  sm: 'size-5',
  md: 'size-8',
  lg: 'size-12',
};

const LABEL_SIZE: Record<LoadingSize, string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
};

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className = 'size-5' }: SpinnerProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 50 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      className={`animate-spin motion-reduce:[animation-duration:3s] ${className}`}
    >
      <circle cx="25" cy="25" r="20" className="opacity-25" />
      <circle
        cx="25"
        cy="25"
        r="20"
        strokeLinecap="round"
        strokeDasharray="31.4 125.6"
      />
    </svg>
  );
}

interface LoadingProps {
  label?: string;
  size?: LoadingSize;
  hideLabel?: boolean;
  centered?: boolean;
  className?: string;
}

export function Loading({
  size = 'md',
  hideLabel = false,
  centered = false,
  className = '',
}: LoadingProps) {
  return (
    <div
      role="status"
      className={`items-center gap-4 ${centered ? 'flex justify-center py-16' : 'inline-flex'} ${className}`}
    >
      <Spinner className={`${SPINNER_SIZE[size]} text-gold-600`} />
      <span
        className={hideLabel ? 'sr-only' : `font-medium ${LABEL_SIZE[size]}`}
      ></span>
    </div>
  );
}
