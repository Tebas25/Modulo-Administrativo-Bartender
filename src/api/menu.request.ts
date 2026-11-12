import { isAxiosError } from 'axios';
import type { AddMenuItemDto, SentAddMenuItemDto } from '../types/menu.dto';
import { apiClient } from './axios.instance';
import { MENU_ERROR_MESSAGES } from '../constants/endpoints.constants';

export const addDrinkMenu = async (itemMenu: AddMenuItemDto): Promise<void> => {
  const payload: SentAddMenuItemDto = {
    nombre_item: itemMenu.itemName,
    id_cobot: itemMenu.cobotId,
    precio_item: itemMenu.itemPrice,
  };

  try {
    await apiClient.post('/catalog/update-item/new', payload);
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(MENU_ERROR_MESSAGES.unavailable, { cause: error });
    }
    throw error;
  }
};
