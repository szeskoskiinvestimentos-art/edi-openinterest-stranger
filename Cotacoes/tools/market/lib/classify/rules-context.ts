import type { CsvRow } from '../../types.js'

export type RuleContext = {
  row: CsvRow
  name: string
  symbol: string
  exchange: string
  nameLower: string
  symbolCore: string
  symbolUpper: string
  exchangeUpper: string
  isCryptoExchange: boolean
}

export function buildRuleContext(row: CsvRow): RuleContext {
  const name = row['Name'] || ''
  const symbol = row['Symbol'] || ''
  const exchange = row['Exchange'] || ''

  const nameLower = name.toLowerCase()
  const symbolCore = symbol.split(' - ')[0]?.trim() || symbol.trim()
  const symbolUpper = symbolCore.toUpperCase()
  const exchangeUpper = String(exchange || '').toUpperCase()
  const isCryptoExchange = exchangeUpper === 'BINANCE' || exchangeUpper === 'INVESTING.COM'

  return { row, name, symbol, exchange, nameLower, symbolCore, symbolUpper, exchangeUpper, isCryptoExchange }
}

