import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileExists } from './io.js'

export async function buildOptionsGammaSummary(params: {
  projectRoot: string
  resolveFromProject: (p: string) => string
  env: (key: string, fallback?: string) => string
}) {
  type OptionsMarketData = {
    last_updated?: string
    spot_price?: number
    overview?: { last_update?: string; spot_price?: number; regime?: string }
    key_levels?: {
      gamma_flip?: number
      gamma_flip_hvl?: number
      gamma_flip_hvl_gaussian?: number
      gamma_flip_selected?: number
      gamma_flip_model?: string
      call_wall?: number
      put_wall?: number
      effective_call_wall?: number
      effective_put_wall?: number
      max_pain?: number
      range_low?: number
      range_high?: number
    }
  }

  const workspaceRoot = path.resolve(params.projectRoot, '..')

  function isPathInside(baseDir: string, targetPath: string) {
    const base = path.resolve(baseDir)
    const target = path.resolve(targetPath)
    const normBase = process.platform === 'win32' ? base.toLowerCase() : base
    const normTarget = process.platform === 'win32' ? target.toLowerCase() : target
    const baseWithSep = normBase.endsWith(path.sep) ? normBase : normBase + path.sep
    return normTarget === normBase || normTarget.startsWith(baseWithSep)
  }

  function resolveInsideWorkspace(label: string, p: string) {
    const abs = params.resolveFromProject(p)
    if (!isPathInside(workspaceRoot, abs)) {
      throw new Error(`${label}_outside_workspace_root:${abs}`)
    }
    return abs
  }

  const envOverride = String(params.env('OPTIONS_UNIFIED_DASHBOARD_DIR', '') || '').trim()
  const optionsDashboardDir = envOverride
    ? resolveInsideWorkspace('OPTIONS_UNIFIED_DASHBOARD_DIR', envOverride)
    : path.resolve(workspaceRoot, 'dashboard_unificado')

  const mercadoDir = path.resolve(workspaceRoot, 'Cotacoes', 'dashboard', 'MERCADO')
  const unifiedRel = path.relative(mercadoDir, optionsDashboardDir).split(path.sep).join('/')

  function relLink(parts: string[]) {
    return [unifiedRel, ...parts].join('/').replace(/\/+/g, '/')
  }

  async function loadOne(symbol: 'WDO' | 'WIN') {
    const jsonPath = path.join(optionsDashboardDir, symbol, 'assets', 'data', 'market_data.json')
    if (!(await fileExists(jsonPath))) return null
    const raw = JSON.parse(await readFile(jsonPath, 'utf-8')) as OptionsMarketData

    const overviewSpot =
      raw && raw.overview && typeof raw.overview.spot_price === 'number' ? raw.overview.spot_price : null
    const topSpot = raw && typeof raw.spot_price === 'number' ? raw.spot_price : null
    const key = raw && raw.key_levels ? raw.key_levels : null

    const flipCandidate =
      key && typeof key.gamma_flip_selected === 'number'
        ? key.gamma_flip_selected
        : key && typeof key.gamma_flip === 'number'
          ? key.gamma_flip
          : key && typeof key.gamma_flip_hvl === 'number'
            ? key.gamma_flip_hvl
            : key && typeof key.gamma_flip_hvl_gaussian === 'number'
              ? key.gamma_flip_hvl_gaussian
              : null

    return {
      symbol,
      updatedAt: (raw && raw.overview && raw.overview.last_update) || raw.last_updated || null,
      spot: overviewSpot ?? topSpot,
      regime: (raw && raw.overview && raw.overview.regime) || null,
      keyLevels: {
        gammaFlip: flipCandidate,
        gammaFlipModel: key && typeof key.gamma_flip_model === 'string' ? key.gamma_flip_model : null,
        callWall: key && typeof key.call_wall === 'number' ? key.call_wall : null,
        putWall: key && typeof key.put_wall === 'number' ? key.put_wall : null,
        effectiveCallWall: key && typeof key.effective_call_wall === 'number' ? key.effective_call_wall : null,
        effectivePutWall: key && typeof key.effective_put_wall === 'number' ? key.effective_put_wall : null,
        maxPain: key && typeof key.max_pain === 'number' ? key.max_pain : null,
        rangeLow: key && typeof key.range_low === 'number' ? key.range_low : null,
        rangeHigh: key && typeof key.range_high === 'number' ? key.range_high : null,
      },
      links: {
        dashboard: relLink([symbol, 'index.html']),
        data: relLink([symbol, 'assets', 'data', 'market_data.json']),
      },
    }
  }

  const [wdo, win] = await Promise.all([loadOne('WDO'), loadOne('WIN')])
  const items: Record<string, unknown> = {}
  if (wdo) items.WDO = wdo
  if (win) items.WIN = win

  if (!Object.keys(items).length) {
    return {
      ok: false,
      generatedAt: new Date().toISOString(),
      provider: 'options_gamma_summary',
      message: `Sem arquivos de opções em ${optionsDashboardDir}`,
    }
  }

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    source: { kind: 'dashboard_unificado', dir: path.relative(workspaceRoot, optionsDashboardDir) || '.' },
    items,
  }
}
