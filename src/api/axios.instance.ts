import axios, { isAxiosError, type AxiosInstance } from 'axios';
import {
  ACCESS_TOKEN_KEY,
  API_BASE_URL,
  AUTH_UNAUTHORIZED_EVENT,
} from '../constants/endpoints.constants';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
      }
    }
    return Promise.reject(error);
  },
);
