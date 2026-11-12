import { isAxiosError } from 'axios';
import {
  API_BASE_URL,
  COBOT_ERROR_MESSAGES,
} from '../constants/endpoints.constants';
import type { CobotDto } from '../types/cobot.dto';
import { apiClient } from './axios.instance';

export const getAllCobots = async (): Promise<CobotDto> => {
  try {
    const url = `${API_BASE_URL}/catalog/cobots`;
    const response = await apiClient.get<CobotDto>(url);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(COBOT_ERROR_MESSAGES.unavailable, { cause: error });
    }
    throw error;
  }
};
