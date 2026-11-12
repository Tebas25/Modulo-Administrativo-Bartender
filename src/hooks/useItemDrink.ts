import { useEffect, useState } from 'react';
import type { GetItemDto } from '../types/drinks.dto';
import { getAllItemDrinks } from '../api/drinks.request';
import { COBOT_ERROR_MESSAGES } from '../constants/endpoints.constants';

export const useItemDrinks = () => {
  const [isLoading, setLoading] = useState(true);
  const [itemDrinks, setItemDrinks] = useState<GetItemDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllItemDrinks = async () => {
      try {
        const result = await getAllItemDrinks();
        setItemDrinks(result.items ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : COBOT_ERROR_MESSAGES.unavailable,
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAllItemDrinks();
  }, []);

  return {
    isLoading,
    itemDrinks,
    error,
  };
};
