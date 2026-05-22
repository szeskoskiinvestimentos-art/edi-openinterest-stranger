import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { isAssetsDataJson, normalizeSep, walk } from './files.js'
import { validateFile, type CheckResult } from './validate.js'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..', '..', '..')
const DASHBOARD_ROOT = path.join(PROJECT_ROOT, 'dashboard')

export async function runValidateArtifacts(argv: string[]) {
  const strict = argv.includes('--strict')
  const all = await walk(DASHBOARD_ROOT)
  const files = all.filter(isAssetsDataJson)
  if (!files.length) {
    process.stderr.write(`FAIL • nenhum assets/data/*.json encontrado em ${DASHBOARD_ROOT}\n`)
    process.exitCode = 2
    return
  }

  const results: CheckResult[] = []
  for (const f of files) results.push(await validateFile(f, strict))

  const rel = (p: string) => normalizeSep(path.relative(PROJECT_ROOT, p))
  const fails = results.filter(r => !r.ok) as Array<{ file: string; ok: false; reason: string }>
  const oks = results.filter(r => r.ok) as Array<{ file: string; ok: true; warnings?: string[] }>

  for (const r of oks) {
    process.stdout.write(`OK • ${rel(r.file)}\n`)
    const ws = r.warnings || []
    for (const w of ws) process.stdout.write(`WARN • ${rel(r.file)} • ${w}\n`)
  }
  for (const r of fails) process.stderr.write(`FAIL • ${rel(r.file)} • ${r.reason}\n`)

  if (fails.length) {
    process.stderr.write(`\nResumo: ${String(fails.length)} falha(s) em ${String(results.length)} arquivo(s).\n`)
    process.exitCode = 1
  } else {
    process.stdout.write(`\nResumo: OK (${String(results.length)} arquivo(s)).\n`)
  }
}
