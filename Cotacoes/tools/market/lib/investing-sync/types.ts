import type { InvestingBrowser } from '../investing/browser.js'

export type BrowserConfig = {
  browser: InvestingBrowser
  executablePath?: string
  launchTimeoutMs: number
  args: string[]
}

export type CsvValidation = {
  enabled: boolean
  minBytes: number
  minRows: number
}

export type PortfolioSummary = {
  enabled: boolean
  status: 'ok' | 'skip' | 'fail'
  csvPath: string | null
  method?: 'investing' | 'seed'
  seedAgeMinutes?: number
  yahooUpdatedSymbols?: number
  yahooMissingSymbols?: number
  error?: string
}

export type DiSummary = {
  enabled: boolean
  status: 'ok' | 'skip' | 'fail'
  count: number
  error?: string
}

export type CalendarSummary = {
  enabled: boolean
  status: 'ok' | 'skip' | 'fail' | 'blocked'
  count: number
  error?: string
}

export type UpdateSummary = {
  startedAt: string
  finishedAt: string
  mode: string
  outDir: string
  portfolio: PortfolioSummary
  di: DiSummary
  calendar: CalendarSummary
}
