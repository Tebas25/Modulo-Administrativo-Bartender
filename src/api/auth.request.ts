import axios, { isAxiosError } from 'axios';
import {
  API_BASE_URL,
  LOGIN_ERROR_MESSAGES,
} from '../constants/endpoints.constants';
import type { LoginDTO, ResponseLoginDTO } from '../types/auth.dto';

export const loginUser = async (
  credentials: LoginDTO,
): Promise<ResponseLoginDTO> => {
  try {
    const url = `${API_BASE_URL}/api/v1/auth/login`;
    const response = await axios.post<ResponseLoginDTO>(url, credentials);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const isCredentialError =
        status === 400 || status === 401 || status === 404 || status === 422;
      throw new Error(
        isCredentialError
          ? LOGIN_ERROR_MESSAGES.invalidCredentials
          : LOGIN_ERROR_MESSAGES.unavailable,
        { cause: error },
      );
    }
    throw error;
  }
};
export { LOGIN_ERROR_MESSAGES };
