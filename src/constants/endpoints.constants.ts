export const API_BASE_URL = 'http://localhost:9000';
export const ACCESS_TOKEN_KEY = 'access_token';
export const AUTH_UNAUTHORIZED_EVENT = 'no_token';

export const LOGIN_ERROR_MESSAGES = {
  invalidCredentials: 'Correo o contraseña incorrectos',
  unavailable:
    'No se pudo conectar con el servidor. Intente de nuevo más tarde',
};

export const DRINKS_ERROR_MESSAGES = {
  unavailable: 'Ha ocurrido un error. Inténtelo de nuevo más tarde',
  updateDrinkFailed:
    'No se ha podido actualizar el precio. Inténtelo de nuevo más tarde',
  updateStateFailed:
    'No se ha podido actualizar la viabilidad. Inténtelo de nuevo más tarde',
  createNewDrink:
    'No se ha podido crear la bebida. Inténtelo de nuevo más tarde',
};

export const COBOT_ERROR_MESSAGES = {
  unavailable: 'Ha ocurrido un error. Inténtelo de nuevo más tarde',
};
