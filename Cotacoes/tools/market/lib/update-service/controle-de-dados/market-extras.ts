import path from 'node:path'

import { safeReadJson, safeStat } from './fs-helpers.ts'

function parseIsoMs(s: unknown) {
  const t = Date.parse(String(s || ''))
  return Number.isFinite(t) ? t : null
}

function pickPointNear(points: any, targetIso: string | null, windowMs: number) {
  const targetMs = targetIso ? parseIsoMs(targetIso) : null
  if (!Array.isArray(points) || points.length === 0) return null
  if (targetMs === null) return points[points.length - 1]
  const win = typeof windowMs === 'number' && windowMs > 0 ? windowMs : 15 * 60 * 1000
  let best: any = null
  let bestAbs = Infinity
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i]
    const t = parseIsoMs(p && p.t ? p.t : null)
    if (t === null) continue
    const d = Math.abs(t - targetMs)
    if (d > win) continue
    if (d < bestAbs) {
      bestAbs = d
      best = p
    }
    if (d === 0) break
    if (t < targetMs - win) break
  }
  return best || points[points.length - 1]
}

function severityFor(absDiffPct: number | null, status: string) {
  if (status !== 'updated') return 'bad'
  if (absDiffPct === null) return 'bad'
  if (absDiffPct <= 0.2) return 'ok'
  if (absDiffPct <= 0.7) return 'warn'
  if (absDiffPct <= 1.5) return 'risk'
  return 'bad'
}

export async function readMarketQuotesFile(params: { assetsDataDir: string }) {
  const quotesJsonPath = path.resolve(params.assetsDataDir, 'market_quotes.json')
  const mqFs = await safeStat(quotesJsonPath)
  const marketQuotes = await safeReadJson<any>(quotesJsonPath)
  const mqMeta = marketQuotes && typeof marketQuotes === 'object' ? (marketQuotes.meta || {}) : null
  const series = marketQuotes && typeof marketQuotes === 'object' && marketQuotes.series && typeof marketQuotes.series === 'object' ? marketQuotes.series : {}
  if (!mqMeta) return null
  return { path: quotesJsonPath, mtime: mqFs.mtime, mtime_fmt: mqFs.mtime_fmt, meta: mqMeta, series }
}

export async function readYahooAuditFile(params: { assetsDataDir: string }) {
  const yahooAuditPath = path.resolve(params.assetsDataDir, 'market_yahoo_audit.json')
  const auditFs = await safeStat(yahooAuditPath)
  const yahooAudit = await safeReadJson<any>(yahooAuditPath)
  if (!yahooAudit || typeof yahooAudit !== 'object') {
    return { path: yahooAuditPath, mtime: auditFs.mtime, mtime_fmt: auditFs.mtime_fmt, generatedAt: null, items: [], raw: null }
  }
  const items = Array.isArray((yahooAudit as any).items) ? ((yahooAudit as any).items as any[]) : []
  const generatedAt = (yahooAudit as any).generatedAt ? String((yahooAudit as any).generatedAt) : null
  return { path: yahooAuditPath, mtime: auditFs.mtime, mtime_fmt: auditFs.mtime_fmt, generatedAt, items, raw: yahooAudit }
}

