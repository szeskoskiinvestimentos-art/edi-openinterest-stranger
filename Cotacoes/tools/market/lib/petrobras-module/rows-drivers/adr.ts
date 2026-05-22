import type { MarketQuotes } from '../../../types.js'
import type { PetrobrasResolvedSymbols } from '../symbols.js'
import type { PetrobrasModuleRow } from '../rows-types.js'
import { addPctRow, addSpreadRow } from '../rows-helpers.js'

export function addAdrAndB3Rows(params: { market: MarketQuotes; symbols: PetrobrasResolvedSymbols; rows: PetrobrasModuleRow[] }) {
  const market = params.market
  const s = params.symbols
  const rows = params.rows

  addPctRow(market, rows, {
    key: 'pbr_adr',
    label: 'Petrobras ADR (PBR) • Extended',
    phase: 'pre',
    symbol: s.symPBR,
    preferExtended: true,
    weight: 3.4,
    capAbs: 4,
    note: 'Proxy direto do pré-mercado USA para Petrobras.',
  })
  addSpreadRow(market, rows, {
    key: 'pbr_minus_brent',
    label: 'PBR − Brent (idiossincrático)',
    phase: 'pre',
    symbolA: s.symPBR,
    preferA: true,
    symbolB: s.symBrent,
    preferB: true,
    weight: 0.6,
    capAbs: 3,
    note: 'Remove o componente “petróleo” para destacar risco político/empresa no pré.',
  })
  addSpreadRow(market, rows, {
    key: 'pbr_minus_ewz',
    label: 'PBR − EWZ (idiossincrático)',
    phase: 'pre',
    symbolA: s.symPBR,
    preferA: true,
    symbolB: s.symEWZ,
    preferB: true,
    weight: 0.45,
    capAbs: 3,
    note: 'Remove o componente “Brasil” para destacar risco específico Petrobras no pré.',
  })
  addPctRow(market, rows, {
    key: 'pbr_adr_regular',
    label: 'Petrobras ADR (PBR)',
    phase: 'regular',
    symbol: s.symPBR,
    preferExtended: false,
    weight: 1.0,
    capAbs: 4,
    note: 'Confirmação durante o pregão (ADR em horário regular).',
  })
  addPctRow(market, rows, {
    key: 'pbra_adr',
    label: 'Petrobras ADR (PBRA) • Extended',
    phase: 'pre',
    symbol: s.symPBRA,
    preferExtended: true,
    weight: 1.6,
    capAbs: 4,
    note: 'Complemento (nem sempre presente no CSV).',
  })
  addPctRow(market, rows, {
    key: 'pbra_adr_regular',
    label: 'Petrobras ADR (PBRA)',
    phase: 'regular',
    symbol: s.symPBRA,
    preferExtended: false,
    weight: 0.45,
    capAbs: 4,
    note: 'Complemento durante o pregão (quando disponível).',
  })
  addPctRow(market, rows, {
    key: 'petr4',
    label: 'PETR4 (B3)',
    phase: 'regular',
    symbol: s.symPETR4,
    preferExtended: false,
    weight: 0,
    capAbs: 4,
    note: 'Ativo operável (execução). A variação é consequência; não entra no score de drivers.',
  })
  addPctRow(market, rows, {
    key: 'petr3',
    label: 'PETR3 (B3)',
    phase: 'regular',
    symbol: s.symPETR3,
    preferExtended: false,
    weight: 0,
    capAbs: 4,
    note: 'Ativo operável (execução). A variação é consequência; não entra no score de drivers.',
  })
}

