import { describe, expect, it } from 'vitest';
import { isTokenValid } from '../../src/utils/jwt';
import { expiredToken, makeJwt, validToken } from '../helpers/jwt';

describe('isTokenValid', () => {
  it('acepta un token vigente', () => {
    expect(isTokenValid(validToken())).toBe(true);
  });

  it('rechaza un token vencido', () => {
    expect(isTokenValid(expiredToken())).toBe(false);
  });

  it('rechaza un token que vence dentro del margen de 10 segundos', () => {
    expect(isTokenValid(validToken(5))).toBe(false);
  });

  it('rechaza un token sin exp', () => {
    expect(isTokenValid(makeJwt({ sub: '1' }))).toBe(false);
  });

  it.each(['abc', 'aaa.bbb', `aaa.${btoa('no-json')}.ccc`])(
    'rechaza un token mal formado (%s)',
    (token) => {
      expect(isTokenValid(token)).toBe(false);
    },
  );
});
