import type { CsvRow } from '../types.js'

function detectDelimiter(text: string) {
  let inQuotes = false
  let commas = 0
  let semicolons = 0
  let tabs = 0

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (ch === '\r' || ch === '\n') break

    if (ch === '"' && inQuotes && next === '"') {
      i++
      continue
    }
    if (ch === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (!inQuotes) {
      if (ch === ',') commas++
      if (ch === ';') semicolons++
      if (ch === '\t') tabs++
    }
  }

  if (tabs > semicolons && tabs > commas) return '\t'
  if (semicolons > commas) return ';'
  return ','
}

export function parseCsv(text: string): CsvRow[] {
  const delimiter = detectDelimiter(text)
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (ch === '"' && inQuotes && next === '"') {
      field += '"'
      i++
      continue
    }

    if (ch === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (ch === delimiter && !inQuotes) {
      row.push(field)
      field = ''
      continue
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i++
      row.push(field)
      field = ''
      if (row.length === 1 && row[0].trim() === '') {
        row = []
        continue
      }
      rows.push(row)
      row = []
      continue
    }

    field += ch
  }

  row.push(field)
  if (row.length > 1 || row[0].trim() !== '') rows.push(row)

  const header = rows.shift()
  if (!header) return []
  const cleanedHeader = header.map((h, idx) => {
    const trimmed = (h || '').trim()
    if (idx === 0) return trimmed.replace(/^\uFEFF/, '')
    return trimmed
  })

  const headerCounts = new Map<string, number>()
  const uniqueHeader = cleanedHeader.map(h => {
    if (!h) return h
    const prev = headerCounts.get(h) || 0
    const next = prev + 1
    headerCounts.set(h, next)
    return next === 1 ? h : `${h}__${next}`
  })

  return rows
    .filter(r => r.length)
    .map(r => {
      const obj: CsvRow = {}
      uniqueHeader.forEach((h, idx) => {
        if (!h) return
        obj[h] = (r[idx] ?? '').trim()
      })
      return obj
    })
}
