import type { UsTsyCreditVsTreasury, UsTsyExtraItem, UsTsyFutureItem } from './us-treasury-futures-types.js'

export function computeAvgChangePct(items: UsTsyFutureItem[]) {
  const xs = items
    .map(it => (typeof it.dayChangePct === 'number' && Number.isFinite(it.dayChangePct) ? it.dayChangePct : null))
    .filter((x): x is number => x !== null)
  if (!xs.length) return null
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

export function computeSlopeChangePct(items: UsTsyFutureItem[]) {
  const byTenor = new Map<string, UsTsyFutureItem>()
  for (const it of items) {
    if (!it || !it.tenor) continue
    if (!byTenor.has(it.tenor)) byTenor.set(it.tenor, it)
  }
  const short = byTenor.get('2Y') || null
  const long = byTenor.get('30Y') || null
  const s = short && typeof short.dayChangePct === 'number' && Number.isFinite(short.dayChangePct) ? short.dayChangePct : null
  const l = long && typeof long.dayChangePct === 'number' && Number.isFinite(long.dayChangePct) ? long.dayChangePct : null
  if (s === null || l === null) return null
  return l - s
}

export function computeRiskMode(avgChangePct: number | null) {
  return avgChangePct === null ? 'N/D' : avgChangePct > 0.05 ? 'RISK_OFF' : avgChangePct < -0.05 ? 'RISK_ON' : 'NEUTRO'
}

export function computeShape(slopeChangePct: number | null) {
  return slopeChangePct === null ? 'N/D' : slopeChangePct > 0.05 ? 'STEEPEN' : slopeChangePct < -0.05 ? 'FLATTEN' : 'NEUTRO'
}

export function calcScore(params: { dayPct: number | null; rangePct: number | null; volWeight: number }) {
  if (params.dayPct === null || !Number.isFinite(params.dayPct)) return null as number | null
  const v = params.rangePct !== null && Number.isFinite(params.rangePct) ? params.rangePct : 0
  const mag = Math.abs(params.dayPct) + params.volWeight * v
  const score = params.dayPct >= 0 ? mag : -mag
  return Number.isFinite(score) ? score : null
}

export function applySignalScores(params: { extras: UsTsyExtraItem[]; volWeight: number }) {
  for (const it of params.extras) {
    const dayPct = it && typeof it.dayChangePct === 'number' && Number.isFinite(it.dayChangePct) ? it.dayChangePct : null
    const rangePct =
      it && typeof it.intradayRangePct === 'number' && Number.isFinite(it.intradayRangePct) ? it.intradayRangePct : null
    it.signalScore = calcScore({ dayPct, rangePct, volWeight: params.volWeight })
  }
}

export function computeCreditVsTreasury(extras: UsTsyExtraItem[]): UsTsyCreditVsTreasury {
  const idx = new Map<string, UsTsyExtraItem>()
  for (const it of extras) {
    const s = it && it.yahooSymbol ? String(it.yahooSymbol).trim() : ''
    if (!s) continue
    if (!idx.has(s)) idx.set(s, it)
  }

  const score = (sym: string) => {
    const it = idx.get(sym) || null
    const v = it && typeof it.signalScore === 'number' && Number.isFinite(it.signalScore) ? it.signalScore : null
    return v
  }

  const tlt = score('TLT')
  const hyg = score('HYG')
  const lqd = score('LQD')
  const jnk = score('JNK')
  const shyg = score('SHYG')

  const spreads: Array<{ k: string; val: number }> = []
  if (tlt !== null && hyg !== null) spreads.push({ k: 'HYG−TLT', val: hyg - tlt })
  if (tlt !== null && lqd !== null) spreads.push({ k: 'LQD−TLT', val: lqd - tlt })
  if (tlt !== null && jnk !== null) spreads.push({ k: 'JNK−TLT', val: jnk - tlt })
  if (tlt !== null && shyg !== null) spreads.push({ k: 'SHYG−TLT', val: shyg - tlt })

  if (!spreads.length) {
    return {
      ok: false,
      mode: 'N/D',
      avgSpreadScore: null,
      legs: { TLT: tlt, HYG: hyg, LQD: lqd, JNK: jnk, SHYG: shyg },
      spreads: [],
    }
  }

  const avgSpreadScore = spreads.reduce((a, b) => a + b.val, 0) / spreads.length
  const mode = avgSpreadScore > 0.18 ? 'RISK_ON' : avgSpreadScore < -0.18 ? 'FLIGHT_TO_QUALITY' : 'NEUTRO'

  return {
    ok: true,
    mode,
    avgSpreadScore,
    legs: { TLT: tlt, HYG: hyg, LQD: lqd, JNK: jnk, SHYG: shyg },
    spreads: spreads.map(s => ({ key: s.k, spreadScore: s.val })),
  }
}

