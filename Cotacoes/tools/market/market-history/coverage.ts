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
    IBOV: /(^\.BVSP$|\bIbovespa\b)/i,
    EWZ: /^EWZ$/i,
    DXY: /(^\.DXY$|\bDXY\b|US Dollar Index)/i,
  } as const

  const requiredCritical = envList('MARKET_COVERAGE_CRITICAL').length
    ? envList('MARKET_COVERAGE_CRITICAL')
    : ['USD/BRL', 'WDO', 'WIN', 'IBOV']

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

