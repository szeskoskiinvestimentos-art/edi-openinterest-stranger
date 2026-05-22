import type { YahooMergeDeps } from './yahoo-merge-deps.js'

export function normalizeInvestingYahooCandidate(investingSymbol: string) {
  const raw = String(investingSymbol || '').trim()
  if (!raw) return ''

  const pair = raw.match(/^([A-Z0-9]{2,10})\/([A-Z0-9]{2,10})\b/)
  if (pair) return `${pair[1].toUpperCase()}/${pair[2].toUpperCase()}`

  return raw.replace(/\s+/g, ' ')
}

export function parseSymbolOverrides(raw: string | undefined) {
  const out = new Map<string, string>()
  const text = String(raw || '').trim()
  if (!text) return out
  for (const part of text.split(/[;\n]+/g)) {
    const p = part.trim()
    if (!p) continue
    const idx = p.indexOf('=')
    if (idx <= 0) continue
    const left = p.slice(0, idx).trim()
    const right = p.slice(idx + 1).trim()
    if (!left || !right) continue
    out.set(left, right)
  }
  return out
}

export function parseYahooSet(parseList: YahooMergeDeps['parseList'], raw: string | undefined) {
  return new Set(parseList(raw).map(x => x.trim()).filter(Boolean))
}

