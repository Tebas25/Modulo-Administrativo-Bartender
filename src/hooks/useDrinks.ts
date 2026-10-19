import { useCallback, useEffect, useState } from 'react';
import type { DrinkItemDto } from '../types/drinks.dto';
import { getAllDrinks, updateDrinkAvailability } from '../api/drinks.request';
import { DRINKS_ERROR_MESSAGES } from '../constants/endpoints.constants';

export const useDrinks = (cobotId: string) => {
  const [isLoading, setLoading] = useState(true);
  const [drinks, setDrinks] = useState<DrinkItemDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingNames, setPendingNames] = useState<string[]>([]);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const fetchDrinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllDrinks(cobotId);
      setDrinks(result.items ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : DRINKS_ERROR_MESSAGES.unavailable,
      );
    } finally {
      setLoading(false);
    }
  }, [cobotId]);

  const toggleDrink = useCallback(
    async (drinkName: string, available: boolean) => {
      if (pendingNames.includes(drinkName)) return;
      setPendingNames((prev) => [...prev, drinkName]);
      try {
        setToggleError(null);
        await updateDrinkAvailability(cobotId, drinkName, available);
        setDrinks((prev) =>
          prev.map((drink) =>
            drink.nombre_item === drinkName
              ? { ...drink, estado: available }
              : drink,
          ),
        );
      } catch (err) {
        setToggleError(
          err instanceof Error
            ? err.message
            : DRINKS_ERROR_MESSAGES.updateStateFailed,
        );
      } finally {
        setPendingNames((prev) => prev.filter((name) => name !== drinkName));
      }
    },
    [cobotId, pendingNames],
  );

  useEffect(() => {
    fetchDrinks();
  }, [fetchDrinks]);

  return {
    drinks,
    isLoading,
    error,
    pendingNames,
    toggleError,
    toggleDrink,
  };
};
