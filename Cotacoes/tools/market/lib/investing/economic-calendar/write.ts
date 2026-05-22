import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { EconomicCalendarItem, EconomicCalendarPayload } from './types.js'

export async function writeEconomicCalendar(params: {
  outDir: string
  items: EconomicCalendarItem[]
  keepLastOnEmpty: boolean
  meta?: Partial<EconomicCalendarPayload['meta']>
  warn?: (line: string) => void
}): Promise<void> {
  const warn = params.warn || (() => void 0)

  const jsonPath = path.join(params.outDir, 'economic_calendar.json')
  const attemptedAt = new Date().toISOString()
  if (params.keepLastOnEmpty && (!params.items || params.items.length === 0)) {
    const payload = await tryBuildKeepLastPayload({ jsonPath, attemptedAt, meta: params.meta })
    if (payload) {
      await writeFile(jsonPath, JSON.stringify(payload, null, 2), 'utf-8')
      await writeFile(path.join(params.outDir, 'economic_calendar.js'), `window.ECONOMIC_CALENDAR_DATA=${JSON.stringify(payload)};`, 'utf-8')
      warn('WARN • CAL vazio: mantendo o último economic_calendar.json não-vazio.')
      return
    }
  }

  const payload: EconomicCalendarPayload = {
    meta: {
      generatedAt: params.meta?.generatedAt || attemptedAt,
      attemptedAt,
      source: 'investing_calendar_widget',
      timeZone: 'BRT',
      warnings: [],
      ...(params.meta?.status ? { status: params.meta.status } : {}),
      ...(params.meta?.error ? { error: params.meta.error } : {}),
      ...(typeof params.meta?.unchanged === 'boolean' ? { unchanged: params.meta.unchanged } : {}),
      ...(params.meta?.matrix ? { matrix: params.meta.matrix } : {}),
    },
    items: params.items,
  }
  await writeFile(jsonPath, JSON.stringify(payload, null, 2), 'utf-8')
  await writeFile(path.join(params.outDir, 'economic_calendar.js'), `window.ECONOMIC_CALENDAR_DATA=${JSON.stringify(payload)};`, 'utf-8')
}

async function tryBuildKeepLastPayload(params: {
  jsonPath: string
  attemptedAt: string
  meta: Partial<EconomicCalendarPayload['meta']> | undefined
}): Promise<EconomicCalendarPayload | null> {
  try {
    const prevRaw = await readFile(params.jsonPath, 'utf-8')
    const prev = prevRaw ? (JSON.parse(prevRaw) as Partial<EconomicCalendarPayload>) : null
    const prevItems = prev && Array.isArray(prev.items) ? prev.items : []
    if (!prevItems.length) return null

    const prevMeta = prev && prev.meta && typeof prev.meta === 'object' ? (prev.meta as EconomicCalendarPayload['meta']) : null
    return {
      meta: {
        generatedAt: String(prevMeta?.generatedAt || params.attemptedAt),
        source: String(prevMeta?.source || 'investing_calendar_widget'),
        timeZone: String(prevMeta?.timeZone || 'BRT'),
        warnings: Array.isArray((prevMeta as unknown as { warnings?: unknown })?.warnings)
          ? ((prevMeta as unknown as { warnings: unknown[] }).warnings.map(x => String(x)) as string[])
          : [],
        ...(prevMeta?.attemptedAt ? { attemptedAt: prevMeta.attemptedAt } : {}),
        ...(prevMeta?.status ? { status: prevMeta.status } : {}),
        ...(prevMeta?.error ? { error: prevMeta.error } : {}),
        ...(typeof prevMeta?.unchanged === 'boolean' ? { unchanged: prevMeta.unchanged } : {}),
        ...(params.meta || {}),
        attemptedAt: params.attemptedAt,
      },
      items: prevItems as EconomicCalendarItem[],
    }
  } catch {
    return null
  }
}

