import type { MarketQuotes } from '../../../../types.js'
import type { PetrobrasResolvedSymbols } from '../../symbols.js'
import type { PetrobrasModuleRow } from '../../rows-types.js'

import { addPctRow, addSpreadRow } from '../../rows-helpers.js'

type PctCfg = Parameters<typeof addPctRow>[2]
type SpreadCfg = Parameters<typeof addSpreadRow>[2]

function applyPctRows(market: MarketQuotes, rows: PetrobrasModuleRow[], cfgs: PctCfg[]) {
  for (const cfg of cfgs) addPctRow(market, rows, cfg)
}

function applySpreadRows(market: MarketQuotes, rows: PetrobrasModuleRow[], cfgs: SpreadCfg[]) {
  for (const cfg of cfgs) addSpreadRow(market, rows, cfg)
}

export function addMarketProxyRows(params: { market: MarketQuotes; symbols: PetrobrasResolvedSymbols; rows: PetrobrasModuleRow[]; usdbrlWeight: number }) {
  const market = params.market
  const s = params.symbols
  const rows = params.rows

  applyPctRows(market, rows, [
    {
      key: 'usdbrl',
      label: 'USD/BRL',
      phase: 'any',
      symbol: s.symUSDBRL,
      preferExtended: false,
      weight: params.usdbrlWeight,
      capAbs: 2.5,
      note: 'Efeito misto: receita USD vs. risco político de repasse (paridade).',
    },
    {
      key: 'ibov',
      label: 'Ibovespa',
      phase: 'any',
      symbol: s.symIBOV,
      preferExtended: false,
      weight: 0.8,
      capAbs: 2.5,
      note: 'Beta Brasil (risk-on/off local).',
    },
    {
      key: 'ibrx',
      label: 'IBRX (Índice Brasil 100)',
      phase: 'any',
      symbol: s.symIBRX,
      preferExtended: false,
      weight: 0.25,
      capAbs: 2.5,
      note: 'Beta Brasil (carteira ampla). Útil como confirmação do IBOV quando disponível no CSV.',
    },
    {
      key: 'br20',
      label: 'BR20 (Índice Brasil 20)',
      phase: 'any',
      symbol: s.symBR20,
      preferExtended: false,
      weight: 0.25,
      capAbs: 2.5,
      note: 'Beta Brasil (large caps). Ajuda a ler Petrobras junto de “líderes” e reduzir ruído do IBOV.',
    },
    {
      key: 'bova11',
      label: 'BOVA11 (ETF B3)',
      phase: 'any',
      symbol: s.symBOVA11,
      preferExtended: false,
      weight: 0.4,
      capAbs: 2.5,
      note: 'Proxy Ibovespa via ETF (às vezes mais disponível que .BVSP no watchlist).',
    },
    {
      key: 'win',
      label: 'WIN (mini índice)',
      phase: 'any',
      symbol: s.symWIN,
      preferExtended: false,
      weight: 0.25,
      capAbs: 2.5,
      note: 'Proxy intraday (futuro) para risco Brasil, útil no pregão.',
    },
    {
      key: 'wdo',
      label: 'WDO (mini dólar)',
      phase: 'any',
      symbol: s.symWDO,
      preferExtended: false,
      weight: 0.2,
      capAbs: 2.5,
      note: 'Proxy intraday (futuro) para USD/BRL, útil no pregão.',
    },
    {
      key: 'ewz',
      label: 'EWZ (ETF Brasil)',
      phase: 'any',
      symbol: s.symEWZ,
      preferExtended: true,
      weight: 0.55,
      capAbs: 2.5,
      note: 'Proxy Brasil no exterior (útil no pré).',
    },
  ])
  applySpreadRows(market, rows, [
    {
      key: 'ewz_minus_xle',
      label: 'Brasil vs Energia (EWZ − XLE)',
      phase: 'any',
      symbolA: s.symEWZ,
      preferA: true,
      symbolB: s.symXLE,
      preferB: false,
      weight: 0.35,
      capAbs: 2.5,
      note: 'Driver relativo: Brasil performando acima/abaixo do setor de energia (evita duplicar petróleo puro).',
    },
  ])
}

export function addRiskRows(params: { market: MarketQuotes; symbols: PetrobrasResolvedSymbols; rows: PetrobrasModuleRow[] }) {
  const market = params.market
  const s = params.symbols
  const rows = params.rows

  applyPctRows(market, rows, [
    {
      key: 'dxy',
      label: 'DXY (USD Index)',
      phase: 'any',
      symbol: s.symDXY,
      preferExtended: false,
      weight: -0.45,
      capAbs: 2.0,
      note: 'Dólar forte tende a apertar condições globais (proxy de risco).',
    },
    {
      key: 'us10y',
      label: 'US 10Y (yield)',
      phase: 'any',
      symbol: s.symUS10Y,
      preferExtended: false,
      weight: 0.25,
      capAbs: 1.8,
      invert: true,
      note: 'Juros longos EUA subindo costuma apertar condições financeiras e pesar em risco/global.',
    },
    {
      key: 'br10y',
      label: 'Brasil 10Y (BR10YT=RR)',
      phase: 'any',
      symbol: s.symBR10Y,
      preferExtended: false,
      weight: 0.7,
      capAbs: 1.8,
      invert: true,
      note: 'Carry trade/condições financeiras: juros longos subindo costuma pesar para equities.',
    },
    {
      key: 'br2y',
      label: 'Brasil 2Y (BR2YT=RR)',
      phase: 'any',
      symbol: s.symBR2Y,
      preferExtended: false,
      weight: 0.5,
      capAbs: 1.8,
      invert: true,
      note: 'Sensível a política monetária/curto prazo; alta tende a piorar valuation.',
    },
    {
      key: 'us10br10',
      label: 'Spread BR10Y vs US10Y (US10BR10=RR)',
      phase: 'any',
      symbol: s.symUS10BR10,
      preferExtended: false,
      weight: 0.45,
      capAbs: 2.0,
      invert: true,
      note: 'Risco Brasil relativo: abertura do spread tende a sinalizar stress/carry pior.',
    },
    {
      key: 'br_cds_5y',
      label: 'Brasil CDS 5Y USD (BRGV5YUSAC=R)',
      phase: 'any',
      symbol: s.symBRCDS5Y,
      preferExtended: false,
      weight: 0.55,
      capAbs: 3.0,
      invert: true,
      note: 'Risco soberano (política/fiscal). CDS subindo tende a penalizar ativos Brasil.',
    },
    {
      key: 'vxbr',
      label: 'Ibovespa VIX (VXBR)',
      phase: 'any',
      symbol: s.symVXBR,
      preferExtended: false,
      weight: 0.45,
      capAbs: 8,
      invert: true,
      note: 'Volatilidade implícita local (risk-off).',
    },
    {
      key: 'vix',
      label: 'VIX (EUA)',
      phase: 'any',
      symbol: s.symVIX,
      preferExtended: false,
      weight: 0.35,
      capAbs: 8,
      invert: true,
      note: 'Risk-off global; tende a contaminar emergentes e Petrobras.',
    },
    {
      key: 'ovx',
      label: 'OVX (volatilidade do petróleo)',
      phase: 'any',
      symbol: s.symOVX,
      preferExtended: false,
      weight: 0.35,
      capAbs: 10,
      invert: true,
      note: 'Volatilidade implícita do petróleo; stress no óleo tende a aumentar risco de ruído/repasse.',
    },
  ])
}
