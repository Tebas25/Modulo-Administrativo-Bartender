import { useEffect, useState } from 'react';
import type { CobotItemDto } from '../types/cobot.dto';
import { getAllCobots } from '../api/cobot.request';
import { COBOT_ERROR_MESSAGES } from '../constants/endpoints.constants';

export const useCobots = () => {
  const [isLoading, setLoading] = useState(true);
  const [cobots, setCobots] = useState<CobotItemDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllCobots = async () => {
      try {
        const result = await getAllCobots();
        setCobots(result.items ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : COBOT_ERROR_MESSAGES.unavailable,
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAllCobots();
  }, []);

  return {
    isLoading,
    cobots,
    error,
  };
};
