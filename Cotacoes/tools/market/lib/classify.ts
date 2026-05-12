import type { CsvRow } from '../types.js'

function normalizeText(s: string) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function includesAny(haystack: string, needles: string[]) {
  const h = normalizeText(haystack)
  return needles.some(n => h.includes(normalizeText(n)))
}

function isEmergingCurrency(ccy: string) {
  const em = new Set([
    'BRL',
    'MXN',
    'ZAR',
    'TRY',
    'RUB',
    'INR',
    'IDR',
    'CLP',
    'COP',
    'PEN',
    'ARS',
    'UYU',
    'PYG',
    'BOB',
    'CNY',
    'CNH',
    'KRW',
    'TWD',
    'THB',
    'MYR',
    'PHP',
    'HUF',
    'PLN',
    'CZK',
  ])
  return em.has(ccy.toUpperCase())
}

export function classifyAsset(row: CsvRow): { category: string; tags: string[] } {
  const name = row['Name'] || ''
  const symbol = row['Symbol'] || ''
  const exchange = row['Exchange'] || ''

  const tags: string[] = []
  const nameLower = name.toLowerCase()
  const symbolCore = symbol.split(' - ')[0]?.trim() || symbol.trim()
  const symbolUpper = symbolCore.toUpperCase()
  const exchangeUpper = String(exchange || '').toUpperCase()

  const isCryptoExchange = exchangeUpper === 'BINANCE' || exchangeUpper === 'INVESTING.COM'

  if (
    (symbolUpper.endsWith('/USD') &&
      new Set([
        'BTC/USD',
        'ETH/USD',
        'SOL/USD',
        'DOGE/USD',
        'XRP/USD',
        'ADA/USD',
        'BNB/USD',
        'AVAX/USD',
        'LINK/USD',
        'LTC/USD',
      ]).has(symbolUpper)) ||
    ((symbolUpper.endsWith('/USD') || symbolUpper.endsWith('/BTC')) &&
      (isCryptoExchange || includesAny(name, ['Crypto', 'Bitcoin', 'Ethereum', 'Solana', 'Dogecoin', 'Litecoin', 'Chainlink', 'Avalanche', 'Polkadot', 'TRON'])))
  ) {
    tags.push('risk_on')
    return { category: 'crypto', tags }
  }

  if (
    symbolUpper === '.DXY' ||
    includesAny(name, ['US Dollar Index', 'DXY', 'Dollar Index', 'Indice Dolar'])
  ) {
    tags.push('risk_off')
    return { category: 'fx_g10', tags }
  }

  if (
    symbolUpper.includes('FEDR') ||
    includesAny(name, ['Federal Funds', 'Fed Funds', 'Federal Funds Rate', 'Federal Funds Composite'])
  ) {
    tags.push('rates')
    tags.push('risk_off')
    return { category: 'rates', tags }
  }

  if (
    /^[A-Z]{2}\d{1,2}YT=(?:RR|XX)$/i.test(symbolUpper) ||
    /^US\d{2}[A-Z]{2}\d{2}=RR$/i.test(symbolUpper) ||
    includesAny(name, ['Year Yield', '10-Year Yield', 'Yield 10-Year', 'Government Bond 10Y', 'Gov 10Y']) ||
    /^US10[A-Z]{2}\d{2}=RR$/i.test(symbolUpper) ||
    includesAny(name, ['spread EUA', 'US 10A vs', 'US 10Y vs'])
  ) {
    tags.push('rates')
    return { category: 'rates', tags }
  }

  if (/^JGB\b/i.test(symbolUpper) || includesAny(name, ['JGB', 'Gov. Japão Futuros', 'Japan Gov Futures'])) {
    tags.push('rates')
    tags.push('futures')
    return { category: 'rates', tags }
  }

  if (/^VHSI(c\d+)?$/i.test(symbolUpper) || includesAny(name, ['HSI Volatility'])) {
    tags.push('risk_off')
    return { category: 'volatility', tags }
  }

  const isCds = includesAny(name, ['cds'])
  if (
    isCds ||
    (symbolUpper.includes('GV') && symbolUpper.endsWith('USAC=R')) ||
    (symbolUpper.includes('GV') && symbolUpper.endsWith('USAB=R'))
  ) {
    tags.push('risk_off')
    tags.push('credit')
    return { category: 'credit', tags }
  }

  if (/^WDO/i.test(symbolUpper)) {
    tags.push('risk_off')
    return { category: 'fx_emerging', tags }
  }

  if (/^WIN/i.test(symbolUpper)) {
    tags.push('risk_on')
    return { category: 'equities', tags }
  }

  if (
    includesAny(name, ['volatility', 'volatitity', 'vix', 'ovx', 'gvz', 'vvix', 'move', 'skew']) ||
    symbolUpper === '.VVIX' ||
    symbolUpper === '.MOVE' ||
    symbolUpper === '.SKEWX' ||
    symbolUpper.startsWith('.VX') ||
    symbolUpper === '.VIX' ||
    symbolUpper === '.VIX9D'
  ) {
    tags.push('risk_off')
    return { category: 'volatility', tags }
  }

  if (
    symbolUpper === '.SPX' ||
    symbolUpper === '.SP500' ||
    symbolUpper === '.NDX' ||
    symbolUpper === '.IXIC' ||
    symbolUpper === '.DJI' ||
    symbolUpper === '.BVSP' ||
    symbolUpper === '.GDAXI' ||
    symbolUpper === '.N225' ||
    symbolUpper === '.FTSE' ||
    includesAny(name, [
      'S&P 500',
      'Nasdaq 100',
      'Nasdaq Composite',
      'Dow Jones',
      'Ibovespa',
      'Bovespa',
      'DAX',
      'Nikkei 225',
      'FTSE 100',
      'Hang Seng',
      'Russell 2000',
    ])
  ) {
    tags.push('risk_on')
    return { category: 'equities', tags }
  }

  if (
    exchangeUpper === 'FX' ||
    (nameLower.includes(' - ') && nameLower.includes(' dollar '))
  ) {
    const pair = (symbolCore.includes('/') ? symbolCore : name.split(' - ')[0].trim()) || symbolCore
    const parts = pair.split('/')
    const left = parts[0] || ''
    const right = parts[1] || ''
    const em = isEmergingCurrency(left) || isEmergingCurrency(right)
    const category = em ? 'fx_emerging' : 'fx_g10'
    if (em) tags.push('risk_on')
    if (!em) tags.push('risk_off')
    if (
      pair.toUpperCase().includes('USD/CHF') ||
      pair.toUpperCase().includes('USD/JPY')
    )
      tags.push('risk_off')
    return { category, tags }
  }

  if (includesAny(name, ['futuro', 'futuros', 'future', 'futures']) && symbolUpper.startsWith('.FU')) {
    const core = symbolUpper.replace(/^\./, '')
    const tail = core.replace(/^FU/i, '')
    let left = ''
    let right = ''
    if (tail.length === 6) {
      left = tail.slice(0, 3)
      right = tail.slice(3, 6)
    }
    if (!left || !right) {
      const m = String(name || '')
        .toUpperCase()
        .match(/\b([A-Z]{3})([A-Z]{3})\b/)
      if (m) {
        left = m[1] || ''
        right = m[2] || ''
      }
    }
    if (left && right) {
      const em = isEmergingCurrency(left) || isEmergingCurrency(right)
      const category = em ? 'fx_emerging' : 'fx_g10'
      tags.push('futures')
      if (em) tags.push('risk_on')
      if (!em) tags.push('risk_off')
      if (`${left}/${right}`.includes('USD/CHF') || `${left}/${right}`.includes('USD/JPY')) tags.push('risk_off')
      return { category, tags }
    }
  }

  const looksLikeSovereignTenor =
    includesAny(name, ['10-year', '20+ year', 'treasury', 'bond']) ||
    /^(?:[A-Z]{2})\d+(?:Y|M)T=RR$/i.test(symbolUpper) ||
    symbolUpper.endsWith('YT=RR') ||
    symbolUpper.endsWith('MT=RR') ||
    symbolUpper.endsWith('WT=RR') ||
    /\b(?:a|to)\s*(?:1|2|3|5|7|10|20|30)\s*(?:anos|years)\b/i.test(name) ||
    /\b(?:a|to)\s*(?:1|3|6|9)\s*(?:meses|months)\b/i.test(name) ||
    /^(?:TUC|TNC|WNC)\d+=?$/.test(symbolUpper) ||
    /^DAPC\d+$/i.test(symbolUpper) ||
    symbolUpper.startsWith('DDIC') ||
    includesAny(name, ['tesouro', 'titulo', 'título', 'ipca', 'ntn', 'dap']) ||
    (includesAny(name, ['spread']) && symbolUpper.endsWith('=RR'))

  if (looksLikeSovereignTenor) {
    tags.push('risk_off')
    return { category: 'rates', tags }
  }

  if (
    includesAny(name, ['futuro', 'futuros', 'future', 'futures']) &&
    includesAny(name, ['di', 'ipca', 'cupom']) &&
    (symbolUpper.startsWith('DAP') || symbolUpper.startsWith('DI') || symbolUpper.startsWith('DDI'))
  ) {
    tags.push('risk_off')
    return { category: 'rates', tags }
  }

  if (includesAny(name, ['sofr', 'fed funds']) || /^SRA/i.test(symbolUpper)) {
    tags.push('risk_off')
    return { category: 'rates', tags }
  }

  if (includesAny(name, ['gold', 'silver', 'platinum', 'palladium'])) {
    tags.push('risk_off')
    return { category: 'metals', tags }
  }

  if (includesAny(name, ['copper', 'iron ore', 'minerio', 'aluminum', 'aluminio', 'nickel', 'niquel', 'zinc', 'lithium', 'litio'])) {
    tags.push('risk_on')
    return { category: 'metals', tags }
  }

  if (new Set(['PBR', 'PBRA']).has(symbolUpper)) {
    tags.push('risk_on')
    return { category: 'equities', tags }
  }

  if (
    includesAny(name, [
      'crude',
      'brent',
      'wti',
      'natural gas',
      'gas natural',
      'gasoline',
      'heating oil',
      'oil',
      'petroleo',
      'petróleo',
    ])
  ) {
    tags.push('risk_on')
    tags.push('oil')
    return { category: 'energy', tags }
  }

  if (
    includesAny(name, [
      'corn',
      'milho',
      'wheat',
      'trigo',
      'soy',
      'soja',
      'coffee',
      'cafe',
      'café',
      'sugar',
      'acucar',
      'açúcar',
      'cotton',
      'algodao',
      'algodão',
      'cocoa',
      'cacau',
      'boi gordo',
      'gado',
    ])
  ) {
    tags.push('risk_on')
    return { category: 'agriculture', tags }
  }

  if (
    includesAny(name, [
      'emerging',
      'msci',
      'china',
      'korea',
      'taiwan',
      'south africa',
      'mexico',
      'brazil',
      'india',
      'asia',
    ])
  ) {
    tags.push('risk_on')
    return { category: 'emerging', tags }
  }

  if (
    symbolUpper.startsWith('.') &&
    !includesAny(name, ['volatilidade', 'volatility', 'vix', 'vvix', 'move', 'skew'])
  ) {
    tags.push('risk_on')
    return { category: 'equities', tags }
  }

  if (
    new Set([
      'SPY',
      'QQQ',
      'DIA',
      'IWM',
      'EEM',
      'VWO',
      'FXI',
      'EWZ',
      'EWW',
      'INDA',
      'EWY',
      'RSX',
      'XLF',
      'XLK',
      'XLE',
      'XLV',
      'XLY',
      'XLP',
      'XLU',
    ]).has(symbolUpper.replace(/\.(O|N)$/i, '')) ||
    (includesAny(name, ['ETF', 'Trust', 'SPDR', 'iShares', 'Invesco', 'Vanguard']) &&
      (exchange.toUpperCase() === 'NYSE' ||
        exchange.toUpperCase() === 'NASDAQ' ||
        exchange.toUpperCase() === 'AMEX'))
  ) {
    tags.push('risk_on')
    return { category: 'equities', tags }
  }

  const looksLikeEquityListing =
    exchangeUpper &&
    new Set([
      'NYSE',
      'NASDAQ',
      'AMEX',
      'BVMF',
      'BM&F BOVESPA',
      'B3',
      'OTC',
      'ASX',
      'LON',
      'HK',
      'SS',
      'TYO',
      'KRX',
      'SGX',
      'BMV',
      'SIX',
      'BCBA',
    ]).has(
      exchangeUpper,
    ) &&
    !symbolUpper.includes('=') &&
    !symbolUpper.includes('/') &&
    !symbolUpper.startsWith('.') &&
    !/\bc\d+$/i.test(symbolUpper) &&
    !includesAny(name, ['futuro', 'futuros', 'future', 'futures', 'cds'])

  if (looksLikeEquityListing) {
    return { category: 'equities', tags }
  }

  if (
    (symbolUpper === 'BRC1' || symbolUpper.startsWith('BRC')) &&
    includesAny(name, ['real brasileiro', 'brazilian real'])
  ) {
    tags.push('risk_on')
    return { category: 'fx_emerging', tags }
  }

  if (includesAny(name, ['futures', 'futuros', 'cfr', 'commodity'])) {
    tags.push('risk_on')
    return { category: 'commodities', tags }
  }

  if (/^LXRc\d+$/i.test(symbolUpper) || includesAny(name, ['lumber', 'madeira serrada'])) {
    tags.push('risk_on')
    return { category: 'commodities', tags }
  }

  if (/^LHC\d+$/i.test(symbolUpper) || includesAny(name, ['lean hogs', 'porco magro'])) {
    tags.push('risk_on')
    return { category: 'commodities', tags }
  }

  return { category: 'other', tags }
}
