import { describe, expect, it } from 'vitest';
import { cn } from '../../src/utils/cn';

describe('cn utility', () => {
  it('combina múltiples clases de texto e ignora valores falsy', () => {
    const isHidden = false;
    expect(cn('px-4', undefined, isHidden && 'hidden', null, 'py-2')).toBe(
      'px-4 py-2',
    );
  });

  it('resuelve conflictos de clases de Tailwind conservando la última', () => {
    expect(cn('px-4 text-red-500', 'px-8 text-blue-600')).toBe(
      'px-8 text-blue-600',
    );
  });
});
