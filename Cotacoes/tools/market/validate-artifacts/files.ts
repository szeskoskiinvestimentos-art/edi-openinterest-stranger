import path from 'node:path'
import { readdir, stat } from 'node:fs/promises'

export async function walk(dir: string, out: string[] = []): Promise<string[]> {
  let items: string[]
  try {
    items = await readdir(dir)
  } catch {
    return out
  }
  for (const name of items) {
    const full = path.join(dir, name)
    let st
    try {
      st = await stat(full)
    } catch {
      continue
    }
    if (st.isDirectory()) await walk(full, out)
    else out.push(full)
  }
  return out
}

export function normalizeSep(p: string) {
  return p.replaceAll('\\', '/')
}

export function isAssetsDataJson(p: string) {
  const n = normalizeSep(p).toLowerCase()
  return n.includes('/assets/data/') && n.endsWith('.json')
}

export function baseName(p: string) {
  return path.basename(p).toLowerCase()
}

export function canonicalBaseName(p: string) {
  const bn = baseName(p)
  return bn.replace(/-edi(?=\.json$)/i, '')
}
