import { expect, test } from '@playwright/test';
import { ACCESS_TOKEN_KEY } from '../src/constants/endpoints.constants.ts';
import { fakeJwt, mockCatalogApi } from './helpers.ts';

test.describe('Configuración de menú', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(
      ([key, token]) => localStorage.setItem(key, token),
      [ACCESS_TOKEN_KEY, fakeJwt()],
    );
  });

  test('el administrador elige un cobot, ve su menú y cambia la disponibilidad de una bebida', async ({
    page,
  }) => {
    const { patchBodies } = await mockCatalogApi(page);

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

  test('el administrador crea una nueva bebida en el catálogo general', async ({
    page,
  }) => {
    const { createDrinkBodies } = await mockCatalogApi(page);
    await page.goto('/menu');

    await page.getByRole('button', { name: 'Crear nueva bebida' }).click();

    const dialog = page.getByRole('dialog', { name: 'Crear nueva bebida' });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Nombre').fill('Ron con Cola');
    await dialog.getByLabel('Ingredientes').fill('Ron, Coca-Cola');
    await dialog
      .getByLabel('URL de la imagen')
      .fill('https://ejemplo.com/ron.png');
    await dialog.getByLabel('Código Modbus').fill('7');

    await dialog.getByRole('button', { name: 'Guardar' }).click();

    await expect(dialog).toBeHidden();
    expect(createDrinkBodies).toEqual([
      {
        nombre_item: 'Ron con Cola',
        ingredientes: 'Ron, Coca-Cola',
        imagen: 'https://ejemplo.com/ron.png',
        codigo_modbus: 7,
      },
    ]);
  });

  test('el administrador añade una bebida existente al menú de un cobot', async ({
    page,
  }) => {
    const { addMenuBodies } = await mockCatalogApi(page);
    await page.goto('/menu');

    await page.getByRole('button', { name: 'Añadir bebida al menú' }).click();

    const dialog = page.getByRole('dialog', {
      name: 'Agregar bebidas al menú',
    });
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: /Cobot/i }).click();
    await dialog.getByRole('option', { name: 'Cobot JAKA' }).click();

    await dialog.getByRole('button', { name: /Bebida/i }).click();
    await dialog.getByRole('option', { name: 'Ron con Cola' }).click();

    await dialog.getByLabel('Precio').fill('5.5');
    await dialog.getByRole('button', { name: 'Guardar' }).click();

    await expect(dialog).toBeHidden();
    expect(addMenuBodies).toEqual([
      {
        nombre_item: 'Ron con Cola',
        id_cobot: 'CBT000T',
        precio_item: 5.5,
      },
    ]);
  });
});
