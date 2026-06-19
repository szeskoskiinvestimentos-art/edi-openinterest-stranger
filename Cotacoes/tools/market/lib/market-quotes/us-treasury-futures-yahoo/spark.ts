import { type FuturesDeps, type YahooSparkResponseLike } from '../futures-utils.js'

export type SparkLike = { indicators?: { quote?: Array<{ close?: Array<number | null> }> }; timestamp?: number[] }

export async function fetchYahooSpark(
  deps: FuturesDeps,
  params: { symbols: string[]; timeoutMs: number; range: string; interval: string },
): Promise<Map<string, SparkLike>> {
  const out = new Map<string, SparkLike>()
  if (!params.symbols.length) return out
  const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(params.symbols.join(','))}&range=${encodeURIComponent(params.range)}&interval=${encodeURIComponent(params.interval)}`
  try {
    const data = await deps.fetchJsonWithTimeout<YahooSparkResponseLike>(url, Math.max(1500, params.timeoutMs), {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/json',
      Referer: 'https://finance.yahoo.com/',
    })
    const res = data && data.spark && Array.isArray(data.spark.result) ? data.spark.result : []
    for (const it of res) {
      const s = String(it && it.symbol ? it.symbol : '').trim()
      if (!s) continue
      const resp0 = it && it.response && Array.isArray(it.response) && it.response.length ? (it.response[0] as unknown) : null
      if (!resp0) continue
      out.set(s, resp0 as SparkLike)
    }
    return out
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e)
    const isBadRequest = /^HTTP\s+400\b/.test(msg)
    if (!isBadRequest || params.symbols.length <= 1) return out
    const mid = Math.ceil(params.symbols.length / 2)
    const left = await fetchYahooSpark(deps, { ...params, symbols: params.symbols.slice(0, mid) })
    const right = await fetchYahooSpark(deps, { ...params, symbols: params.symbols.slice(mid) })
    for (const [k, v] of left.entries()) out.set(k, v)
    for (const [k, v] of right.entries()) out.set(k, v)
    return out
  }
}

export function sparkStats(chart: SparkLike | null) {
  const closes =
    chart && chart.indicators && chart.indicators.quote && chart.indicators.quote[0] ? chart.indicators.quote[0].close || [] : []
  const ts = chart && Array.isArray(chart.timestamp) ? chart.timestamp : null
  if (!Array.isArray(closes) || !closes.length) {
    return {
      price: null as number | null,
      change: null as number | null,
      changePct: null as number | null,
      asOf: null as string | null,
      rangePct: null as number | null,
    }
  }

  let firstIdx = -1
  let lastIdx = -1
  let lo: number | null = null
  let hi: number | null = null
  for (let i = 0; i < closes.length; i++) {
    const v = closes[i]
    if (typeof v !== 'number' || !Number.isFinite(v)) continue
    if (firstIdx < 0) firstIdx = i
    if (lo === null || v < lo) lo = v
    if (hi === null || v > hi) hi = v
  }
  for (let i = closes.length - 1; i >= 0; i--) {
    const v = closes[i]
    if (typeof v === 'number' && Number.isFinite(v)) {
      lastIdx = i
      break
    }
  }
  if (firstIdx < 0 || lastIdx < 0) {
    return {
      price: null as number | null,
      change: null as number | null,
      changePct: null as number | null,
      asOf: null as string | null,
      rangePct: null as number | null,
    }
  }

  const first = closes[firstIdx] as number
  const last = closes[lastIdx] as number
  const change = last - first
  const changePct = first !== 0 ? (change / first) * 100 : null
  const asOfTs = ts && ts[lastIdx] && Number.isFinite(ts[lastIdx]) ? ts[lastIdx] : null
  const asOf = asOfTs ? new Date(asOfTs * 1000).toISOString() : null
  const rangePct = lo !== null && hi !== null && last !== 0 && Number.isFinite(last) ? ((hi - lo) / last) * 100 : null

  return {
    price: Number.isFinite(last) ? last : null,
    change: Number.isFinite(change) ? change : null,
    changePct: typeof changePct === 'number' && Number.isFinite(changePct) ? changePct : null,
    asOf,
    rangePct: typeof rangePct === 'number' && Number.isFinite(rangePct) ? rangePct : null,
  }
}
