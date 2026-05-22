import type { YahooSparkChartLike, YahooSparkResponse } from './yahoo-merge-yahoo.js'

export function extractSpark(chart: YahooSparkChartLike | undefined | null) {
  const closes = chart && chart.indicators && chart.indicators.quote && chart.indicators.quote[0] ? chart.indicators.quote[0].close : null
  const ts = chart && Array.isArray(chart.timestamp) ? chart.timestamp : null
  if (!closes || !Array.isArray(closes) || !closes.length) {
    return { price: null as number | null, asOf: null as string | null, change: null as number | null, changePct: null as number | null }
  }

  let firstIdx = -1
  let lastIdx = -1
  for (let i = 0; i < closes.length; i++) {
    const v = closes[i]
    if (typeof v === 'number' && Number.isFinite(v)) {
      firstIdx = i
      break
    }
  }
  for (let i = closes.length - 1; i >= 0; i--) {
    const v = closes[i]
    if (typeof v === 'number' && Number.isFinite(v)) {
      lastIdx = i
      break
    }
  }
  if (firstIdx < 0 || lastIdx < 0) {
    return { price: null as number | null, asOf: null as string | null, change: null as number | null, changePct: null as number | null }
  }

  const first = closes[firstIdx] as number
  const last = closes[lastIdx] as number
  const asOfTs = ts && ts[lastIdx] && Number.isFinite(ts[lastIdx]) ? ts[lastIdx] : null
  const asOf = asOfTs ? new Date(asOfTs * 1000).toISOString() : null

  const change = last - first
  const changePct = first !== 0 ? (change / first) * 100 : null
  return {
    price: last,
    asOf,
    change: Number.isFinite(change) && change !== 0 ? change : null,
    changePct: typeof changePct === 'number' && Number.isFinite(changePct) && changePct !== 0 ? changePct : null,
  }
}

export async function fetchYahooSpark(params: {
  symbols: string[]
  range: string
  interval: string
  timeoutMs: number
  fetchJsonWithTimeout: <T>(url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<T>
}): Promise<Map<string, YahooSparkChartLike>> {
  const out = new Map<string, YahooSparkChartLike>()
  const symbols = params.symbols
  if (!symbols.length) return out
  const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(symbols.join(','))}&range=${encodeURIComponent(params.range)}&interval=${encodeURIComponent(params.interval)}`
  try {
    const data = await params.fetchJsonWithTimeout<YahooSparkResponse>(url, Math.max(1500, params.timeoutMs), {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/json',
      Referer: 'https://finance.yahoo.com/',
    })
    const items = data && data.spark && Array.isArray(data.spark.result) ? data.spark.result : []
    for (const it of items) {
      const s = String(it && it.symbol ? it.symbol : '').trim()
      if (!s) continue
      const resp0 = it && Array.isArray(it.response) && it.response.length ? it.response[0] : null
      if (!resp0) continue
      out.set(s, resp0)
    }
    return out
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e)
    const isBadRequest = /^HTTP\s+400\b/.test(msg)
    if (!isBadRequest || symbols.length <= 1) return out
    const mid = Math.ceil(symbols.length / 2)
    const left = await fetchYahooSpark({ ...params, symbols: symbols.slice(0, mid) })
    const right = await fetchYahooSpark({ ...params, symbols: symbols.slice(mid) })
    for (const [k, v] of left.entries()) out.set(k, v)
    for (const [k, v] of right.entries()) out.set(k, v)
    return out
  }
}

export async function fetchYahooSparkInto(params: {
  target: Map<string, YahooSparkChartLike>
  symbols: string[]
  range: string
  interval: string
  timeoutMs: number
  chunkSize: number
  fetchJsonWithTimeout: <T>(url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<T>
}) {
  const chunkSize = Math.max(1, Math.min(200, Math.trunc(params.chunkSize)))
  for (let i = 0; i < params.symbols.length; i += chunkSize) {
    const batch = params.symbols.slice(i, i + chunkSize)
    const got = await fetchYahooSpark({
      symbols: batch,
      range: params.range,
      interval: params.interval,
      timeoutMs: params.timeoutMs,
      fetchJsonWithTimeout: params.fetchJsonWithTimeout,
    })
    for (const [k, v] of got.entries()) params.target.set(k, v)
  }
}

export async function fetchYahooQuote(params: {
  symbols: string[]
  timeoutMs: number
  fetchJsonWithTimeout: <T>(url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<T>
}): Promise<Map<string, { price: number; asOf: string | null; change: number | null; changePct: number | null }>> {
  const out = new Map<string, { price: number; asOf: string | null; change: number | null; changePct: number | null }>()
  if (!params.symbols.length) return out
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(params.symbols.join(','))}`
  try {
    const data = await params.fetchJsonWithTimeout<unknown>(url, Math.max(1500, params.timeoutMs), {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/json',
      Referer: 'https://finance.yahoo.com/',
    })
    const items =
      data &&
      typeof data === 'object' &&
      'quoteResponse' in data &&
      (data as Record<string, unknown>).quoteResponse &&
      typeof (data as Record<string, unknown>).quoteResponse === 'object' &&
      'result' in ((data as Record<string, unknown>).quoteResponse as Record<string, unknown>) &&
      Array.isArray(((data as Record<string, unknown>).quoteResponse as Record<string, unknown>).result)
        ? (((data as Record<string, unknown>).quoteResponse as Record<string, unknown>).result as unknown[])
        : []
    for (const it of items) {
      const it0 = it && typeof it === 'object' ? (it as Record<string, unknown>) : null
      const s = String(it0 && it0.symbol ? it0.symbol : '').trim()
      const price =
        typeof (it0 && it0.regularMarketPrice) === 'number' && Number.isFinite(it0.regularMarketPrice as number)
          ? (it0.regularMarketPrice as number)
          : null
      if (!s || price === null) continue
      const ts =
        typeof (it0 && it0.regularMarketTime) === 'number' && Number.isFinite(it0.regularMarketTime as number)
          ? (it0.regularMarketTime as number)
          : null
      const asOf = ts ? new Date(ts * 1000).toISOString() : null
      const change =
        typeof (it0 && it0.regularMarketChange) === 'number' &&
        Number.isFinite(it0.regularMarketChange as number) &&
        (it0.regularMarketChange as number) !== 0
          ? (it0.regularMarketChange as number)
          : null
      const changePct =
        typeof (it0 && it0.regularMarketChangePercent) === 'number' &&
        Number.isFinite(it0.regularMarketChangePercent as number) &&
        (it0.regularMarketChangePercent as number) !== 0
          ? (it0.regularMarketChangePercent as number)
          : null
      out.set(s, { price, asOf, change, changePct })
    }
    return out
  } catch {
    return out
  }
}

