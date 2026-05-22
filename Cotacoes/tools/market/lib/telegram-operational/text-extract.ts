import { stripMd } from './html.js'

export function extractNumberedLines(raw: string | null, start: RegExp, maxItems: number) {
  if (!raw) return []
  const lines = raw.split(/\r?\n/g)
  const startIdx = lines.findIndex(l => start.test(l))
  if (startIdx < 0) return []
  const out: string[] = []
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) {
      if (out.length) break
      continue
    }
    if (/^#{1,6}\s+/.test(line)) break
    const m = line.match(/^\d+\.\s*(.+)$/)
    if (!m) continue
    out.push(stripMd(m[1]))
    if (out.length >= maxItems) break
  }
  return out
}

export function extractTableConflitos(raw: string | null, maxItems: number) {
  if (!raw) return []
  const lines = raw.split(/\r?\n/g)
  const startIdx = lines.findIndex(l => /^#{1,6}\s*MATRIZ DE REA(?:CAO|ÇÃO)\s+CRUZADA\b/i.test(l.trim()))
  if (startIdx < 0) return []
  const out: string[] = []
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) {
      if (out.length) break
      continue
    }
    if (/^#{1,6}\s+/.test(line)) {
      if (out.length) break
      continue
    }
    if (!line.startsWith('|')) continue
    const cols = line
      .split('|')
      .map(x => x.trim())
      .filter(Boolean)
    if (cols.length < 3) continue
    if (/^Cenário$/i.test(cols[0])) continue
    if (/^-{2,}$/.test(cols[0])) continue
    out.push(stripMd(`${cols[0]} → ${cols[2]}`))
    if (out.length >= maxItems) break
  }
  return out
}

export function extractEtToBrtHint(raw: string | null) {
  if (!raw) return ''
  const lines = raw.split(/\r?\n/g).map(x => x.trim())
  const idx = lines.findIndex(l => /^##\s*(Conversão de horários:|CONVERSAO ET->BRT\b)/i.test(l))
  if (idx < 0) return ''
  const wanted = new Set(['8h30', '10h00', '14h00'])
  const picks: Array<{ et: string; brtSummer: string; brtWinter: string }> = []
  for (let i = idx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    if (/^#{1,6}\s+/.test(line) && i > idx + 1) break
    if (!line.startsWith('|')) continue
    const cols = line
      .split('|')
      .map(x => x.trim())
      .filter(Boolean)
    if (cols.length < 3) continue
    if (!wanted.has(cols[0])) continue
    picks.push({ et: cols[0], brtSummer: cols[1], brtWinter: cols[2] })
  }
  if (!picks.length) return ''
  return `ET→BRT: ${picks.map(p => `${p.et}→${p.brtSummer}/${p.brtWinter}`).join(' • ')}`
}

export function extractChinaKeyIndicators(raw: string | null, maxItems: number) {
  if (!raw) return []
  const lines = raw.split(/\r?\n/g)
  const idx = lines.findIndex(l => /##\s*1\.\s*INDICADORES DE ATIVIDADE ECONÔMICA E PIB/i.test(l))
  if (idx < 0) return []
  const start = lines.findIndex((l, i) => i > idx && /###\s*Alta Relevância/i.test(l))
  if (start < 0) return []
  const out: string[] = []
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    if (/^#{1,6}\s+/.test(line)) break
    if (!line.startsWith('|')) continue
    const cols = line
      .split('|')
      .map(x => x.trim())
      .filter(Boolean)
    if (!cols.length) continue
    if (/^\*\*GDP/.test(cols[0]) || /\*\*/.test(cols[0])) {
      out.push(stripMd(cols[0]))
    } else if (cols[0] && !/^Indicador/i.test(cols[0])) {
      out.push(stripMd(cols[0]))
    }
    if (out.length >= maxItems) break
  }
  return out
}
