export type CalendarMatrixCountry = 'BR' | 'EUA' | 'CHINA/HK'

export type CalendarMatrixReactions = {
  wdo: string
  win: string
  matrixKey?: string
}

export type CalendarMatrixReportRequest = {
  key: string
  country: CalendarMatrixCountry
  query: string
}

export type CalendarMatrixMatch = {
  wdo: string
  win: string
  matrixKey?: string
  canonicalKey: string
  source: 'event' | 'rule'
  reportRequest?: CalendarMatrixReportRequest
}

export type CalendarMatrixDbEvent = {
  key: string
  title: string
  aliases?: string[]
  match?: { includes?: string[]; regex?: string[] }
  reactions: CalendarMatrixReactions
  report?: { fetchOnCalendar?: boolean; query?: string }
}

export type CalendarMatrixDbRule = {
  key: string
  match: { includes?: string[]; regex?: string[] }
  reactions: CalendarMatrixReactions
  report?: { fetchOnCalendar?: boolean; query?: string }
}

export type CalendarMatrixDb = {
  meta: { country: CalendarMatrixCountry; version: number }
  defaults?: CalendarMatrixReactions
  events: CalendarMatrixDbEvent[]
  rules: CalendarMatrixDbRule[]
}

export type CalendarMatrixDbs = Partial<Record<CalendarMatrixCountry, CalendarMatrixDb>>
