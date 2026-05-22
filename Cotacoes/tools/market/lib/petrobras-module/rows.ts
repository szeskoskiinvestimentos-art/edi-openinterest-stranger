import type { MarketQuotes } from '../../types.js'
import type { WebNewsModule } from '../petrobras-module.js'
import type { PetrobrasResolvedSymbols } from './symbols.js'
import { computeNewsTilt } from './news.js'
import type { PetrobrasModuleRow } from './rows-types.js'
import { addPetrobrasRowsDrivers } from './rows-drivers.js'

export function buildPetrobrasRows(params: {
  market: MarketQuotes
  isPre: boolean
  symbols: PetrobrasResolvedSymbols
  webNews?: WebNewsModule | null
}) {
  const market = params.market
  const news = computeNewsTilt(params.webNews)

  const rows: PetrobrasModuleRow[] = []
  addPetrobrasRowsDrivers({
    market,
    symbols: params.symbols,
    rows,
    news,
    newsAsOf: params.webNews && params.webNews.generatedAt ? String(params.webNews.generatedAt) : null,
  })

  return { rows, news }
}
