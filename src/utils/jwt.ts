const CLOCK_SKEW_SECONDS = 10;

function decodePayload(token: string): unknown {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

export function isTokenValid(token: string): boolean {
  const payload = decodePayload(token);

  if (typeof payload !== 'object' || payload === null) return false;

  const { exp } = payload as { exp?: unknown };
  if (typeof exp !== 'number') return false;

  return (exp - CLOCK_SKEW_SECONDS) * 1000 > Date.now();
}
