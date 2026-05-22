import type { CalendarMatrixCountry, CalendarMatrixReportRequest } from './types.js'

export function pickReportRequest(
  country: CalendarMatrixCountry,
  def: { key: string; report?: { fetchOnCalendar?: boolean; query?: string } },
): CalendarMatrixReportRequest | undefined {
  if (!def.report || !def.report.fetchOnCalendar) return undefined
  const query = String(def.report.query || '').trim()
  if (!query) return undefined
  return { key: def.key, country, query }
}

