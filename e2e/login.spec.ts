import { expect, test, type Page } from '@playwright/test';
import { ACCESS_TOKEN_KEY } from '../src/constants/endpoints.constants.ts';
import { cors, fakeJwt, mockCatalogApi } from './helpers.ts';

const LOGIN_API = '**/api/v1/auth/login';

async function fillAndSubmit(page: Page, email: string, password: string) {
  await page.getByLabel('Correo').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
}

test.describe('Autenticación', () => {
  test('login exitoso lleva a la configuración de menú', async ({ page }) => {
    await mockCatalogApi(page);
    await page.route(LOGIN_API, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: cors,
        body: JSON.stringify({
          access_token: fakeJwt(),
          token_type: 'bearer',
        }),
      }),
    );

    await page.goto('/login');
    await fillAndSubmit(page, 'admin@bar.com', '123456');

    await expect(page).toHaveURL(/\/menu/);
  });

  test('sin sesión, /menu redirige a /login', async ({ page }) => {
    await page.goto('/menu');

    await expect(page).toHaveURL(/\/login/);
  });

  test('credenciales inválidas muestran un error genérico y no entran', async ({
    page,
  }) => {
    await page.route(LOGIN_API, (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        headers: cors,
        body: JSON.stringify({ detail: 'Usuario no existe' }),
      }),
    );

    await page.goto('/login');
    await fillAndSubmit(page, 'admin@bar.com', 'incorrecta');

    await expect(page.getByRole('alert')).toHaveText(
      'Correo o contraseña incorrectos',
    );
    await expect(page.getByText('Usuario no existe')).toHaveCount(0);
    await expect(page).toHaveURL(/\/login/);
  });

  test('con sesión, /login lleva al menú y "atrás" no vuelve al login', async ({
    page,
  }) => {
    await mockCatalogApi(page);
    await page.goto('/login');
    await page.evaluate(
      ([key, token]) => localStorage.setItem(key, token),
      [ACCESS_TOKEN_KEY, fakeJwt()],
    );

    await page.goto('/login');
    await expect(page).toHaveURL(/\/menu/);

    await page.goBack();
    await expect(page).not.toHaveURL(/\/login/);
  });
});
