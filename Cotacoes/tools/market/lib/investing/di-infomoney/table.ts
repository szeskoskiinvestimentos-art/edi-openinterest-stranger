import type { DiQuote } from '../../market-quotes/merge.js'
import { inferDiSymbolFromMaturityText, parsePtNumber, parseSignedPercent } from './parse.js'
import type { ExtractedTable } from './page-extract.js'

export function parseDiQuotesFromTables(extracted: ExtractedTable[]) {
  const headerScore = (h: string[]) => {
    const j = h.join(' ').toLowerCase()
    const hasVenc = /venc|vcto|vencimento/.test(j) ? 1 : 0
    const hasTaxa = /taxa|ultimo|último|ajuste/.test(j) ? 1 : 0
    return hasVenc + hasTaxa
  }

  const picked =
    extracted
      .map(t => ({ ...t, score: headerScore(t.headers), n: t.rows.length }))
      .sort((a, b) => b.score - a.score || b.n - a.n)[0] || null

  const headers = picked && picked.headers ? picked.headers : []
  const rows = picked && picked.rows ? picked.rows : []

  const idxVenc = (() => {
    const i = headers.findIndex(h => /venc|vcto|vencimento/i.test(h))
    return i >= 0 ? i : 0
  })()

  const idxCode = (() => {
    const i = headers.findIndex(h => /c[oó]digo|codigo|c[oó]d\./i.test(h))
    return i >= 0 ? i : -1
  })()

  const idxTaxa = (() => {
    const i = headers.findIndex(h => /taxa|ultimo|último|ajuste/i.test(h))
    if (i >= 0) return i
    return Math.max(0, Math.min(2, headers.length - 1))
  })()

  const idxVar = (() => {
    const i = headers.findIndex(h => /varia/i.test(h))
    return i >= 0 ? i : -1
  })()

  const out: DiQuote[] = []
  for (const r of rows) {
    if (!r || r.length < 2) continue
    const codeCell = idxCode >= 0 ? String(r[idxCode] || '').trim() : ''
    const symbolFromCode = codeCell && /^DI1[FGHJKMNQUVXZ]\d{2}$/i.test(codeCell) ? codeCell.toUpperCase() : null

    const maturity = String(r[idxVenc] || '').trim()
    const symbol = symbolFromCode || inferDiSymbolFromMaturityText(maturity)
    if (!symbol) continue

    const rawRate = String(r[idxTaxa] || '').trim()
    let rate = parsePtNumber(rawRate)
    if (rate === null) {
      const fallbackCell = r.find(x => /%/.test(String(x)) || /\d+,\d+/.test(String(x)))
      rate = fallbackCell ? parsePtNumber(fallbackCell) : null
    }
    if (rate === null) continue

    const varCell = idxVar >= 0 ? String(r[idxVar] || '').trim() : ''
    const changePct = parseSignedPercent(varCell)

    out.push({ symbol, rate, changePct })
  }

  const uniq = new Map<string, DiQuote>()
  for (const q of out) uniq.set(q.symbol, q)
  return Array.from(uniq.values()).slice(0, 120)
}

