import path from 'node:path'

import { atomicWriteText } from '../lib/io.js'

export async function writeJsonAndJs(outDir: string, baseName: string, windowKey: string, payload: unknown) {
  const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

  const normalizePayload = (p: unknown) => {
    if (!isObject(p)) return p
    const out: Record<string, unknown> = { ...p }

    const provider = typeof out.provider === 'string' && out.provider.trim() ? out.provider.trim() : null
    const source =
      typeof out.source === 'string' && out.source.trim()
        ? out.source.trim()
        : (() => {
            const meta = out.meta
            if (isObject(meta) && typeof meta.source === 'string' && meta.source.trim()) return meta.source.trim()
            return provider || baseName
          })()

    if (!('source' in out)) out.source = source
    if (!('warnings' in out)) out.warnings = []

    const meta = out.meta
    if (isObject(meta)) {
      const metaOut: Record<string, unknown> = { ...meta }
      if (!('source' in metaOut)) metaOut.source = source
      if (!('warnings' in metaOut)) metaOut.warnings = Array.isArray(out.warnings) ? out.warnings : []
      out.meta = metaOut
    }
    return out
  }

  const normalized = normalizePayload(payload)
  const jsonPath = path.join(outDir, `${baseName}.json`)
  const jsPath = path.join(outDir, `${baseName}.js`)
  const jsonText = JSON.stringify(normalized, null, 2)
  JSON.parse(jsonText)
  await atomicWriteText(jsonPath, jsonText)
  await atomicWriteText(jsPath, `window.${windowKey}=${JSON.stringify(normalized)};`)
}

