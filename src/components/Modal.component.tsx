import { useEffect, useId, useRef, type ReactNode } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  isBusy?: boolean;
}

const SIZE = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
} as const;

export function Modal({
  title,
  onClose,
  children,
  footer,
  size = 'md',
  isBusy = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedBackdrop = useRef(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => dialog.close();
  }, []);

  const requestClose = () => {
    if (!isBusy) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onPointerDown={(event) => {
        pressedBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressedBackdrop.current && event.target === event.currentTarget) {
          requestClose();
        }
      }}
      className={`m-auto w-[calc(100%-2rem)] ${SIZE[size]} rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm`}
    >
      <div>
        <h2 id={titleId} className="px-8 pt-8 text-3xl font-bold text-black">
          {title}
        </h2>

        <div className="max-h-[60vh] overflow-y-auto px-8 py-6 text-lg text-slate-700">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-4 px-8 pt-2 pb-8">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
