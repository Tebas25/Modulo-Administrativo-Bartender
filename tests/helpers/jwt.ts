const encode = (value: object) =>
  btoa(JSON.stringify(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

export const makeJwt = (payload: Record<string, unknown>) =>
  `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode(payload)}.firma`;

const nowInSeconds = () => Math.floor(Date.now() / 1000);

export const validToken = (secondsFromNow = 3600) =>
  makeJwt({
    sub: '1',
    iss: 'auth-service',
    exp: nowInSeconds() + secondsFromNow,
  });

export const expiredToken = () => validToken(-60);