export function buildYahooCoverageFromAudit(params: { auditRaw: any }) {
  const a = params.auditRaw
  if (!a || typeof a !== 'object') return null
  const items = Array.isArray((a as any).items) ? ((a as any).items as any[]) : []
  const byCategory = new Map<string, { assets: number; attempted: number; updated: number; missing: number }>()
  for (const it of items) {
    const cat = it && it.category ? String(it.category) : 'unknown'
    const prev = byCategory.get(cat) || { assets: 0, attempted: 0, updated: 0, missing: 0 }
    prev.assets += 1
    prev.attempted += 1
    const st = it && it.status ? String(it.status) : ''
    if (st === 'updated') prev.updated += 1
    if (st === 'missing') prev.missing += 1
    byCategory.set(cat, prev)
  }

  const missingSymbols = items
    .filter(it => it && String(it.status) === 'missing')
    .map(it => String(it.yahooSymbol || it.assetSymbol || '').trim())
    .filter(Boolean)
    .slice(0, 140)

  const updatedSymbols = items
    .filter(it => it && String(it.status) === 'updated')
    .map(it => String(it.yahooSymbol || it.assetSymbol || '').trim())
    .filter(Boolean)
    .slice(0, 140)

  const overridesCount = a && a.overrides && typeof a.overrides === 'object' ? Number((a as any).overrides.count || 0) : 0
  const overridesItems =
    a && a.overrides && typeof a.overrides === 'object' && Array.isArray((a as any).overrides.items) ? ((a as any).overrides.items as any[]) : []

  return {
    enabled: true,
    lastRunAt: a.generatedAt ? String(a.generatedAt) : null,
    attemptedAssets: typeof a.attemptedAssets === 'number' ? a.attemptedAssets : items.length,
    uniqueYahooSymbols: typeof a.uniqueYahooSymbols === 'number' ? a.uniqueYahooSymbols : null,
    returnedYahooSymbols: typeof a.returnedYahooSymbols === 'number' ? a.returnedYahooSymbols : null,
    updatedAssets: typeof a.updatedAssets === 'number' ? a.updatedAssets : null,
    missingAssets: typeof a.missingAssets === 'number' ? a.missingAssets : null,
    byCategory: Object.fromEntries(Array.from(byCategory.entries())),
    updatedSymbols,
    missingSymbols,
    symbolOverrides: { count: Number.isFinite(overridesCount) ? overridesCount : 0, items: overridesItems.slice(0, 60).map(String) },
    dailyFallbackUsed: typeof a.dailyFallbackUsed === 'number' ? a.dailyFallbackUsed : 0,
    quoteFallbackUsed: typeof a.quoteFallbackUsed === 'number' ? a.quoteFallbackUsed : 0,
    skippedAssets: typeof a.skippedAssets === 'number' ? a.skippedAssets : 0,
    nameResolvedUsed: typeof a.nameResolvedUsed === 'number' ? a.nameResolvedUsed : 0,
    tradingViewUsed: typeof a.tradingViewUsed === 'number' ? a.tradingViewUsed : 0,
  }
}

