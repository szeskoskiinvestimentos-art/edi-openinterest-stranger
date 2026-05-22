import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { EconomicCalendarPayload } from '../investing/economic-calendar.js'
import type { MarketQuotes } from '../../types.js'
import { atomicWriteText } from '../io.js'

function safeParseMs(iso?: string | null) {
  if (!iso) return null
  const ms = new Date(String(iso)).getTime()
  return Number.isFinite(ms) ? ms : null
}

export async function readJsonSafe<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf-8')
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function getLastCalendarAttempt(outDir: string) {
  const jsonPath = path.join(outDir, 'economic_calendar.json')
  const prev = await readJsonSafe<Partial<EconomicCalendarPayload>>(jsonPath)
  const meta = prev && prev.meta && typeof prev.meta === 'object' ? (prev.meta as EconomicCalendarPayload['meta']) : null
  const attemptedAt = safeParseMs(meta?.attemptedAt || meta?.generatedAt || null)
  return {
    attemptedAt,
    status: meta?.status,
    unchanged: !!meta?.unchanged,
  }
}

export async function getLastDiUpdatedAt(outDir: string) {
  const jsonPath = path.join(outDir, 'market_quotes.json')
  const prev = await readJsonSafe<Partial<MarketQuotes>>(jsonPath)
  const meta = prev && prev.meta && typeof prev.meta === 'object' ? (prev.meta as MarketQuotes['meta']) : null
  const diUpdatedAt = safeParseMs((meta as { diUpdatedAt?: string } | null)?.diUpdatedAt || null)
  return diUpdatedAt
}

export async function getLastPortfolioUpdatedAt(outDir: string) {
  const jsonPath = path.join(outDir, 'market_quotes.json')
  const prev = await readJsonSafe<Partial<MarketQuotes>>(jsonPath)
  const meta = prev && prev.meta && typeof prev.meta === 'object' ? (prev.meta as MarketQuotes['meta']) : null
  const portfolioUpdatedAt = safeParseMs((meta as { portfolioUpdatedAt?: string } | null)?.portfolioUpdatedAt || null)
  return portfolioUpdatedAt
}

export async function setDiUpdatedAtAttempt(outDir: string, iso: string) {
  const jsonPath = path.join(outDir, 'market_quotes.json')
  const parsed = await readJsonSafe<Partial<MarketQuotes>>(jsonPath)
  if (!parsed || !parsed.meta) return
  ;(parsed.meta as MarketQuotes['meta'] & { diUpdatedAt?: string }).diUpdatedAt = iso
  try {
    await atomicWriteText(jsonPath, JSON.stringify(parsed, null, 2))
    await atomicWriteText(path.join(outDir, 'market_quotes.js'), `window.MARKET_QUOTES_DATA=${JSON.stringify(parsed)};`)
  } catch {
    void 0
  }
}
