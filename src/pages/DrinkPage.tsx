import { DataTable, type Column } from '../components/DataTable.component';
import { Switch } from '../components/Switch.component';
import { useDrinks } from '../hooks/useDrinks';
import type { DrinkItemDto } from '../types/drinks.dto';

const COBOT_ID = 'CBT000T';

export default function DrinksPage() {
  const { drinks, isLoading, error, pendingNames, toggleError, toggleDrink } =
    useDrinks(COBOT_ID);

  const columns: Column<DrinkItemDto>[] = [
    { header: 'Bebida', cell: (drink) => drink.nombre_item },
    {
      header: 'Precio',
      cell: (drink) => `$${Number(drink.precio_item).toFixed(2)}`,
    },
    {
      header: 'Disponibilidad',
      align: 'center',
      cell: (drink) => (
        <div className="flex items-center justify-center gap-4">
          <Switch
            label={`Disponibilidad de ${drink.nombre_item}`}
            checked={drink.estado}
            disabled={pendingNames.includes(drink.nombre_item)}
            onChange={(next) => toggleDrink(drink.nombre_item, next)}
          />
          <span className="w-40 text-left text-lg text-slate-800">
            {drink.estado ? 'Disponible' : 'No disponible'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <section className="w-full">
      <h1 className="text-5xl font-bold text-black">Configuración de menú</h1>
      <p className="mt-3 mb-10 text-xl text-slate-700">
        Activa o desactiva las bebidas que el robot puede preparar.
      </p>

      {toggleError && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-300 bg-red-50 px-6 py-4 text-lg font-medium text-red-700"
        >
          {toggleError}
        </p>
      )}

      {isLoading ? (
        <p role="status" className="text-xl text-slate-700">
          Cargando menú...
        </p>
      ) : error ? (
        <p role="alert" className="text-lg font-medium text-red-600">
          {error}
        </p>
      ) : (
        <DataTable
          caption="Bebidas del menú"
          columns={columns}
          rows={drinks}
          getRowKey={(drink) => drink.nombre_item}
          emptyMessage="Este cobot todavía no tiene bebidas."
        />
      )}
    </section>
  );
}
