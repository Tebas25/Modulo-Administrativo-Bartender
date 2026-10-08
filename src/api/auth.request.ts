import axios, { isAxiosError } from 'axios';
import { API_BASE_URL } from '../constants/endpoints.constants';
import type { LoginDTO, ResponseLoginDTO } from '../types/auth.dto';

export const loginUser = async (
  credencials: LoginDTO,
): Promise<ResponseLoginDTO> => {
  try {
    const url = `${API_BASE_URL}/api/v1/auth/login`;
    const response = await axios.post<ResponseLoginDTO>(url, credencials);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};
