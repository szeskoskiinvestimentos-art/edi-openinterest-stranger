import { readFile } from 'node:fs/promises'
import path from 'node:path'

function safeNum(v: unknown) {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

async function readSpotFromMarketDataJson(absPath: string) {
  try {
    const raw = await readFile(absPath, 'utf8')
    const obj = JSON.parse(raw) as any
    const direct = safeNum(obj && obj.spot_price)
    const overview = obj && obj.overview && typeof obj.overview === 'object' ? obj.overview : null
    const fromOverview = safeNum(overview && overview.spot_price)
    return direct !== null ? direct : fromOverview
  } catch {
    return null
  }
}

function lastPrice(series: Record<string, unknown>, key: string) {
  const points = (series as any)[key]
  if (!Array.isArray(points) || points.length === 0) return null
  const last = points[points.length - 1]
  return last && typeof last.price === 'number' ? last.price : null
}

export async function buildTradingViewSection(params: {
  workspaceRoot: string
  marketQuotesMeta: any
  marketQuotesSeries: Record<string, unknown>
  marketQuotesFs: { path: string; mtime: number | null; mtime_fmt: string | null }
}) {
  const wdoJson = path.resolve(params.workspaceRoot, 'dashboard_unificado', 'WDO', 'assets', 'data', 'market_data.json')
  const wdoSpot = await readSpotFromMarketDataJson(wdoJson)

  const meta = params.marketQuotesMeta && typeof params.marketQuotesMeta === 'object' ? params.marketQuotesMeta : {}
  const lastCollected = meta.yahooUpdatedAt || meta.generatedAt || null
  const lastSlot = meta.portfolioUpdatedAt || meta.generatedAt || null

  const indexRef = lastPrice(params.marketQuotesSeries, '.BVSP')
  const ewzRef = lastPrice(params.marketQuotesSeries, 'EWZ')

  const exists = !!lastCollected || wdoSpot !== null || indexRef !== null || ewzRef !== null

  return {
    exists,
    path: params.marketQuotesFs.path,
    mtime: params.marketQuotesFs.mtime,
    mtime_fmt: params.marketQuotesFs.mtime_fmt,
    last_collected_at_utc: lastCollected ? String(lastCollected) : null,
    last_slot_iso: lastSlot ? String(lastSlot) : null,
    wdo_spot: wdoSpot,
    win_scaling_index_ref_close: indexRef,
    win_scaling_ewz_ref_close: ewzRef,
  }
}

