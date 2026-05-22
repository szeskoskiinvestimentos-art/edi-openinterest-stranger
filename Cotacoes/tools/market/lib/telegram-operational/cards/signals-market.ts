import { computeFallbackDrivers, computeWebDrivers, pickThesisDrivers } from './signals-market/drivers.js'
import { computeBrazilRatesAndRisk, computeGlobalMoves } from './signals-market/indicators.js'
import { computeBrCommoditiesIntel, computeChinaBrIntel, computeRiskRadar } from './signals-market/intel.js'
import { computeSignalsQuality } from './signals-market/quality.js'
import { computeIndexTrends } from './signals-market/trends.js'
import type { OperationalSignalsInput } from './signals-types.js'

export function computeMarketSignals(params: OperationalSignalsInput) {
  const { quotes, access, web, options } = params
  const trends = computeIndexTrends({ quotes, access })
  const br = computeBrazilRatesAndRisk({ access })
  const moves = computeGlobalMoves({ access })
  const webSignals = computeWebDrivers(web)
  const q = computeSignalsQuality({ quotes, web, options })

  const fallbackDrivers = computeFallbackDrivers({
    dxyA: moves.dxyA,
    us10yA: moves.us10yA,
    vixA: moves.vixA,
    chinaA50A: moves.chinaA50A,
    brlA: trends.brlA,
    winA: trends.winA,
    diShape: br.diShape,
    brRiskA: br.brRisk.a,
    oreA: moves.oreA,
    brentA: moves.brentA,
    copperA: moves.copperA,
    sojaA: moves.sojaA,
  })

  const thesis = pickThesisDrivers({
    driversGlobal: webSignals.driversGlobal,
    driversBr: webSignals.driversBr,
    driversCom: webSignals.driversCom,
    fallbackDrivers,
  })

  const radar = computeRiskRadar({ vixA: moves.vixA, dxyA: moves.dxyA, us10yA: moves.us10yA, brRiskA: br.brRisk.a })
  const chinaBr = computeChinaBrIntel({ chinaA50A: moves.chinaA50A, oreA: moves.oreA })
  const brCom = computeBrCommoditiesIntel({ oreA: moves.oreA, brentA: moves.brentA, copperA: moves.copperA, sojaA: moves.sojaA })

  return {
    winKey: trends.winKey,
    wdoKey: trends.wdoKey,
    win30_90: trends.win30_90,
    winDay: trends.winDay,
    wdo30_90: trends.wdo30_90,
    wdoDay: trends.wdoDay,
    sentiment: webSignals.sentiment,
    conflicts: webSignals.conflicts,
    driversGlobal: webSignals.driversGlobal,
    driversBr: webSignals.driversBr,
    driversCom: webSignals.driversCom,
    thesisDriversGlobal: thesis.thesisDriversGlobal,
    thesisDriversBr: thesis.thesisDriversBr,
    thesisDriversCom: thesis.thesisDriversCom,
    diShort: br.diShort,
    diLong: br.diLong,
    diShape: br.diShape,
    brRisk: br.brRisk,
    vxewz: br.vxewz,
    quotesAge: q.quotesAge,
    optionsAge: q.optionsAge,
    webAge: q.webAge,
    coverage: q.coverage,
    missingCriticalLabel: q.missingCriticalLabel,
    macroQualityIssues: q.macroQualityIssues,
    vixMove: moves.vixMove,
    dxyMove: moves.dxyMove,
    us10y: moves.us10y,
    dalianOre: moves.dalianOre,
    dalianOreA: moves.dalianOreA,
    riskRadar: radar.riskRadar,
    riskRadarMode: radar.riskRadarMode,
    chinaBrIntel: chinaBr.chinaBrIntel,
    chinaBrMode: chinaBr.chinaBrMode,
    chinaBrLabel: chinaBr.chinaBrLabel,
    brCommoditiesIntel: brCom.brCommoditiesIntel,
    brCommoditiesMode: brCom.brCommoditiesMode,
    brComLabel: brCom.brComLabel,
  }
}

export type MarketSignals = ReturnType<typeof computeMarketSignals>
