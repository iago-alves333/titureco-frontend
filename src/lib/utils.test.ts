import { describe, it, expect } from 'vitest';
import { attractionSchema, formatBRL, getErrorMessage, toLocalDateISO } from './utils';

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

  it('toLocalDateISO formats local calendar date regardless of late evening hour', () => {
    const lateEvening = new Date(2026, 10, 13, 23, 45, 0);
    expect(toLocalDateISO(lateEvening)).toBe('2026-11-13');

    const yearRollover = new Date(2026, 11, 31, 23, 59, 0);
    const nextDay = new Date(
      yearRollover.getFullYear(),
      yearRollover.getMonth(),
      yearRollover.getDate() + 1,
    );
    expect(toLocalDateISO(nextDay)).toBe('2027-01-01');
  });

  it('attractionSchema validates blank titles and accepts valid attraction payloads', () => {
    const invalid = attractionSchema.safeParse({
      title: '   ',
      description: 'Desc',
      price: 50,
      availableSpots: 5,
      latitude: -7.12,
      longitude: -34.86,
    });
    expect(invalid.success).toBe(false);

    const valid = attractionSchema.safeParse({
      title: 'Passeio na Praia',
      description: '',
      price: 50,
      availableSpots: 5,
      latitude: -7.12,
      longitude: -34.86,
    });
    expect(valid.success).toBe(true);
  });
});
