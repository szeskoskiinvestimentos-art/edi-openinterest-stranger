import { top3FromSummary } from '../../html.js'
import type { OperationalSignalsInput } from '../signals-types.js'

export function computeWebDrivers(web: OperationalSignalsInput['web']) {
  const driversGlobal = top3FromSummary(web && web.ok && web.summary ? web.summary.globalTop : [])
  const driversBr = top3FromSummary(web && web.ok && web.summary ? web.summary.brasilTop : [])
  const driversCom = top3FromSummary(web && web.ok && web.summary ? web.summary.commoditiesTop : [])
  const sentiment = web && web.ok && web.summary ? String(web.summary.sentiment || '') : ''
  const conflicts = web && web.ok && web.summary && Array.isArray(web.summary.conflicts) ? web.summary.conflicts : []
  return { driversGlobal, driversBr, driversCom, sentiment, conflicts }
}

export function computeFallbackDrivers(params: {
  dxyA: string
  us10yA: string
  vixA: string
  chinaA50A: string
  brlA: string
  winA: string
  diShape: string
  brRiskA: string
  oreA: string
  brentA: string
  copperA: string
  sojaA: string
}) {
  const global: string[] = []
  const brasil: string[] = []
  const commodities: string[] = []

  if (params.dxyA === '↑') global.push('USD forte (DXY↑)')
  else if (params.dxyA === '↓') global.push('USD fraco (DXY↓)')

  if (params.us10yA === '↑') global.push('Yields↑ (US10Y)')
  else if (params.us10yA === '↓') global.push('Yields↓ (US10Y)')

  if (params.vixA === '↑') global.push('Vol↑ (VIX)')
  else if (params.vixA === '↓') global.push('Vol↓ (VIX)')

  if (params.chinaA50A === '↑') global.push('China forte (A50↑)')
  else if (params.chinaA50A === '↓') global.push('China fraca (A50↓)')

  if (params.brlA === '↑') brasil.push('Real fraco (USD/BRL↑)')
  else if (params.brlA === '↓') brasil.push('Real forte (USD/BRL↓)')

  if (params.winA === '↑') brasil.push('Bolsa↑ (WIN)')
  else if (params.winA === '↓') brasil.push('Bolsa↓ (WIN)')

  if (params.diShape !== 'n/d') brasil.push(`Curva DI: ${params.diShape}`)
  if (params.brRiskA === '↑') brasil.push('CDS BR↑')
  else if (params.brRiskA === '↓') brasil.push('CDS BR↓')

  if (params.oreA !== 'n/d') commodities.push(`Minério ${params.oreA}`)
  if (params.brentA !== 'n/d') commodities.push(`Brent ${params.brentA}`)
  if (params.copperA !== 'n/d') commodities.push(`Cobre ${params.copperA}`)
  if (params.sojaA !== 'n/d') commodities.push(`Soja ${params.sojaA}`)

  return {
    global: global.length ? global.slice(0, 3) : ['—'],
    brasil: brasil.length ? brasil.slice(0, 3) : ['—'],
    commodities: commodities.length ? commodities.slice(0, 3) : ['—'],
  }
}

export function pickThesisDrivers(params: {
  driversGlobal: string[]
  driversBr: string[]
  driversCom: string[]
  fallbackDrivers: { global: string[]; brasil: string[]; commodities: string[] }
}) {
  const thesisDriversGlobal = params.driversGlobal.length ? params.driversGlobal : params.fallbackDrivers.global
  const thesisDriversBr = params.driversBr.length ? params.driversBr : params.fallbackDrivers.brasil
  const thesisDriversCom = params.driversCom.length ? params.driversCom : params.fallbackDrivers.commodities
  return { thesisDriversGlobal, thesisDriversBr, thesisDriversCom }
}
