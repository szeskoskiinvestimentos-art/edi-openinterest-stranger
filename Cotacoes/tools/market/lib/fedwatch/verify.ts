export function verifyMeetings(meetings: Array<{ date: string; probs: Record<string, number> }>) {
  const warnings: string[] = []
  for (const m of meetings) {
    const entries = Object.entries(m.probs || {})
    if (!entries.length) {
      warnings.push(`FedWatch: sem probabilidades em ${m.date}`)
      continue
    }
    let sum = 0
    for (const [k, v] of entries) {
      const n = Number(v)
      if (!Number.isFinite(n)) {
        warnings.push(`FedWatch: prob inválida em ${m.date} (${k}=${String(v)})`)
        continue
      }
      if (n < 0 || n > 100) warnings.push(`FedWatch: prob fora do intervalo em ${m.date} (${k}=${n})`)
      sum += n
    }
    if (sum < 99.2 || sum > 100.8) warnings.push(`FedWatch: soma de probs fora de ~100 em ${m.date} (sum=${sum.toFixed(1)})`)
  }
  return warnings
}
