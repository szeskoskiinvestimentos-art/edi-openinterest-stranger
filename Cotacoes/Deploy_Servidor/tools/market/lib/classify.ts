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
      ]).has(symbolUpper)) ||
    (symbolUpper.endsWith('/USD') &&
      includesAny(name, ['Bitcoin', 'Ethereum', 'Solana', 'Dogecoin', 'Crypto']))
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

  const looksLikeSovereignTenor =
    includesAny(name, ['10-year', '20+ year', 'treasury', 'bond']) ||
    /^(?:[A-Z]{2})\d+(?:Y|M)T=RR$/i.test(symbolUpper) ||
    symbolUpper.endsWith('YT=RR') ||
    symbolUpper.endsWith('MT=RR') ||
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
    new Set(['NYSE', 'NASDAQ', 'AMEX', 'BVMF', 'BM&F BOVESPA', 'B3', 'OTC', 'ASX', 'LON', 'HK', 'SS', 'TYO', 'KRX', 'SGX', 'BMV', 'SIX']).has(
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

  return { category: 'other', tags }
}
