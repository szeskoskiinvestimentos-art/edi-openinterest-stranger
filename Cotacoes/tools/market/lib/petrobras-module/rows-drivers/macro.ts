import type { MarketQuotes } from '../../../types.js'
import type { PetrobrasResolvedSymbols } from '../symbols.js'
import type { PetrobrasModuleRow } from '../rows-types.js'
import { oilAvgPctFromMarket } from './macro/oil.js'
import { addMarketProxyRows, addRiskRows } from './macro/rows.js'
import { usdbrlDynamicWeight } from './macro/weights.js'

export function addMacroAndRiskRows(params: { market: MarketQuotes; symbols: PetrobrasResolvedSymbols; rows: PetrobrasModuleRow[] }) {
  const oilAvgPct = oilAvgPctFromMarket(params.market, params.symbols)
  const usdbrlWeight = usdbrlDynamicWeight({ oilAvgPct })
  addMarketProxyRows({ market: params.market, symbols: params.symbols, rows: params.rows, usdbrlWeight })
  addRiskRows({ market: params.market, symbols: params.symbols, rows: params.rows })
}
