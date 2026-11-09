import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatBRL(value: number | string | null | undefined): string {
  return brl.format(Number(value) || 0)
}

/** Extracts the `message` the API sends in ErrorResponse; falls back when there is none (network error, etc). */
export function getErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: unknown; fieldErrors?: Record<string, string> } } })?.response?.data
  const fieldErrors = data?.fieldErrors && Object.values(data.fieldErrors)
  if (fieldErrors?.length) return fieldErrors.join(' · ')
  return typeof data?.message === 'string' && data.message ? data.message : fallback
}
