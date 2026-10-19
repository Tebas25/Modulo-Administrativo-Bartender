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
    <div className="bg-bar-900 overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full border-collapse">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-white/5">
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={`text-steel-300 px-8 py-5 text-base font-semibold ${ALIGN[column.align ?? 'left']}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-steel-300 px-8 py-12 text-center text-lg"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="border-t border-white/10 transition-colors hover:bg-white/5"
              >
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={`px-8 py-6 text-lg text-white ${ALIGN[column.align ?? 'left']}`}
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
