import type { WebNewsModule } from '../petrobras-module.js'
import { clamp } from './stats.js'

export function computeNewsTilt(webNews: WebNewsModule | null | undefined) {
  const ok = !!(webNews && webNews.ok === true && Array.isArray(webNews.items))
  const items = ok ? (webNews!.items || []).slice(0, 40) : []

  const kwMatch = (s: string) =>
    /\bpetrobras\b|\bpetr3\b|\bpetr4\b|\bpbr\b|\bpbra\b|\bfuel\b|\bgasoline\b|\bdiesel\b|\brefiner|\bparity\b|\bpreço\b|\bprecos\b|\bcombust|\bopec\b|\bbrent\b|\bwti\b|\boil\b|\bmiddle\s+east\b|\biran\b|\brussia\b|\bsanction\b|\bwar\b|\bconflict\b|\bbrasil\b|\bbrazil\b|\blula\b|\bhaddad\b|\bcongress\b|\bcopom\b|\bbcb\b/i.test(
      s,
    )

  const pos = [
    /\brally\b/i,
    /\bsurge\b/i,
    /\bgain\b/i,
    /\brise\b/i,
    /\bcut\b/i,
    /\bdeal\b/i,
    /\bagreement\b/i,
    /\brelief\b/i,
    /\bbull\b/i,
    /\bup\b/i,
    /\bmelhora\b/i,
    /\bqueda\s+do\s+d[oó]lar\b/i,
  ]

  const neg = [
    /\bcrash\b/i,
    /\bplunge\b/i,
    /\bfall\b/i,
    /\bdrop\b/i,
    /\bshock\b/i,
    /\bban\b/i,
    /\bsanction\b/i,
    /\bwar\b/i,
    /\bconflict\b/i,
    /\bcrisis\b/i,
    /\btensions\b/i,
    /\bhawkish\b/i,
    /\binflation\b/i,
    /\byields?\s+(?:rise|jump|up)\b/i,
    /\bsubi(?:u|ram)\s+juros\b/i,
    /\baumento\b/i,
    /\bqueda\b/i,
  ]

  const confW = (c: unknown) => {
    const s = String(c || '').toLowerCase()
    if (s.includes('alta')) return 1.3
    if (s.includes('média') || s.includes('media')) return 1.0
    if (s.includes('baixa')) return 0.7
    return 0.9
  }

  let score = 0
  let matched = 0
  const top: Array<{ title: string; url: string }> = []

  for (const it of items) {
    const title = String(it && it.title ? it.title : '').trim()
    const url = String(it && it.url ? it.url : '').trim()
    if (!title || !kwMatch(title)) continue
    matched++
    if (top.length < 6) top.push({ title, url })
    const w = confW(it && it.confidence)
    let s = 0
    for (const re of pos) if (re.test(title)) s += 1
    for (const re of neg) if (re.test(title)) s -= 1
    score += w * clamp(s, -3, 3)
  }

  const denom = matched > 0 ? matched * 3 : 1
  const normalized = clamp(score / denom, -1, 1)
  return { used: ok, matched, score: normalized, top }
}

