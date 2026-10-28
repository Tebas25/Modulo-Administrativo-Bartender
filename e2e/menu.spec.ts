import { expect, test } from '@playwright/test';
import { ACCESS_TOKEN_KEY } from '../src/constants/endpoints.constants.ts';
import { fakeJwt, mockCatalogApi } from './helpers.ts';

test.describe('Configuración de menú', () => {
  test('el administrador elige un cobot, ve su menú y cambia la disponibilidad de una bebida', async ({
    page,
  }) => {
    const { patchBodies } = await mockCatalogApi(page);
    await page.goto('/login');
    await page.evaluate(
      ([key, token]) => localStorage.setItem(key, token),
      [ACCESS_TOKEN_KEY, fakeJwt()],
    );

    await page.goto('/menu');
    await expect(
      page.getByText('Elija un cobot para ver y configurar su menú.'),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Seleccione un cobot' }).click();
    await page.getByRole('option', { name: 'Cobot JAKA' }).click();

    const mojito = page.getByRole('switch', {
      name: 'Disponibilidad de Mojito Clásico',
    });
    await expect(mojito).toHaveAttribute('aria-checked', 'true');

    await mojito.click();

    await expect(mojito).toHaveAttribute('aria-checked', 'false');
    expect(patchBodies).toEqual([
      {
        item_state: false,
        item_name: 'Mojito Clásico',
        id_cobot: 'CBT000T',
      },
    ]);
  });
});
