import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

function normalizeCsvHeader(s: string) {
  return String(s || '')
    .trim()
    .replace(/^"+|"+$/g, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function looksLikeInvestingCsvHeaderLine(headerLine: string) {
  const raw = String(headerLine || '').trim()
  if (!raw) return false
  if (/^</.test(raw) && /html/i.test(raw)) return false
  const delimiter = raw.includes(';') ? ';' : raw.includes(',') ? ',' : raw.includes('\t') ? '\t' : null
  if (!delimiter) return false
  const headers = raw.split(delimiter).map(normalizeCsvHeader).filter(Boolean)
  if (headers.length < 3) return false

  const hasSymbol = headers.some(h => ['symbol', 'ticker', 'ativo', 'instrumento', 'codigo', 'codigos', 'cod.'].includes(h))
  const hasName = headers.some(h => ['name', 'nome'].includes(h))
  const hasLast =
    headers.some(h => ['last', 'ultimo', 'preco', 'preco de fechamento', 'price'].includes(h)) ||
    headers.some(h => h.includes('ultimo') || h.includes('preco') || h.includes('price'))
  return hasSymbol && (hasLast || hasName)
}

export async function findLatestCsvInDirs(dirs: string[]) {
  const candidates = Array.from(new Set(dirs.map(d => String(d || '').trim()).filter(Boolean)))
  let best: { path: string; mtimeMs: number } | null = null

  for (const dir of candidates) {
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const e of entries) {
        if (!e.isFile()) continue
        const name = e.name || ''
        if (!name.toLowerCase().endsWith('.csv')) continue
        const full = path.join(dir, name)
        let st: Awaited<ReturnType<typeof stat>> | null = null
        try {
          st = await stat(full)
        } catch {
          st = null
        }
        if (!st) continue
        const mtimeMs = Number((st as unknown as { mtimeMs: number | bigint }).mtimeMs)
        if (!Number.isFinite(mtimeMs)) continue
        if (!best || mtimeMs > best.mtimeMs) best = { path: full, mtimeMs }
      }
    } catch {
      void 0
    }
  }

  return best
}

export async function validateInvestingCsvOrThrow(
  csvPath: string,
  opts: {
    enabled: boolean
    minBytes: number
    minRows: number
  },
) {
  if (!opts.enabled) return

  const st = await stat(csvPath)
  const minBytes = Math.max(256, opts.minBytes)
  if (!st || !Number.isFinite(st.size) || st.size < minBytes) {
    throw new Error(
      `CSV inválido (tamanho): ${path.basename(csvPath)} (${st && Number.isFinite(st.size) ? st.size : 'n/a'} bytes)`,
    )
  }

  const raw = await readFile(csvPath, 'utf-8')
  const head = String(raw || '').trimStart().slice(0, 4096)
  if (!head) throw new Error(`CSV vazio: ${path.basename(csvPath)}`)
  if (/^<!doctype|^<html/i.test(head)) throw new Error(`CSV inválido (HTML): ${path.basename(csvPath)}`)

  const firstLine = String(raw.split(/\r?\n/)[0] || '').trim()
  if (!looksLikeInvestingCsvHeaderLine(firstLine)) {
    throw new Error(`CSV inválido (header inesperado): ${path.basename(csvPath)}`)
  }

  const minRows = Math.max(5, opts.minRows)
  const lines = raw.split(/\r?\n/).filter(l => String(l).trim().length > 0)
  if (lines.length - 1 < minRows) {
    throw new Error(`CSV inválido (poucas linhas): ${path.basename(csvPath)} (linhas=${Math.max(0, lines.length - 1)})`)
  }
}
