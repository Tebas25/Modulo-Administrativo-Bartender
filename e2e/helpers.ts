import type { Page } from '@playwright/test';

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

export async function mockCatalogApi(page: Page) {
  const patchBodies: unknown[] = [];

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
  await page.route('**/catalog/update-state', (route) => {
    patchBodies.push(route.request().postDataJSON());
    return route.fulfill(
      json({ status: 'success', message: 'Estado actualizado' }),
    );
  });

  return { patchBodies };
}
