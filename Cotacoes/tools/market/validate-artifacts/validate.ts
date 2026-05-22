import { readFile, stat } from 'node:fs/promises'

import { hasWarningsField, isObject, pickGeneratedAt, pickSource } from './contracts.js'
import { baseName, canonicalBaseName } from './files.js'

export type CheckResult =
  | { file: string; ok: true; warnings?: string[] }
  | { file: string; ok: false; reason: string }

const NEED_GENERATED_AT = new Set([
  'web_news_module.json',
  'options_gamma_summary.json',
  'petrobras_module.json',
  'foreign_flow.json',
  'focus_summary.json',
  'zq_curve.json',
  'us_tsy_futures.json',
  'economic_calendar.json',
  'market_yahoo_audit.json',
])

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024

function pickMaxBytes(): number {
  const rawBytes = (process.env.MARKET_VALIDATE_MAX_BYTES || '').trim()
  if (rawBytes) {
    const n = Number(rawBytes)
    if (Number.isFinite(n) && n > 0) return Math.floor(n)
  }
  const rawMb = (process.env.MARKET_VALIDATE_MAX_MB || '').trim()
  if (rawMb) {
    const n = Number(rawMb)
    if (Number.isFinite(n) && n > 0) return Math.floor(n * 1024 * 1024)
  }
  return DEFAULT_MAX_BYTES
}

function validateMarketQuotes(obj: unknown, strict: boolean): string | null {
  if (!isObject(obj)) return 'market_quotes.json não é um objeto'
  const assets = obj.assets
  const series = obj.series
  if (!Array.isArray(assets)) return 'market_quotes.json: assets não é array'
  if (!isObject(series)) return 'market_quotes.json: series não é objeto'
  const gen = pickGeneratedAt(obj)
  if (!gen) return 'market_quotes.json: generatedAt/meta.generatedAt ausente'
  if (strict) {
    const src = pickSource(obj)
    if (!src) return 'market_quotes.json: source/meta.source ausente (strict)'
    if (!hasWarningsField(obj)) return 'market_quotes.json: warnings/meta.warnings ausente (strict)'
  }
  if (strict) {
    if (assets.length < 1) return 'market_quotes.json: assets vazio (strict)'
    const keys = Object.keys(series)
    if (keys.length < 1) return 'market_quotes.json: series vazio (strict)'
    for (const k of keys) {
      const v = (series as Record<string, unknown>)[k]
      if (!Array.isArray(v)) return `market_quotes.json: series.${k} não é array (strict)`
    }
  }
  return null
}

function validateGenericModule(obj: unknown, strict: boolean, file: string): string | null {
  const gen = pickGeneratedAt(obj)
  if (gen) return null
  if (strict) return `${file}: generatedAt/meta.generatedAt ausente`
  return null
}

export async function validateFile(file: string, strict: boolean): Promise<CheckResult> {
  const maxBytes = pickMaxBytes()
  try {
    const st = await stat(file)
    if (st.size > maxBytes) {
      return {
        file,
        ok: false,
        reason: `${baseName(file)}: tamanho excede limite (${String(st.size)} > ${String(maxBytes)} bytes)`,
      }
    }
  } catch (e) {
    return { file, ok: false, reason: `falha ao ler stat: ${String(e instanceof Error ? e.message : e)}` }
  }

  let raw: string
  try {
    raw = await readFile(file, 'utf-8')
  } catch (e) {
    return { file, ok: false, reason: `falha ao ler: ${String(e instanceof Error ? e.message : e)}` }
  }

  let obj: unknown
  try {
    obj = JSON.parse(raw)
  } catch (e) {
    return { file, ok: false, reason: `JSON inválido: ${String(e instanceof Error ? e.message : e)}` }
  }

  const bn = canonicalBaseName(file)
  const needGen = NEED_GENERATED_AT.has(bn)
  const enforceContract = strict

  const warnings: string[] = []
  if (isObject(obj)) {
    const gen = pickGeneratedAt(obj)
    const src = pickSource(obj)
    const hasWarn = hasWarningsField(obj)

    if (enforceContract) {
      if (!gen) return { file, ok: false, reason: `${baseName(file)}: generatedAt/meta.generatedAt ausente (strict)` }
      if (!src) return { file, ok: false, reason: `${baseName(file)}: source/meta.source ausente (strict)` }
      if (!hasWarn) return { file, ok: false, reason: `${baseName(file)}: warnings/meta.warnings ausente (strict)` }
    } else {
      if (!gen) warnings.push('generatedAt/meta.generatedAt ausente')
      if (!src) warnings.push('source/meta.source ausente')
      if (!hasWarn) warnings.push('warnings/meta.warnings ausente')
    }
  } else if (enforceContract) {
    return { file, ok: false, reason: `${baseName(file)}: esperado objeto JSON (strict)` }
  }

  if (bn === 'market_quotes.json') {
    const r = validateMarketQuotes(obj, strict)
    if (r) return { file, ok: false, reason: r }
    return warnings.length ? { file, ok: true, warnings } : { file, ok: true }
  }

  const r = validateGenericModule(obj, strict || needGen, bn)
  if (r) return { file, ok: false, reason: r }
  return warnings.length ? { file, ok: true, warnings } : { file, ok: true }
}
