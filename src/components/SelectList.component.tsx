import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectListProps {
  label?: string;
  options: SelectOption[];
  /** Valor elegido. La cadena vacía significa "ninguno". */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

// Busca sin distinguir mayúsculas ni tildes ("configuracion" encuentra "Configuración").
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export function SelectList({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccione una opción',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Sin resultados',
  disabled = false,
  isLoading = false,
  className = 'w-full',
}: SelectListProps) {
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const valueId = `${baseId}-value`;
  const listboxId = `${baseId}-listbox`;

  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const isDisabled = disabled || isLoading;
  const selected = options.find((option) => option.value === value);
  const filtered = options.filter((option) =>
    normalize(option.label).includes(normalize(query)),
  );
  const activeId = filtered[activeIndex]
    ? `${baseId}-option-${activeIndex}`
    : undefined;
  const canClear = value !== '' && !isDisabled;

  // Al abrir, el foco pasa al buscador.
  useEffect(() => {
    if (isOpen) searchRef.current?.focus();
  }, [isOpen]);

  // Un clic fuera del componente cierra la lista.
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  // La opción resaltada con el teclado siempre queda visible.
  useEffect(() => {
    if (!isOpen || !activeId) return;
    document.getElementById(activeId)?.scrollIntoView?.({ block: 'nearest' });
  }, [isOpen, activeId]);

  const openList = () => {
    const selectedIndex = options.findIndex((option) => option.value === value);
    setQuery('');
    setActiveIndex(Math.max(selectedIndex, 0));
    setOpen(true);
  };

  const closeList = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const choose = (nextValue: string) => {
    onChange(nextValue);
    closeList();
  };

  const handleClear = () => {
    onChange('');
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' && !isOpen) {
      event.preventDefault();
      openList();
    }
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index) =>
          Math.max(0, Math.min(index + 1, filtered.length - 1)),
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (filtered[activeIndex]) choose(filtered[activeIndex].value);
        break;
      case 'Escape':
        event.preventDefault();
        closeList();
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <span id={labelId} className="mb-2 block text-lg font-bold text-black">
        {label}
      </span>

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          disabled={isDisabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${labelId} ${valueId}`}
          onClick={() => (isOpen ? closeList() : openList())}
          onKeyDown={handleTriggerKeyDown}
          className={[
            'focus-visible:border-navy-600 focus-visible:ring-navy-600/25 flex w-full items-center justify-between gap-3 rounded-xl border-2 bg-white py-4 pl-5 text-left text-xl transition-colors outline-none focus-visible:ring-4',
            canClear ? 'pr-20' : 'pr-5',
            isOpen
              ? 'border-navy-600 ring-navy-600/15 ring-4'
              : 'border-navy-100 hover:border-navy-600',
            isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          ].join(' ')}
        >
          <span
            id={valueId}
            className={`truncate ${selected ? 'font-medium text-black' : 'text-slate-500'}`}
          >
            {isLoading ? 'Cargando...' : (selected?.label ?? placeholder)}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-navy-700 size-5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path
              d="m5 8 5 5 5-5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {canClear && (
          <button
            type="button"
            aria-label="Limpiar selección"
            onClick={handleClear}
            className="text-navy-700 hover:bg-navy-100 focus-visible:ring-navy-600 absolute top-1/2 right-12 -translate-y-1/2 rounded-full p-1.5 outline-none focus-visible:ring-2"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-4"
            >
              <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="border-navy-100 absolute z-20 mt-2 w-full rounded-xl border bg-white p-3 shadow-lg">
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-500"
            >
              <circle cx="9" cy="9" r="5.5" />
              <path d="m13.5 13.5 3.5 3.5" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              aria-expanded={true}
              aria-controls={listboxId}
              aria-activedescendant={activeId}
              aria-autocomplete="list"
              aria-labelledby={labelId}
              value={query}
              placeholder={searchPlaceholder}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleSearchKeyDown}
              className="bg-navy-50 focus:ring-navy-600 w-full rounded-lg py-3 pr-4 pl-11 text-lg text-black outline-none placeholder:text-slate-500 focus:ring-2"
            />
          </div>

          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            className="mt-2 max-h-72 overflow-y-auto"
          >
            {filtered.length === 0 ? (
              <li
                role="presentation"
                className="px-4 py-3 text-lg text-slate-600"
              >
                {emptyMessage}
              </li>
            ) : (
              filtered.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;
                return (
                  <li
                    key={option.value}
                    id={`${baseId}-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(option.value)}
                    className={[
                      'cursor-pointer rounded-lg px-4 py-3 text-lg',
                      isSelected
                        ? 'bg-navy-600 font-semibold text-white'
                        : isActive
                          ? 'bg-navy-100 text-black'
                          : 'text-black',
                    ].join(' ')}
                  >
                    {option.label}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
