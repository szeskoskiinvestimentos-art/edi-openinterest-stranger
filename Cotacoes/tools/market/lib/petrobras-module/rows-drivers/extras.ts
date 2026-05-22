import type { PetrobrasResolvedSymbols } from '../symbols.js'
import type { PetrobrasModuleRow, PetrobrasNewsTilt } from '../rows-types.js'
import { clamp, isFiniteNumber } from '../stats.js'

export function addMajorsRow(params: { symbols: PetrobrasResolvedSymbols; rows: PetrobrasModuleRow[] }) {
  const s = params.symbols
  const rows = params.rows

  if (s.majorsPresent.length) {
    const v = isFiniteNumber(s.majorsAvg.pct) ? s.majorsAvg.pct : null
    const contrib = v === null ? null : 0.9 * (clamp(v, -2.5, 2.5) / 2.5)
    rows.push({
      key: 'majors_avg',
      label: `Majors Oil (média: ${s.majorsPresent.join(', ')})`,
      phase: 'any',
      symbol: s.majorsPresent[0] || null,
      asOf: null,
      value: v,
      unit: '%',
      capAbs: 2.5,
      weight: 0.9,
      contribution: contrib,
      note: 'Confirmação setorial (média simples dos presentes no CSV).',
    })
  } else {
    rows.push({
      key: 'majors_avg',
      label: 'Majors Oil (média)',
      phase: 'any',
      symbol: null,
      asOf: null,
      value: null,
      unit: '%',
      capAbs: 2.5,
      weight: 0.9,
      contribution: null,
      note: 'Adicione majors (XOM, CVX, SHEL, BP, TTE...) no Investing para habilitar.',
    })
  }
}

export function addNewsRow(params: { rows: PetrobrasModuleRow[]; news: PetrobrasNewsTilt; generatedAt: string | null }) {
  const rows = params.rows
  rows.push({
    key: 'news_tilt',
    label: 'Notícias (tilt automático)',
    phase: 'any',
    symbol: null,
    asOf: params.generatedAt,
    value: params.news.used ? params.news.score : null,
    unit: 'score',
    capAbs: 1,
    weight: 1.4,
    contribution: params.news.used ? 1.4 * params.news.score : null,
    note: params.news.used ? `Heurística por palavras-chave (match: ${params.news.matched}).` : 'Web News Module indisponível.',
  })
}

