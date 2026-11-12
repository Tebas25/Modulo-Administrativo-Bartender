import { useState } from 'react';
import { SelectList } from '../components/SelectList.component';
import { Button } from '../components/Button.component';
import { CreateDrinkModal } from './CreateDrinkPage';
import DrinkMenu from './DrinkMenu';
import { useCobots } from '../hooks/useCobot';
import { AddItemMenuModal } from './AddItemMenuPage';

export default function DrinkPage() {
  const { cobots, isLoading, error } = useCobots();
  const [cobotId, setCobotId] = useState('');
  const [isOpen, setOpen] = useState(false);
  const [isAddItemOpen, setAddItemOpen] = useState(false);
  const [menuVersion, setMenuVersion] = useState(0);

  const options = cobots.map((cobot) => ({
    value: cobot.id_cobot,
    label: cobot.nombre_cobot,
  }));

  return (
    <section className="w-full">
      <h1 className="text-3xl font-bold text-black sm:text-4xl xl:text-5xl">
        Configuración de menú
      </h1>

      <div className="mt-8 mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6 xl:mt-10 xl:mb-12">
        <SelectList
          className="w-full lg:max-w-xl lg:flex-1 2xl:max-w-2xl"
          options={options}
          value={cobotId}
          onChange={setCobotId}
          placeholder="Seleccione un cobot"
          searchPlaceholder="Buscar cobot..."
          emptyMessage="No hay cobots que coincidan"
          isLoading={isLoading}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 lg:ml-auto xl:gap-6">
          <Button
            variant="primary"
            size="xl"
            className="h-16 w-full px-8 whitespace-nowrap sm:w-auto"
            disabled={isLoading || !!error || options.length === 0}
            onClick={() => setOpen(true)}
          >
            Crear nueva bebida
          </Button>

          <Button
            variant="primary"
            size="xl"
            className="h-16 w-full px-8 whitespace-nowrap sm:w-auto"
            disabled={isLoading || !!error || options.length === 0}
            onClick={() => setAddItemOpen(true)}
          >
            Añadir bebida al menú
          </Button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-lg font-medium text-red-600">
          {error}
        </p>
      ) : cobotId === '' ? (
        <p className="text-xl text-slate-700">
          Elija un cobot para ver y configurar su menú.
        </p>
      ) : (
        <DrinkMenu key={`${cobotId}-${menuVersion}`} cobotId={cobotId} />
      )}

      {isOpen && (
        <CreateDrinkModal
          cobotOptions={options}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            setMenuVersion((version) => version + 1);
          }}
        />
      )}

      {isAddItemOpen && (
        <AddItemMenuModal
          cobotOptions={options}
          onClose={() => setAddItemOpen(false)}
          onSuccess={() => {
            setAddItemOpen(false);
            setMenuVersion((version) => version + 1);
          }}
        />
      )}
    </section>
  );
}