export function buildYahooCompare(params: { marketQuotes: { meta: any; series: any }; auditRaw: any }) {
  const mq = params.marketQuotes
  const audit = params.auditRaw
  const meta = mq && mq.meta && typeof mq.meta === 'object' ? mq.meta : {}
  const series = mq && mq.series && typeof mq.series === 'object' ? mq.series : {}
  const items = audit && Array.isArray((audit as any).items) ? ((audit as any).items as any[]) : []
  const invAt = (meta.portfolioUpdatedAt || meta.generatedAt) ? String(meta.portfolioUpdatedAt || meta.generatedAt) : null

  const rows = items
    .map(it => {
      const assetSymbol = it && it.assetSymbol ? String(it.assetSymbol) : null
      const yahooSymbol = it && it.yahooSymbol ? String(it.yahooSymbol) : null
      const status = it && it.status ? String(it.status) : 'unknown'
      const yahooPrice = typeof it.price === 'number' ? it.price : null
      const points = assetSymbol && series[assetSymbol] ? series[assetSymbol] : null
      const invP = pickPointNear(points, invAt, 40 * 60 * 1000)
      const invPrice = invP && typeof invP.price === 'number' ? invP.price : null
      const invExtPrice = invP && typeof invP.extendedPrice === 'number' ? invP.extendedPrice : null
      const invEffPrice = invExtPrice !== null ? invExtPrice : invPrice
      const invVar = invP && typeof invP.changePct === 'number' ? invP.changePct : null
      const invExtVar = invP && typeof invP.extendedChangePct === 'number' ? invP.extendedChangePct : null
      const invEffVar = invExtVar !== null ? invExtVar : invVar
      const priceDiffPct =
        invEffPrice !== null && yahooPrice !== null && invEffPrice !== 0 ? ((yahooPrice - invEffPrice) / invEffPrice) * 100 : null
      const absDiff = priceDiffPct === null ? null : Math.abs(priceDiffPct)
      const sev = severityFor(absDiff, status)
      return {
        assetSymbol,
        yahooSymbol,
        status,
        investingPrice: invEffPrice,
        yahooPrice,
        priceDiffPct,
        investingChangePct: invEffVar,
        asOf: audit && audit.generatedAt ? String(audit.generatedAt) : null,
        severity: sev,
        _abs: absDiff ?? -1,
      }
    })
    .filter(x => x.assetSymbol && x.yahooSymbol)

  const compareTop = rows
    .filter(x => x.status === 'updated' && typeof x._abs === 'number' && x._abs >= 0)
    .sort((a, b) => Number(b._abs) - Number(a._abs))
    .slice(0, 60)
    .map(({ _abs, ...rest }) => rest)

  const criticalTerms = Array.isArray(meta.coverage && meta.coverage.requiredCritical) ? meta.coverage.requiredCritical.map(String) : []
  const criticalAliases = new Map<string, string[]>([
    ['IBOV', ['.BVSP', '^BVSP']],
  ])

  const criticalRows: any[] = []
  for (const term of criticalTerms) {
    const aliases = criticalAliases.get(term) || []
    const matched = rows.filter(r => {
      const sym = String(r.assetSymbol || '')
      if (sym.startsWith(term) || sym.includes(term)) return true
      if (aliases.includes(sym)) return true
      return false
    })
    for (const r of matched) criticalRows.push(r)
  }

  const compareCritical =
    criticalRows.length > 0
      ? criticalRows
          .filter(x => x.status === 'updated' && typeof x._abs === 'number' && x._abs >= 0)
          .sort((a, b) => Number(b._abs) - Number(a._abs))
          .slice(0, 30)
          .map(({ _abs, ...rest }) => rest)
      : compareTop.slice(0, 18)

  return { compareCritical, compareTop }
}

export async function readZqCurve(params: { assetsDataDir: string }) {
  const zqCurvePath = path.resolve(params.assetsDataDir, 'zq_curve.json')
  const zqFs = await safeStat(zqCurvePath)
  const zqCurve = await safeReadJson<any>(zqCurvePath)
  const zqItems = zqCurve && Array.isArray(zqCurve.items) ? zqCurve.items : []
  if (!zqCurve) return { exists: false, path: zqCurvePath, mtime: zqFs.mtime, mtime_fmt: zqFs.mtime_fmt }
  return {
    exists: true,
    path: zqCurvePath,
    mtime: zqFs.mtime,
    mtime_fmt: zqFs.mtime_fmt,
    contractCount: typeof zqCurve.contractCount === 'number' ? zqCurve.contractCount : zqItems.length,
    slopePct: zqCurve.slopePct ?? null,
    riskMode: zqCurve.riskMode ?? null,
    items: zqItems,
  }
}

export async function readForeignFlow(params: { assetsDataDir: string }) {
  const flowPath = path.resolve(params.assetsDataDir, 'foreign_flow.json')
  const flowFs = await safeStat(flowPath)
  const foreignFlow = await safeReadJson<any>(flowPath)
  const flowGeneratedAt = foreignFlow && (foreignFlow.generatedAt || (foreignFlow.meta && foreignFlow.meta.generatedAt))
    ? String(foreignFlow.generatedAt || foreignFlow.meta.generatedAt)
    : null
  if (!foreignFlow) return { exists: false, generatedAt: null, path: flowPath, mtime: flowFs.mtime, mtime_fmt: flowFs.mtime_fmt }
  return {
    exists: true,
    generatedAt: flowGeneratedAt,
    path: flowPath,
    mtime: flowFs.mtime,
    mtime_fmt: flowFs.mtime_fmt,
    provider: foreignFlow.provider ?? null,
    source: foreignFlow.source ?? null,
    latest: foreignFlow.latest ?? null,
  }
}
