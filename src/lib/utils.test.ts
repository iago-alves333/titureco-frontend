import { describe, it, expect } from 'vitest';
import { formatBRL, getErrorMessage } from './utils';

describe('utils', () => {
  it('formatBRL formats currency correctly', () => {
    expect(formatBRL(1234.5).replace(/\s/g, ' ')).toBe('R$ 1.234,50');
    expect(formatBRL(null).replace(/\s/g, ' ')).toBe('R$ 0,00');
    expect(formatBRL('abc').replace(/\s/g, ' ')).toBe('R$ 0,00');
  });

  it('getErrorMessage extracts friendly messages', () => {
    expect(getErrorMessage({ response: { data: { message: 'Sem vagas' } } }, 'x')).toBe('Sem vagas');
    expect(
      getErrorMessage({ response: { data: { message: 'Erro de validação', fieldErrors: { a: 'A', b: 'B' } } } }, 'x'),
    ).toBe('A · B');
    expect(getErrorMessage(new Error('Network Error'), 'Falha')).toBe('Falha');
    expect(getErrorMessage(undefined, 'Falha')).toBe('Falha');
  });
});
