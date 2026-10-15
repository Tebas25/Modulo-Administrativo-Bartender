import { expect, test, type Page } from '@playwright/test';

const LOGIN_API = '**/api/v1/auth/login';
const cors = { 'access-control-allow-origin': '*' };

async function fillAndSubmit(page: Page, email: string, password: string) {
  await page.getByLabel('Correo').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
}

test.describe('Autenticación', () => {
  test('login exitoso lleva al dashboard', async ({ page }) => {
    await page.route(LOGIN_API, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: cors,
        body: JSON.stringify({
          access_token: 'token-falso',
          token_type: 'bearer',
        }),
      }),
    );

    await page.goto('/login');
    await fillAndSubmit(page, 'admin@bar.com', '123456');

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('sin sesión, /dashboard redirige a /login', async ({ page }) => {
    await page.goto('/dashboard');

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
});
