import type { MarketQuotes } from '../../types.js'
import type { PetrobrasResolvedSymbols } from './symbols.js'
import type { PetrobrasModuleRow, PetrobrasNewsTilt } from './rows-types.js'
import { addAdrAndB3Rows } from './rows-drivers/adr.js'
import { addOilAndEnergyRows } from './rows-drivers/oil.js'
import { addMacroAndRiskRows } from './rows-drivers/macro.js'
import { addMajorsRow, addNewsRow } from './rows-drivers/extras.js'

export function addPetrobrasRowsDrivers(params: {
  market: MarketQuotes
  symbols: PetrobrasResolvedSymbols
  rows: PetrobrasModuleRow[]
  news: PetrobrasNewsTilt
  newsAsOf: string | null
}) {
  addAdrAndB3Rows({ market: params.market, symbols: params.symbols, rows: params.rows })
  addOilAndEnergyRows({ market: params.market, symbols: params.symbols, rows: params.rows })
  addMacroAndRiskRows({ market: params.market, symbols: params.symbols, rows: params.rows })
  addMajorsRow({ symbols: params.symbols, rows: params.rows })
  addNewsRow({ rows: params.rows, news: params.news, generatedAt: params.newsAsOf })
}
