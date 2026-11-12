import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useItemDrinks } from '../../src/hooks/useItemDrink';
import { getAllItemDrinks } from '../../src/api/drinks.request';
import { COBOT_ERROR_MESSAGES } from '../../src/constants/endpoints.constants';
import type { GetItemDto } from '../../src/types/drinks.dto';

vi.mock('../../src/api/drinks.request', () => ({
  getAllItemDrinks: vi.fn(),
}));

describe('useItemDrinks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga la lista de bebidas correctamente', async () => {
    const mockItems: GetItemDto[] = [
      {
        id_item: 1,
        nombre_item: 'Mojito',
      },
    ];
    vi.mocked(getAllItemDrinks).mockResolvedValueOnce({ items: mockItems });

    const { result } = renderHook(() => useItemDrinks());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.itemDrinks).toEqual(mockItems);
    });
    expect(result.current.error).toBeNull();
  });

  it('maneja errores con instancia de Error', async () => {
    vi.mocked(getAllItemDrinks).mockRejectedValueOnce(
      new Error('Fallo de red'),
    );

    const { result } = renderHook(() => useItemDrinks());

    await waitFor(() => {
      expect(result.current.error).toBe('Fallo de red');
    });
    expect(result.current.itemDrinks).toEqual([]);
  });

  it('usa COBOT_ERROR_MESSAGES.unavailable cuando el error no es instancia de Error', async () => {
    vi.mocked(getAllItemDrinks).mockRejectedValueOnce('error desconocido');

    const { result } = renderHook(() => useItemDrinks());

    await waitFor(() => {
      expect(result.current.error).toBe(COBOT_ERROR_MESSAGES.unavailable);
    });
  });
});
