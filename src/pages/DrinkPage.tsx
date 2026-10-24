import { useState } from 'react';
import { SelectList } from '../components/SelectList.component';
import { Button } from '../components/Button.component';
import { CreateDrinkModal } from './CreateDrinkPage';
import DrinkMenu from './DrinkMenu';
import { useCobots } from '../hooks/useCobot';

export default function DrinkPage() {
  const { cobots, isLoading, error } = useCobots();
  const [cobotId, setCobotId] = useState('');
  const [isOpen, setOpen] = useState(false);
  const [menuVersion, setMenuVersion] = useState(0);

  const options = cobots.map((cobot) => ({
    value: cobot.id_cobot,
    label: cobot.nombre_cobot,
  }));

  return (
    <section className="w-full">
      <h1 className="text-5xl font-bold text-black">Configuración de menú</h1>

      <div className="mt-8 mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SelectList
          className="w-full max-w-xl"
          options={options}
          value={cobotId}
          onChange={setCobotId}
          placeholder="Seleccione un cobot"
          searchPlaceholder="Buscar cobot..."
          emptyMessage="No hay cobots que coincidan"
          isLoading={isLoading}
        />

        <Button
          variant="primary"
          size="xl"
          className="w-full md:w-auto"
          disabled={isLoading || !!error || options.length === 0}
          onClick={() => setOpen(true)}
        >
          Agregar bebida
        </Button>
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
    </section>
  );
}
