import { useCallback, useEffect, useRef, useState } from 'react';
import type { DrinkItemDto } from '../types/drinks.dto';
import { getAllDrinks, updateDrinkAvailability } from '../api/drinks.request';
import { DRINKS_ERROR_MESSAGES } from '../constants/endpoints.constants';
import { useToast } from '../components/Toast.provider';

export const useDrinks = (cobotId: string) => {
  const toast = useToast();
  const [isLoading, setLoading] = useState(true);
  const [drinks, setDrinks] = useState<DrinkItemDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingNames, setPendingNames] = useState<string[]>([]);

  const pendingRef = useRef<Set<string>>(new Set());
  const drinksRef = useRef<DrinkItemDto[]>([]);

  const applyDrinks = useCallback((next: DrinkItemDto[]) => {
    drinksRef.current = next;
    setDrinks(next);
  }, []);

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      try {
        const result = await getAllDrinks(cobotId);
        if (!canceled) applyDrinks(result.items ?? []);
      } catch (err) {
        if (!canceled) {
          setError(
            err instanceof Error
              ? err.message
              : DRINKS_ERROR_MESSAGES.unavailable,
          );
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    load();
    return () => {
      canceled = true;
    };
  }, [cobotId, applyDrinks]);

  const toggleDrink = useCallback(
    async (drinkName: string, available: boolean) => {
      if (pendingRef.current.has(drinkName)) return;
      pendingRef.current.add(drinkName);
      setPendingNames((prev) => [...prev, drinkName]);

      try {
        await updateDrinkAvailability(cobotId, drinkName, available);

        const next = drinksRef.current.map((d) =>
          d.nombre_item === drinkName ? { ...d, estado: available } : d,
        );
        applyDrinks(next);

        toast.success({
          title: 'Menú actualizado',
          body: `${drinkName} ahora está ${available ? 'disponible' : 'no disponible'}.`,
        });

        if (!next.some((d) => d.estado)) {
          toast.warning({
            title: 'Menú sin bebidas disponibles',
            body: 'El cobot no podrá recibir pedidos hasta activar al menos una bebida.',
          });
        }
      } catch (err) {
        toast.error({
          title: 'Error al actualizar',
          body:
            err instanceof Error
              ? err.message
              : DRINKS_ERROR_MESSAGES.updateStateFailed,
        });
      } finally {
        pendingRef.current.delete(drinkName);
        setPendingNames((prev) => prev.filter((n) => n !== drinkName));
      }
    },
    [cobotId, toast, applyDrinks],
  );

  return { drinks, isLoading, error, pendingNames, toggleDrink };
};
