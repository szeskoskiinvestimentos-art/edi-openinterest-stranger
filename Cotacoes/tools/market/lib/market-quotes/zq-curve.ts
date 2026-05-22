import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { FuturesDeps } from './futures-utils.js'
import { buildZqCurvePayload, type ZqCurveItem } from './zq-curve-types.js'
import { tryFetchZqCurveItemsFromInvesting } from './zq-curve-investing.js'
import { fetchZqCurveItemsFromYahoo, fetchZqCurveItemsFromYahooSparkFallback } from './zq-curve-yahoo.js'

export async function writeZqCurveFiles(
  outDir: string,
  opts: { timeoutMs: number; headless: boolean; investingUserDataDir: string; debugDir: string; log?: (line: string) => void },
  deps: FuturesDeps,
) {
  const enabled = deps.envBool('MARKET_ZQ_CURVE_ENABLED', true)
  if (!enabled) return

  const timeoutMs = opts.timeoutMs
  const rootSymbol = deps.env('MARKET_ZQ_CURVE_ROOT', 'ZQ=F') || 'ZQ=F'
  const items: ZqCurveItem[] = []

  const max = Math.max(10, Math.min(600, deps.envNumber('MARKET_ZQ_CURVE_MAX_CONTRACTS', 260)))
  const fromChain = await fetchZqCurveItemsFromYahoo(deps, { rootSymbol, max, timeoutMs })
  items.push(...fromChain)

  if (!items.length) {
    const monthsAhead = Math.max(12, Math.min(180, deps.envNumber('MARKET_ZQ_CURVE_MONTHS_AHEAD', 84)))
    const fromSpark = await fetchZqCurveItemsFromYahooSparkFallback(deps, { max, monthsAhead, timeoutMs })
    items.push(...fromSpark)
  }

  items.sort((a, b) => a.expiration - b.expiration)

  const minContracts = Math.max(0, Math.min(600, deps.envNumber('MARKET_ZQ_CURVE_MIN_CONTRACTS', 60)))
  if (items.length < minContracts) {
    const extra = await tryFetchZqCurveItemsFromInvesting({
      deps,
      timeoutMs,
      investingUserDataDir: opts.investingUserDataDir,
      headless: opts.headless,
      debugDir: opts.debugDir,
      log: opts.log,
    })
    if (extra.length) {
      const seen = new Set(items.map(x => x.yahooSymbol))
      for (const it of extra) {
        if (seen.has(it.yahooSymbol)) continue
        seen.add(it.yahooSymbol)
        items.push(it)
      }
      items.sort((a, b) => a.expiration - b.expiration)
    }
  }

  const payload = buildZqCurvePayload({ rootSymbol, items })

  await writeFile(path.join(outDir, 'zq_curve.json'), JSON.stringify(payload, null, 2), 'utf-8')
  await writeFile(path.join(outDir, 'zq_curve.js'), `window.ZQ_CURVE_DATA=${JSON.stringify(payload)};`, 'utf-8')
}
