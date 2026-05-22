import { findContractsDeep, fmtMonthYearFromUnixSec, numRaw, strRaw, type FuturesDeps } from '../futures-utils.js'
import type { ZqCurveItem } from '../zq-curve-types.js'

export async function fetchFromFuturesChain(
  deps: FuturesDeps,
  params: { rootSymbol: string; max: number; timeoutMs: number },
): Promise<ZqCurveItem[]> {
  const items: ZqCurveItem[] = []
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(params.rootSymbol)}?modules=futuresChain`
  const data = await deps.fetchJsonWithTimeout<unknown>(url, Math.max(1500, params.timeoutMs), {
    'User-Agent': 'Mozilla/5.0',
    Accept: 'application/json',
    Referer: 'https://finance.yahoo.com/',
  })
  const contracts = findContractsDeep(data) || []
  for (const c of contracts.slice(0, params.max)) {
    const c0 = c && typeof c === 'object' ? (c as Record<string, unknown>) : null
    const yahooSymbol = strRaw((c0 && (c0.contractSymbol ?? c0.symbol)) || null)
    const exp = numRaw((c0 && (c0.expiration ?? c0.expirationDate)) || null)
    const last = numRaw((c0 && c0.lastPrice) || null)
    const dayChange = numRaw((c0 && c0.change) || null)
    const dayChangePct = numRaw((c0 && c0.percentChange) || null)
    if (!yahooSymbol || !exp || last === null) continue
    const vertex = yahooSymbol.split('.')[0]
    const impliedRatePct = 100 - last
    items.push({
      vertex,
      yahooSymbol,
      expiration: exp,
      expirationFmt: fmtMonthYearFromUnixSec(exp),
      lastPrice: last,
      impliedRatePct,
      dayChange,
      dayChangePct,
    })
  }
  return items
}
