import type { CalendarMatrixCountry } from './types.js'

export function calendarCountryFromCurrency(currency: string): CalendarMatrixCountry | null {
  const c = String(currency || '').toUpperCase().trim()
  if (c === 'BRL') return 'BR'
  if (c === 'USD') return 'EUA'
  if (c === 'CNY' || c === 'CNH' || c === 'HKD') return 'CHINA/HK'
  return null
}

