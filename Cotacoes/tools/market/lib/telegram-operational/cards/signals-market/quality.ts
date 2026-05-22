import { fmtAge, minutesSinceIso } from '../data-access.js'
import type { OperationalSignalsInput } from '../signals-types.js'

export function computeSignalsQuality(params: { quotes: OperationalSignalsInput['quotes']; web: OperationalSignalsInput['web']; options: OperationalSignalsInput['options'] }) {
  const { quotes, web, options } = params

  const quotesAgeMin = quotes && quotes.meta ? minutesSinceIso(quotes.meta.generatedAt) : null
  const quotesAge = fmtAge(quotesAgeMin)
  const optionsAge = fmtAge(options ? minutesSinceIso(options.generatedAt) : null)
  const webAge = fmtAge(web ? minutesSinceIso(web.generatedAt) : null)

  const coverage = quotes && quotes.meta ? quotes.meta.coverage : undefined
  const missingCritical = coverage && Array.isArray(coverage.missingCritical) ? coverage.missingCritical : []
  const missingCriticalLabel = missingCritical.length
    ? `${missingCritical.slice(0, 3).join(', ')}${missingCritical.length > 3 ? '…' : ''}`
    : '—'

  const maxQuotesAgeMin = quotes && quotes.meta ? Math.max(45, Math.max(10, quotes.meta.intervalMinutes) * 4) : 60
  const macroQualityIssues: string[] = []
  if (coverage && coverage.ok === false) macroQualityIssues.push('cobertura')
  if (typeof quotesAgeMin === 'number' && quotesAgeMin > maxQuotesAgeMin) macroQualityIssues.push(`quotes>${maxQuotesAgeMin}m`)

  return { quotesAge, optionsAge, webAge, coverage, missingCriticalLabel, macroQualityIssues }
}
