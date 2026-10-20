import { useState } from 'react';
import { SelectList } from '../components/SelectList.component';
import DrinkMenu from './DrinkMenu';
import { useCobots } from '../hooks/useCobot';

export default function DrinkPage() {
  const { cobots, isLoading, error } = useCobots();
  const [cobotId, setCobotId] = useState('');

  const options = cobots.map((cobot) => ({
    value: cobot.id_cobot,
    label: cobot.nombre_cobot,
  }));

  return (
    <section className="w-full">
      <h1 className="text-5xl font-bold text-black">Configuración de menú</h1>

      <SelectList
        className="mt-8 mb-10 w-full max-w-xl"
        options={options}
        value={cobotId}
        onChange={setCobotId}
        placeholder="Seleccione un cobot"
        searchPlaceholder="Buscar cobot..."
        emptyMessage="No hay cobots que coincidan"
        isLoading={isLoading}
      />

      {error ? (
        <p role="alert" className="text-lg font-medium text-red-600">
          {error}
        </p>
      ) : cobotId === '' ? (
        <p className="text-xl text-slate-700">
          Elija un cobot para ver y configurar su menú.
        </p>
      ) : (
        <DrinkMenu key={cobotId} cobotId={cobotId} />
      )}
    </section>
  );
}
