import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { CalendarMatrixDb, CalendarMatrixCountry, CalendarMatrixDbs } from './types.js'

export async function loadCalendarMatrixDbs(): Promise<CalendarMatrixDbs> {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url))
  const projectRoot = path.resolve(scriptDir, '..', '..', '..', '..')
  const baseDir = path.resolve(projectRoot, 'tools', 'market', 'data', 'calendar-matrix')
  const files: Array<{ country: CalendarMatrixCountry; filename: string }> = [
    { country: 'BR', filename: 'br.json' },
    { country: 'EUA', filename: 'us.json' },
    { country: 'CHINA/HK', filename: 'cn.json' },
  ]

  const out: CalendarMatrixDbs = {}
  await Promise.all(
    files.map(async f => {
      const abs = path.join(baseDir, f.filename)
      const raw = await readFile(abs, 'utf-8')
      const parsed = JSON.parse(raw) as CalendarMatrixDb
      if (!parsed || !parsed.meta || parsed.meta.country !== f.country) {
        throw new Error(`calendar_matrix_db_invalid:${f.filename}`)
      }
      out[f.country] = parsed
    }),
  )
  return out
}
