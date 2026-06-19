export function buildSinaSection(params: { marketQuotesSeries: Record<string, unknown> }) {
  const series = params.marketQuotesSeries && typeof params.marketQuotesSeries === 'object' ? params.marketQuotesSeries : {}
  const points = (series as any)['DCE_I0']
  if (!Array.isArray(points) || points.length === 0) return { present: false, last: null }
  const last = points[points.length - 1]
  return { present: true, last }
}
