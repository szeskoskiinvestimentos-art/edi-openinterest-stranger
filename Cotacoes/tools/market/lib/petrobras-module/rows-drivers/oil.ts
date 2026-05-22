import type { MarketQuotes } from '../../../types.js'
import type { PetrobrasResolvedSymbols } from '../symbols.js'
import type { PetrobrasModuleRow } from '../rows-types.js'
import { addPctRow, addSpreadRow } from '../rows-helpers.js'

export function addOilAndEnergyRows(params: { market: MarketQuotes; symbols: PetrobrasResolvedSymbols; rows: PetrobrasModuleRow[] }) {
  const market = params.market
  const s = params.symbols
  const rows = params.rows

  addPctRow(market, rows, {
    key: 'brent',
    label: 'Brent',
    phase: 'any',
    symbol: s.symBrent,
    preferExtended: true,
    weight: 2.6,
    capAbs: 3,
    note: 'Driver primário (petróleo).',
  })
  addPctRow(market, rows, {
    key: 'wti',
    label: 'WTI',
    phase: 'any',
    symbol: s.symWti,
    preferExtended: true,
    weight: 1.0,
    capAbs: 3,
    note: 'Driver secundário (petróleo).',
  })
  addSpreadRow(market, rows, {
    key: 'brent_minus_wti',
    label: 'Brent − WTI (spread)',
    phase: 'any',
    symbolA: s.symBrent,
    preferA: true,
    symbolB: s.symWti,
    preferB: true,
    weight: 0.35,
    capAbs: 2.5,
    note: 'Spread de referência global; pode sinalizar dislocações regionais no petróleo.',
  })
  addSpreadRow(market, rows, {
    key: 'crack_ulsd_brent',
    label: 'Crack ULSD - Brent (margem)',
    phase: 'any',
    symbolA: s.symHO,
    preferA: false,
    symbolB: s.symBrent,
    preferB: true,
    weight: 0.6,
    capAbs: 3,
    note: 'Margem refinado: ULSD vs Brent; positiva favorece repasse.',
  })
  addSpreadRow(market, rows, {
    key: 'crack_rbob_brent',
    label: 'Crack Gasolina - Brent (margem)',
    phase: 'any',
    symbolA: s.symRBOB,
    preferA: false,
    symbolB: s.symBrent,
    preferB: true,
    weight: 0.5,
    capAbs: 3,
    note: 'Margem refinado: RBOB vs Brent; positiva favorece repasse.',
  })
  addPctRow(market, rows, {
    key: 'xle',
    label: 'XLE (Energy ETF)',
    phase: 'any',
    symbol: s.symXLE,
    preferExtended: false,
    weight: 0.7,
    capAbs: 2.5,
    note: 'Sentimento setorial de energia (EUA).',
  })
  addPctRow(market, rows, {
    key: 'xop',
    label: 'XOP (E&P ETF)',
    phase: 'any',
    symbol: s.symXOP,
    preferExtended: false,
    weight: 0.55,
    capAbs: 3,
    note: 'Tendência do segmento de exploração & produção (EUA).',
  })
  addPctRow(market, rows, {
    key: 'oih',
    label: 'OIH (Oil Services ETF)',
    phase: 'any',
    symbol: s.symOIH,
    preferExtended: false,
    weight: 0.35,
    capAbs: 3,
    note: 'Serviços de petróleo (capex/ciclo).',
  })
  addPctRow(market, rows, {
    key: 'uso',
    label: 'USO (WTI ETF)',
    phase: 'any',
    symbol: s.symUSO,
    preferExtended: false,
    weight: 0.25,
    capAbs: 3,
    note: 'Proxy adicional de WTI quando CL não está no watchlist.',
  })
  addPctRow(market, rows, {
    key: 'rbob',
    label: 'RBOB Gasoline (RB=F)',
    phase: 'any',
    symbol: s.symRBOB,
    preferExtended: false,
    weight: 0.35,
    capAbs: 3,
    note: 'Produto refinado (gasolina) – contexto de margens/repasse.',
  })
  addPctRow(market, rows, {
    key: 'heating_oil',
    label: 'ULSD / Heating Oil (HO=F)',
    phase: 'any',
    symbol: s.symHO,
    preferExtended: false,
    weight: 0.35,
    capAbs: 3,
    note: 'Produto refinado (diesel/ULSD) – contexto de margens/repasse.',
  })
  addPctRow(market, rows, {
    key: 'heating_oil_us',
    label: 'Heating Oil (confirm)',
    phase: 'any',
    symbol: s.symHeatingOilUS,
    preferExtended: false,
    weight: 0.15,
    capAbs: 3,
    note: 'Confirmação (diesel/ULSD EUA). Não substitui Gas Oil (Europa).',
  })
}

