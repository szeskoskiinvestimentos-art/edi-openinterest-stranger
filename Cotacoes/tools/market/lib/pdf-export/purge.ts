import { readdir, unlink } from 'node:fs/promises'
import path from 'node:path'

import { parseStampFromName } from './stamp.js'

export async function purgeOldPdfs(outDir: string, prefixes: string[]) {
  const entries = await readdir(outDir, { withFileTypes: true })
  const pdfs = entries
    .filter(e => e.isFile() && /\.pdf$/i.test(e.name))
    .map(e => e.name)
  for (const prefix of prefixes) {
    const list = pdfs.filter(n => n.startsWith(`${prefix}_`))
    if (list.length <= 1) continue
    const sorted = list
      .map(n => ({ name: n, ts: parseStampFromName(n) }))
      .sort((a, b) => a.ts - b.ts)
    const toDelete = sorted.slice(0, -1).map(x => x.name)
    await Promise.all(toDelete.map(n => unlink(path.join(outDir, n)).catch(() => void 0)))
  }
}
