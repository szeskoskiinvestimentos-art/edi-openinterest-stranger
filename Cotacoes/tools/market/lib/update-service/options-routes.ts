import path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Express } from 'express'

type OptionsMarketData = {
  last_updated?: string
  spot_price?: number
  overview?: { last_update?: string; spot_price?: number; regime?: string }
  key_levels?: {
    gamma_flip?: number
    gamma_flip_hvl?: number
    gamma_flip_hvl_gaussian?: number
    call_wall?: number
    put_wall?: number
    effective_call_wall?: number
    effective_put_wall?: number
    max_pain?: number
    range_low?: number
    range_high?: number
    expected_moves?: unknown[]
  }
}

export function registerOptionsRoutes(params: {
  app: Express
  optionsDashboardDir: string
  nowISO: () => string
  readJsonFile: <T>(filePath: string) => Promise<T | null>
}) {
  async function loadOne(symbol: 'WDO' | 'WIN') {
    const jsonPath = path.join(params.optionsDashboardDir, symbol, 'assets', 'data', 'market_data.json')
    const raw = await params.readJsonFile<OptionsMarketData>(jsonPath)

    const overviewSpot = raw && raw.overview && typeof raw.overview.spot_price === 'number' ? raw.overview.spot_price : null
    const topSpot = raw && typeof raw.spot_price === 'number' ? raw.spot_price : null

    const key = raw && raw.key_levels ? raw.key_levels : null

    const flipCandidate =
      key && typeof key.gamma_flip === 'number'
        ? key.gamma_flip
        : key && typeof key.gamma_flip_hvl === 'number'
          ? key.gamma_flip_hvl
          : key && typeof key.gamma_flip_hvl_gaussian === 'number'
            ? key.gamma_flip_hvl_gaussian
            : null

    const fileUrl = pathToFileURL(path.join(params.optionsDashboardDir, symbol, 'index.html')).toString()
    const dataUrl = pathToFileURL(jsonPath).toString()

    return {
      symbol,
      updatedAt: (raw && raw.overview && raw.overview.last_update) || raw.last_updated || null,
      spot: overviewSpot ?? topSpot,
      regime: (raw && raw.overview && raw.overview.regime) || null,
      keyLevels: {
        gammaFlip: flipCandidate,
        callWall: key && typeof key.call_wall === 'number' ? key.call_wall : null,
        putWall: key && typeof key.put_wall === 'number' ? key.put_wall : null,
        effectiveCallWall: key && typeof key.effective_call_wall === 'number' ? key.effective_call_wall : null,
        effectivePutWall: key && typeof key.effective_put_wall === 'number' ? key.effective_put_wall : null,
        maxPain: key && typeof key.max_pain === 'number' ? key.max_pain : null,
        rangeLow: key && typeof key.range_low === 'number' ? key.range_low : null,
        rangeHigh: key && typeof key.range_high === 'number' ? key.range_high : null,
      },
      links: { dashboard: fileUrl, data: dataUrl },
    }
  }

  params.app.get('/api/options/summary', async (_req, res) => {
    try {
      const [wdo, win] = await Promise.all([loadOne('WDO'), loadOne('WIN')])
      res.json({
        ok: true,
        generatedAt: params.nowISO(),
        source: { kind: 'dashboard_unificado', dir: params.optionsDashboardDir },
        items: { WDO: wdo, WIN: win },
      })
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: 'options_summary_failed',
        generatedAt: params.nowISO(),
        source: { kind: 'dashboard_unificado', dir: params.optionsDashboardDir },
        message: String(err instanceof Error ? err.message : err),
      })
    }
  })
}
