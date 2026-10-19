import { isAxiosError } from 'axios';
import type {
  DrinksDto,
  UpdateItemPriceDto,
  UpdateItemStateDto,
} from '../types/drinks.dto';
import {
  API_BASE_URL,
  DRINKS_ERROR_MESSAGES,
} from '../constants/endpoints.constants';
import { apiClient } from './axios.instance';

export const getAllDrinks = async (cobotId: string): Promise<DrinksDto> => {
  try {
    const url = `${API_BASE_URL}/admin/catalog/get/${cobotId}`;
    const response = await apiClient.get<DrinksDto>(url);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(DRINKS_ERROR_MESSAGES.unavailable, {
        cause: error,
      });
    }
    throw error;
  }
};

export const updateDrinkPrice = async (
  cobotId: string,
  drinkName: string,
  price: number,
): Promise<void> => {
  const payload: UpdateItemPriceDto = {
    item_price: price,
    item_name: drinkName,
    id_cobot: cobotId,
  };
  try {
    await apiClient.patch('/catalog/update-price', payload);
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(DRINKS_ERROR_MESSAGES.updateDrinkFailed, {
        cause: error,
      });
    }
    throw error;
  }
};

export const updateDrinkAvailability = async (
  cobotId: string,
  drinkName: string,
  available: boolean,
): Promise<void> => {
  const payload: UpdateItemStateDto = {
    item_state: available,
    item_name: drinkName,
    id_cobot: cobotId,
  };
  try {
    await apiClient.patch('/catalog/update-state', payload);
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(DRINKS_ERROR_MESSAGES.updateStateFailed, {
        cause: error,
      });
    }
    throw error;
  }
};
