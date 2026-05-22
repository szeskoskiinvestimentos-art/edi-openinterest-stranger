import { findContractsDeep, fmtMonthYearFromUnixSec, numRaw, strRaw, type FuturesDeps } from '../futures-utils.js'
import type { UsTsyFutureItem } from '../us-treasury-futures-types.js'

export async function fetchFrontContractPerRoot(
  deps: FuturesDeps,
  params: { roots: string[]; timeoutMs: number; tenorByRoot: Record<string, string> },
) {
  const items: UsTsyFutureItem[] = []
  for (const rootSymbol of params.roots) {
    try {
      const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(rootSymbol)}?modules=futuresChain`
      const data = await deps.fetchJsonWithTimeout<unknown>(url, Math.max(1500, params.timeoutMs), {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json',
        Referer: 'https://finance.yahoo.com/',
      })
      const contracts = findContractsDeep(data) || []
      const first = contracts.length ? contracts[0] : null
      const c0 = first && typeof first === 'object' ? (first as Record<string, unknown>) : null
      const yahooSymbol = strRaw((c0 && (c0.contractSymbol ?? c0.symbol)) || null)
      const exp = numRaw((c0 && (c0.expiration ?? c0.expirationDate)) || null)
      const last = numRaw((c0 && c0.lastPrice) || null)
      const dayChange = numRaw((c0 && c0.change) || null)
      const dayChangePct = numRaw((c0 && c0.percentChange) || null)
      if (!yahooSymbol || !exp || last === null) continue

      const vertex = yahooSymbol.split('.')[0]
      const tenor = params.tenorByRoot[rootSymbol] || rootSymbol.replace(/=F$/i, '').trim() || rootSymbol
      items.push({
        tenor,
        rootSymbol,
        vertex,
        yahooSymbol,
        expiration: exp,
        expirationFmt: fmtMonthYearFromUnixSec(exp),
        lastPrice: last,
        dayChange,
        dayChangePct,
      })
    } catch {
      void 0
    }
  }
  return items
}
