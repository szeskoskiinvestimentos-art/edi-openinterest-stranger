import type { YahooCrumbSession } from './crumb.js'
import { withCrumb, yahooUa } from './crumb.js'
import { clamp, olsStats, safeNum, ymdUtc } from './utils.js'

export async function fetchYahooChartCloses(
  deps: { fetchJsonWithTimeout: <T = unknown>(url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<T> },
  ticker: string,
  range = '1y',
  interval = '1d',
) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}`
  const headers = { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' }
  const j = await deps.fetchJsonWithTimeout<any>(url, 12000, headers)
  const r = j && j.chart && Array.isArray(j.chart.result) ? j.chart.result[0] : null
  const ts = r && Array.isArray(r.timestamp) ? r.timestamp : null
  const closes = r && r.indicators && r.indicators.quote && Array.isArray(r.indicators.quote) ? r.indicators.quote[0]?.close : null
  if (!ts || !closes || !Array.isArray(closes) || ts.length !== closes.length) throw new Error(`Yahoo chart inválido (${ticker})`)
  const out: Array<{ t: number; c: number }> = []
  for (let i = 0; i < ts.length; i++) {
    const t = Number(ts[i])
    const c = safeNum(closes[i])
    if (!Number.isFinite(t) || c === null) continue
    out.push({ t, c })
  }
  if (out.length < 30) throw new Error(`Yahoo chart sem dados suficientes (${ticker})`)
  return out
}

export async function computeUsdBrlBeta(
  deps: { fetchJsonWithTimeout: <T = unknown>(url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<T> },
  proxyTicker: string,
) {
  const [proxy, fx] = await Promise.all([
    fetchYahooChartCloses(deps, proxyTicker, '1y', '1d'),
    fetchYahooChartCloses(deps, 'USDBRL=X', '1y', '1d'),
  ])
  const fxByDay = new Map<string, number>()
  for (const p of fx) {
    const day = ymdUtc(new Date(p.t * 1000))
    fxByDay.set(day, p.c)
  }
  const aligned: Array<{ day: string; proxy: number; fx: number }> = []
  for (const p of proxy) {
    const day = ymdUtc(new Date(p.t * 1000))
    const fxClose = fxByDay.get(day)
    if (fxClose === undefined) continue
    aligned.push({ day, proxy: p.c, fx: fxClose })
  }
  aligned.sort((a, b) => a.day.localeCompare(b.day))
  const proxyRet: number[] = []
  const fxRet: number[] = []
  for (let i = 1; i < aligned.length; i++) {
    const p0 = aligned[i - 1]
    const p1 = aligned[i]
    if (p0.proxy <= 0 || p0.fx <= 0) continue
    proxyRet.push(p1.proxy / p0.proxy - 1)
    fxRet.push(p1.fx / p0.fx - 1)
  }
  const windows: Record<string, unknown> = {}
  for (const w of [30, 60, 90, 252]) {
    const n = Math.min(w, proxyRet.length, fxRet.length)
    const xs = proxyRet.slice(-n)
    const ys = fxRet.slice(-n)
    const st = olsStats(xs, ys)
    if (st) windows[String(w)] = st
  }
  const latest = aligned.length ? aligned[aligned.length - 1] : null
  return {
    method: 'ols_returns',
    proxy_ticker: proxyTicker,
    fx_ticker: 'USDBRL=X',
    period: '1y',
    computed_at_utc: new Date().toISOString(),
    windows,
    latest: latest
      ? {
          proxy_close: latest.proxy,
          fx_close: latest.fx,
          fx_points: latest.fx * 1000,
        }
      : null,
  }
}

export async function fetchYahooOptionsAllExpiries(
  deps: {
    fetchJsonWithTimeout: <T = unknown>(url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<T>
    env: (key: string, fallback?: string) => string
  },
  ticker: string,
  auth?: YahooCrumbSession | null,
) {
  const headers = {
    'User-Agent': yahooUa(),
    Accept: 'application/json',
    Referer: 'https://finance.yahoo.com/',
    ...(auth?.cookieHeader ? { Cookie: auth.cookieHeader } : {}),
  }
  const baseUrl0 = `https://query2.finance.yahoo.com/v7/finance/options/${encodeURIComponent(ticker)}`
  const baseUrl = auth?.crumb ? withCrumb(baseUrl0, auth.crumb) : baseUrl0
  const root = await deps.fetchJsonWithTimeout<any>(baseUrl, 12000, headers)
  const res0 = root && root.optionChain && Array.isArray(root.optionChain.result) ? root.optionChain.result[0] : null
  const expirations: number[] = res0 && Array.isArray(res0.expirationDates) ? res0.expirationDates : []
  const quote = res0 && typeof res0.quote === 'object' ? res0.quote : null
  const spot =
    quote && typeof quote.regularMarketPrice === 'number'
      ? quote.regularMarketPrice
      : quote && typeof quote.postMarketPrice === 'number'
        ? quote.postMarketPrice
        : quote && typeof quote.previousClose === 'number'
          ? quote.previousClose
          : null

  const by_expiry: Record<string, unknown> = {}
  const expiries: string[] = []
  let rawRows = 0

  const maxExpiries = clamp(Number(deps.env('YAHOO_USD_OPTIONS_MAX_EXPIRIES', '999')) || 999, 1, 999)
  const picked = expirations.slice(0, maxExpiries)

  for (const exp of picked) {
    const url0 = `${baseUrl0}?date=${encodeURIComponent(String(exp))}`
    const url = auth?.crumb ? withCrumb(url0, auth.crumb) : url0
    const j = await deps.fetchJsonWithTimeout<any>(url, 12000, headers)
    const r = j && j.optionChain && Array.isArray(j.optionChain.result) ? j.optionChain.result[0] : null
    const opts = r && Array.isArray(r.options) ? r.options[0] : null
    const calls = opts && Array.isArray(opts.calls) ? opts.calls : []
    const puts = opts && Array.isArray(opts.puts) ? opts.puts : []
    rawRows += calls.length + puts.length
    const expDate = opts && typeof opts.expirationDate === 'number' ? opts.expirationDate : exp
    const expYmd = ymdUtc(new Date(expDate * 1000))
    expiries.push(expYmd)

    const map = new Map<
      number,
      {
        callOi: number
        putOi: number
        callVol: number
        putVol: number
        callIvSum: number
        callIvW: number
        putIvSum: number
        putIvW: number
      }
    >()
    const addOne = (row: any, kind: 'call' | 'put') => {
      const strike = safeNum(row?.strike)
      if (strike === null) return

      const oi = safeNum(row?.openInterest) ?? 0
      const vol = safeNum(row?.volume) ?? 0
      const iv = safeNum(row?.impliedVolatility)
      const w = oi > 0 ? oi : vol > 0 ? vol : 0

      const prev = map.get(strike) || { callOi: 0, putOi: 0, callVol: 0, putVol: 0, callIvSum: 0, callIvW: 0, putIvSum: 0, putIvW: 0 }
      if (kind === 'call') {
        prev.callOi += oi
        prev.callVol += vol
        if (iv !== null && w > 0) {
          prev.callIvSum += iv * w
          prev.callIvW += w
        }
      } else {
        prev.putOi += oi
        prev.putVol += vol
        if (iv !== null && w > 0) {
          prev.putIvSum += iv * w
          prev.putIvW += w
        }
      }
      map.set(strike, prev)
    }
    for (const row of calls) addOne(row, 'call')
    for (const row of puts) addOne(row, 'put')

    const strikes = Array.from(map.keys()).sort((a, b) => a - b)
    const call_oi = strikes.map(k => (map.get(k)?.callOi ?? 0))
    const put_oi = strikes.map(k => (map.get(k)?.putOi ?? 0))
    const call_volume = strikes.map(k => (map.get(k)?.callVol ?? 0))
    const put_volume = strikes.map(k => (map.get(k)?.putVol ?? 0))
    const call_iv = strikes.map(k => {
      const it = map.get(k)
      if (!it || !(it.callIvW > 0)) return null
      return it.callIvSum / it.callIvW
    })
    const put_iv = strikes.map(k => {
      const it = map.get(k)
      if (!it || !(it.putIvW > 0)) return null
      return it.putIvSum / it.putIvW
    })
    const calls_count = call_oi.filter(x => (Number(x) || 0) > 0).length
    const puts_count = put_oi.filter(x => (Number(x) || 0) > 0).length

    by_expiry[expYmd] = { strikes, call_oi, put_oi, call_volume, put_volume, call_iv, put_iv, calls_count, puts_count }
  }

  const uniqExp = Array.from(new Set(expiries)).sort((a, b) => a.localeCompare(b))
  return { spot, expiries: uniqExp, by_expiry, raw_rows_count: rawRows }
}
