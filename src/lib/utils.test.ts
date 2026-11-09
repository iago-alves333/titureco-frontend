// Run: npm test  (node:test + native TS type stripping, no test framework needed)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatBRL, getErrorMessage } from './utils.ts'

test('formatBRL', () => {
  assert.equal(formatBRL(1234.5).replace(/\s/g, ' '), 'R$ 1.234,50')
  assert.equal(formatBRL(null).replace(/\s/g, ' '), 'R$ 0,00')
  assert.equal(formatBRL('abc').replace(/\s/g, ' '), 'R$ 0,00')
})

test('getErrorMessage', () => {
  assert.equal(getErrorMessage({ response: { data: { message: 'Sem vagas' } } }, 'x'), 'Sem vagas')
  assert.equal(
    getErrorMessage({ response: { data: { message: 'Erro de validação', fieldErrors: { a: 'A', b: 'B' } } } }, 'x'),
    'A · B',
  )
  assert.equal(getErrorMessage(new Error('Network Error'), 'Falha'), 'Falha')
  assert.equal(getErrorMessage(undefined, 'Falha'), 'Falha')
})
