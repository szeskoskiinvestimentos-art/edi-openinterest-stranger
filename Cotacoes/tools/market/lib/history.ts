import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { MarketPoint, MarketQuotes } from '../types.js'

export function pruneOldPoints(points: MarketPoint[], cutoffMs: number) {
  return points.filter(p => {
    const t = new Date(p.t).getTime()
    return Number.isFinite(t) && t >= cutoffMs
  })
}

export async function readExisting(outDir: string) {
  const jsonPath = path.join(outDir, 'market_quotes.json')
  try {
    const raw = await readFile(jsonPath, 'utf-8')
    const parsed = JSON.parse(raw) as MarketQuotes
    if (parsed && parsed.assets && parsed.series && parsed.meta) return parsed
    return null
  } catch {
    return null
  }
}

