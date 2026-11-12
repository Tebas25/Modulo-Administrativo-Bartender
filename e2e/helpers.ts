import type { Page, Route } from '@playwright/test';

// Cabeceras CORS para las respuestas simuladas (el frontend y Kong están en puertos distintos).
export const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type',
  'access-control-allow-methods': 'GET, POST, PATCH, OPTIONS',
};

const base64url = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

export const fakeJwt = () =>
  `${base64url({ alg: 'RS256', typ: 'JWT' })}.${base64url({
    sub: '1',
    exp: Math.floor(Date.now() / 1000) + 3600,
  })}.firma`;

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  headers: cors,
  body: JSON.stringify(body),
});

const handleCorsOrJson = (
  route: Route,
  captureList: unknown[],
  responseBody: unknown,
) => {
  if (route.request().method() === 'OPTIONS') {
    return route.fulfill({ status: 204, headers: cors });
  }
  captureList.push(route.request().postDataJSON());
  return route.fulfill(json(responseBody));
};

export async function mockCatalogApi(page: Page) {
  const patchBodies: unknown[] = [];
  const createDrinkBodies: unknown[] = [];
  const addMenuBodies: unknown[] = [];

  await page.route('**/catalog/cobots', (route) =>
    route.fulfill(
      json({ items: [{ id_cobot: 'CBT000T', nombre_cobot: 'Cobot JAKA' }] }),
    ),
  );

  await page.route('**/admin/catalog/get/CBT000T', (route) =>
    route.fulfill(
      json({
        items: [
          { nombre_item: 'Mojito Clásico', precio_item: '5.50', estado: true },
          {
            nombre_item: 'Cerveza Artesanal',
            precio_item: '3.50',
            estado: false,
          },
        ],
      }),
    ),
  );

  await page.route('**/catalog/all-items', (route) =>
    route.fulfill(
      json({
        items: [
          { id_item: 1, nombre_item: 'Mojito Clásico' },
          { id_item: 2, nombre_item: 'Ron con Cola' },
        ],
      }),
    ),
  );

  await page.route('**/catalog/update-state', (route) =>
    handleCorsOrJson(route, patchBodies, {
      status: 'success',
      message: 'Estado actualizado',
    }),
  );

  await page.route('**/catalog/add-item', (route) =>
    handleCorsOrJson(route, createDrinkBodies, {
      mensaje: 'Item creado correctamente',
    }),
  );

  await page.route('**/catalog/update-item/new', (route) =>
    handleCorsOrJson(route, addMenuBodies, {
      mensaje: 'Bebida agregada al menú correctamente',
    }),
  );

  return { patchBodies, createDrinkBodies, addMenuBodies };
}
