import type { CalendarMatrixReportRequest } from '../../calendar-matrix-db.js'

export type EconomicCalendarItem = {
  id: string
  time: string
  currency: string
  impact: 'ALTO' | 'MÉDIO' | 'BAIXO'
  event: string
  actual?: string
  forecast?: string
  previous?: string
  wdo: string
  win: string
  matrixKey?: string
  canonicalKey?: string
  mappedBy?: 'event' | 'rule' | 'fallback'
}

export type EconomicCalendarPayload = {
  meta: {
    generatedAt: string
    attemptedAt?: string
    source: string
    timeZone: string
    warnings?: string[]
    status?: 'ok' | 'blocked' | 'fail'
    error?: string
    unchanged?: boolean
    matrix?: {
      mapped: number
      total: number
      requestedReports: CalendarMatrixReportRequest[]
      unmappedTop?: Array<{
        country: string
        sampleEvent: string
        count: number
        suggestTokens: string[]
        suggestIncludes: string
        suggestRegex: string
      }>
    }
  }
  items: EconomicCalendarItem[]
}
