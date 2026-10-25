import type { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
}

const ALIGN = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowKey,
  emptyMessage = 'No hay datos para mostrar.',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse">
        <caption className="sr-only">{caption}</caption>
        {/* Header de la tabla con color distinto (Pizarra oscuro + acento dorado) */}
        <thead>
          <tr className="bg-bar-800 border-gold-500 border-b-2">
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={`text-gold-100 px-8 py-4 text-sm font-bold tracking-wider uppercase ${ALIGN[column.align ?? 'left']}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Cuerpo de la tabla blanco con textos oscuros legibles */}
        <tbody className="divide-y divide-slate-200 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-8 py-12 text-center text-lg text-slate-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="transition-colors duration-150 hover:bg-amber-50/40"
              >
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={`px-8 py-5 text-lg font-medium text-slate-800 ${ALIGN[column.align ?? 'left']}`}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
