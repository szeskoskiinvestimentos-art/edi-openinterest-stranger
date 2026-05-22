import { normalize, tokensOf } from './normalize.js'

export function scoreIncludes(haystack: string, includes: string[]) {
  const h = normalize(haystack)
  if (!h) return 0
  let score = 0
  for (const inc of includes) {
    const tks = tokensOf(inc)
    if (!tks.length) continue
    const ok = tks.every(t => h.includes(t))
    if (!ok) return 0
    score += tks.length
  }
  return score
}

export function matchRegex(haystack: string, patterns: string[]) {
  const h = normalize(haystack)
  for (const p of patterns) {
    try {
      if (new RegExp(p, 'i').test(h)) return true
    } catch {
      continue
    }
  }
  return false
}
