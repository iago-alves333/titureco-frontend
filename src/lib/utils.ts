import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatBRL(value: number | string | null | undefined): string {
  return brl.format(Number(value) || 0)
}

export function toLocalDateISO(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const attractionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'O título é obrigatório')
    .max(150, 'O título não pode ter mais de 150 caracteres'),
  description: z
    .string()
    .max(2000, 'A descrição não pode ter mais de 2000 caracteres'),
  price: z.number().min(0, 'O preço não pode ser negativo'),
  availableSpots: z.number().int().min(0, 'A quantidade de vagas não pode ser negativa'),
  latitude: z.number().min(-90, 'Latitude inválida').max(90, 'Latitude inválida'),
  longitude: z.number().min(-180, 'Longitude inválida').max(180, 'Longitude inválida'),
})

export type AttractionFormValues = z.infer<typeof attractionSchema>

/** Extracts the `message` the API sends in ErrorResponse; falls back when there is none (network error, etc). */
export function getErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: unknown; fieldErrors?: Record<string, string> } } })?.response?.data
  const fieldErrors = data?.fieldErrors && Object.values(data.fieldErrors)
  if (fieldErrors?.length) return fieldErrors.join(' · ')
  return typeof data?.message === 'string' && data.message ? data.message : fallback
}
