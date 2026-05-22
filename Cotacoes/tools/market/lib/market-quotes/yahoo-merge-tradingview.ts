import type { Asset } from '../../types.js'
import type { YahooMergeDeps } from './yahoo-merge-deps.js'

export type TradingViewSearchItem = {
  symbol?: string
  full_name?: string
  description?: string
  exchange?: string
  type?: string
}

type TradingViewScanResponse = {
  data?: Array<{ s?: string; d?: unknown[] }>
}

export function normalizeLooseText(s: string) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function tradingViewPreferredExchanges(asset: Asset) {
  const ex = String(asset.exchange || '').trim().toUpperCase()
  if (!ex) return [] as string[]
  if (ex === 'BVMF' || ex === 'B3' || ex.includes('BOVESPA')) return ['BMFBOVESPA']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'BO') return ['BSE']
  if (ex === 'LON' && /futuros|metal|aluminio|cobre|niquel|zinco|chumbo|estanho/i.test(String(asset.name || ''))) return ['LME']
  return [ex]
}

export function tradingViewPreferredType(category: string) {
  const cat = String(category || '').trim().toLowerCase()
  if (cat === 'fx_g10' || cat === 'fx_emerging' || cat === 'fx') return 'forex'
  if (cat === 'crypto') return 'crypto'
  if (cat === 'equities' || cat === 'emerging') return 'stock'
  if (cat === 'volatility') return 'index'
  if (cat === 'rates' || cat === 'bonds') return 'bond'
  if (cat === 'metals' || cat === 'commodities' || cat === 'agriculture' || cat === 'energy') return 'futures'
  return ''
}

export function tradingViewQueryHints(asset: Asset) {
  const sym = String(asset.symbol || '').trim()
  const name = String(asset.name || '').trim()
  const out: string[] = []
  if (sym) out.push(sym)
  if (name) out.push(name)
  const normalized = normalizeLooseText(name)
  const baseMap: Array<[RegExp, string]> = [
    [/\balumin/i, 'aluminum'],
    [/\bcobre\b|\bcopper\b/, 'copper'],
    [/\bniquel\b|\bnickel\b/, 'nickel'],
    [/\bzinco\b|\bzinc\b/, 'zinc'],
    [/\bestanho\b|\btin\b/, 'tin'],
    [/\bchumbo\b|\blead\b/, 'lead'],
    [/\bminerio\b|\biron\b/, 'iron ore'],
    [/\btrigo\b|\bwheat\b/, 'wheat'],
    [/\bcelulos\b|\bpulp\b/, 'pulp'],
    [/\bcarbon\b|\bcredito\b/, 'carbon'],
  ]
  for (const [rx, hint] of baseMap) {
    if (rx.test(normalized)) out.push(hint)
  }
  return Array.from(new Set(out.filter(Boolean))).slice(0, 5)
}

export async function tradingViewSymbolSearch(deps: YahooMergeDeps, text: string, opts: { timeoutMs: number; exchange?: string | null }) {
  const q = String(text || '').trim()
  if (!q) return [] as TradingViewSearchItem[]
  const ex = String(opts.exchange || '').trim()
  const url =
    `https://symbol-search.tradingview.com/symbol_search/?text=${encodeURIComponent(q)}` +
    `&hl=1&lang=en` +
    (ex ? `&exchange=${encodeURIComponent(ex)}` : '')
  try {
    const data = await deps.fetchJsonWithTimeout<unknown>(url, Math.max(1500, opts.timeoutMs), {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/json',
      Origin: 'https://www.tradingview.com',
      Referer: 'https://www.tradingview.com/',
      'Accept-Language': 'en-US,en;q=0.9',
    })
    const arr = Array.isArray(data) ? (data as TradingViewSearchItem[]) : []
    const stripTags = (s: string) => String(s || '').replace(/<[^>]+>/g, '').trim()
    return arr.map(it => {
      const full = stripTags(String(it.full_name || ''))
      if (full) return { ...it, full_name: full }
      const symbol = stripTags(String(it.symbol || ''))
      if (!symbol) return it
      const sourceId = stripTags(String((it as unknown as Record<string, unknown>).source_id || ''))
      if (sourceId && !sourceId.includes(' ')) return { ...it, full_name: `${sourceId}:${symbol}` }
      const exch = stripTags(String(it.exchange || ''))
      if (exch && !exch.includes(' ') && exch === exch.toUpperCase()) return { ...it, full_name: `${exch}:${symbol}` }
      return it
    })
  } catch {
    return []
  }
}

export async function tradingViewScanLastPrice(deps: YahooMergeDeps, scanTicker: string, timeoutMs: number) {
  const t = String(scanTicker || '').trim()
  if (!t) return null as null | { price: number; usedColumn: string; updateMode: string | null }
  const url = 'https://scanner.tradingview.com/global/scan'
  const headers = {
    'User-Agent': 'Mozilla/5.0',
    Origin: 'https://www.tradingview.com',
    Referer: 'https://www.tradingview.com/',
  }
  const candidates: Array<{ cols: string[]; usedColumn: string }> = [
    { cols: ['close|1', 'update_mode'], usedColumn: 'close|1' },
    { cols: ['close|5', 'update_mode'], usedColumn: 'close|5' },
    { cols: ['close', 'update_mode'], usedColumn: 'close' },
    { cols: ['close'], usedColumn: 'close' },
  ]
  for (const c of candidates) {
    try {
      const payload = { symbols: { tickers: [t], query: { types: [] } }, columns: c.cols }
      const body = await deps.fetchJsonPostWithTimeout<TradingViewScanResponse>(url, Math.max(1500, timeoutMs), payload, headers)
      const row = body && Array.isArray(body.data) && body.data.length ? body.data[0] : null
      const d = row && Array.isArray(row.d) ? row.d : null
      if (!d || !d.length) continue
      const val = d[0]
      const price = typeof val === 'number' && Number.isFinite(val) ? val : Number.isFinite(Number(val)) ? Number(val) : null
      if (price === null || price <= 0) continue
      const updateMode = c.cols.includes('update_mode') && d.length >= 2 ? (d[1] !== null && d[1] !== undefined ? String(d[1]) : null) : null
      return { price, usedColumn: c.usedColumn, updateMode }
    } catch {
      void 0
    }
  }
  return null
}
