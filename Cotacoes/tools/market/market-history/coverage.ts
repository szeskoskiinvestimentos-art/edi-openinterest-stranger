import type { Asset } from '../types.js'

function envBool(name: string, fallback: boolean) {
  const raw = process.env[name]
  if (raw === undefined || raw === null || raw === '') return fallback
  const v = String(raw).trim().toLowerCase()
  if (v === '1' || v === 'true' || v === 'yes' || v === 'y' || v === 'on') return true
  if (v === '0' || v === 'false' || v === 'no' || v === 'n' || v === 'off') return false
  return fallback
}

function envNumber(name: string, fallback: number) {
  const raw = process.env[name]
  if (raw === undefined || raw === null || raw === '') return fallback
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

function envList(name: string) {
  const raw = process.env[name]
  if (raw === undefined || raw === null || raw === '') return []
  return String(raw)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

function hasAssetMatch(assets: Asset[], re: RegExp) {
  for (const a of assets) {
    const sym = String(a && a.symbol ? a.symbol : '')
    const name = String(a && a.name ? a.name : '')
    if (re.test(sym) || re.test(name)) return true
  }
  return false
}

export function validateCoverageOrThrow(assets: Asset[]) {
  const enabled = envBool('MARKET_COVERAGE_ENABLED', true)
  if (!enabled) {
    return {
      ok: true,
      assets: assets.length,
      requiredCritical: [],
      missingCritical: [],
    }
  }

  const minAssets = Math.max(0, envNumber('MARKET_COVERAGE_MIN_ASSETS', 25))
  if (minAssets > 0 && assets.length < minAssets) {
    throw new Error(`Cobertura baixa: assets=${assets.length} (mínimo=${minAssets})`)
  }

  const patterns = {
    'USD/BRL': /^USD\/BRL\b/i,
    WDO: /^WDO/i,
    WIN: /^WIN/i,
    WDOc1: /^WDOc1$/i,
    WINc1: /^WINc1$/i,
    IBOV: /(^\.BVSP$|\bIbovespa\b)/i,
    EWZ: /^EWZ$/i,
    DXY: /(^\.DXY$|\bDXY\b|^USDX$|DX-Y\.NYB|US Dollar Index|\bDollar Index\b)/i,
    US10Y: /(^US10YT=RR$|^\.TNX$|\^TNX|\b10\s*Year\s*Treasury\b|\bUS\s*10Y\b)/i,
    VIX: /(^\.(VIX|VIX9D)\b|^VIX\b|\bVolatility Index\b)/i,
    BRENT: /(\bBrent\b|^BZ(=F)?$|^LCOc1$|^BZc1$)/i,
    WTI: /(\bWTI\b|^CL(=F)?$|^CLc1$)/i,
    GOLD: /(\bXAU\/USD\b|\bGold\b|^GC(=F)?$|^GCc1$)/i,
  } as const

  const requiredCritical = envList('MARKET_COVERAGE_CRITICAL').length
    ? envList('MARKET_COVERAGE_CRITICAL')
    : ['USD/BRL', 'WDO', 'WIN', 'WDOc1', 'WINc1', 'IBOV', 'DXY', 'US10Y', 'VIX', 'BRENT', 'WTI', 'GOLD']

  const missingCritical = requiredCritical.filter(label => {
    const re = (patterns as Record<string, RegExp>)[label]
    if (!re) return false
    return !hasAssetMatch(assets, re)
  })

  if (missingCritical.length) {
    throw new Error(`Críticos ausentes: ${missingCritical.join(', ')}`)
  }

  return {
    ok: true,
    assets: assets.length,
    requiredCritical,
    missingCritical: [],
  }
}
