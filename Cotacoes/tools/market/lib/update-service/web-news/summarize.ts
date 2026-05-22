import type { WebNewsItem } from './types.js'

export function summarizeWebNews(items: WebNewsItem[]) {
  const byBucket = {
    GLOBAL: items.filter(x => x.bucket === 'GLOBAL'),
    BRASIL: items.filter(x => x.bucket === 'BRASIL'),
    COMMODITIES: items.filter(x => x.bucket === 'COMMODITIES'),
  }

  const topDrivers = (xs: WebNewsItem[], n: number) => {
    const m = new Map<string, number>()
    for (const x of xs) m.set(x.driver, (m.get(x.driver) || 0) + 1)
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k]) => k)
  }

  const factorLabel = (x: WebNewsItem) => {
    if (!x) return ''
    const prefix = x.bucket === 'BRASIL' ? 'Brasil' : x.bucket === 'COMMODITIES' ? 'Commodities' : 'Global'
    return `${prefix} • ${x.driver}`
  }

  const topFactors = (xs: WebNewsItem[], n: number) => {
    const m = new Map<string, number>()
    for (const x of xs) {
      const k = factorLabel(x)
      if (!k) continue
      m.set(k, (m.get(k) || 0) + 1)
    }
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k]) => k)
  }

  const scoreRisk = (xs: WebNewsItem[]) => {
    let s = 0
    for (const x of xs) {
      if (x.impact.win === '↑' && x.impact.wdo === '↓') s += 1
      if (x.impact.win === '↓' && x.impact.wdo === '↑') s -= 1
    }
    return s
  }

  const risk = scoreRisk(items)
  const sentiment = risk >= 3 ? 'Muito Otimista' : risk >= 1 ? 'Otimista' : risk <= -3 ? 'Muito Pessimista' : risk <= -1 ? 'Pessimista' : 'Neutro'
  const regime = risk >= 2 ? 'risk-on' : risk <= -2 ? 'risk-off' : 'transição'

  const bullish = topFactors(items.filter(x => x.impact.win === '↑' && x.impact.wdo === '↓'), 3)
  const bearish = topFactors(items.filter(x => x.impact.win === '↓' && x.impact.wdo === '↑'), 3)

  const conflicts = []
  const hasUp = items.some(x => x.impact.win === '↑' && x.impact.wdo === '↓')
  const hasDown = items.some(x => x.impact.win === '↓' && x.impact.wdo === '↑')
  if (hasUp && hasDown) conflicts.push('CONFLITO DE NARRATIVA: sinais mistos (risk-on e risk-off) nas manchetes.')

  const thesis = {
    global: `GLOBAL: ${regime} com foco em ${topDrivers(byBucket.GLOBAL, 2).join(' / ') || 'macro'}; implicação: ativos de risco tendem a ${regime === 'risk-off' ? 'perder tração' : regime === 'risk-on' ? 'ganhar suporte' : 'ficar seletivos'}.`,
    brasil: `BRASIL: drivers dominantes ${topDrivers(byBucket.BRASIL, 2).join(' / ') || 'fiscal/BC'}; implicação provável: BRL/WDO e ativos locais tendem a responder por assimetria e ruído institucional.`,
    commodities: `COMMODITIES: foco em ${topDrivers(byBucket.COMMODITIES, 2).join(' / ') || 'energia/minério/agro'}; leitura: termos de troca podem amplificar ou amortecer fluxo para Brasil.`,
  }

  return {
    ok: true,
    summary: {
      globalTop: topDrivers(byBucket.GLOBAL, 5),
      brasilTop: topDrivers(byBucket.BRASIL, 3),
      commoditiesTop: topDrivers(byBucket.COMMODITIES, 3),
      sentiment,
      bullish,
      bearish,
      conflicts,
      thesis,
    },
  }
}
