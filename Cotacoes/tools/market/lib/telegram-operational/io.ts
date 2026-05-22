import { readFile } from 'node:fs/promises'
import { fetchJsonWithTimeout } from '../net.js'

function safeParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function readJsonSafe<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf-8')
    return safeParseJson<T>(raw)
  } catch {
    return null
  }
}

async function readTextSafe(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf-8')
  } catch {
    return null
  }
}

export async function readTextPrefer(filePaths: string[]) {
  for (const filePath of filePaths) {
    const raw = await readTextSafe(filePath)
    if (raw) return raw
  }
  return null
}

export async function fetchJson<T>(url: string, timeoutMs: number): Promise<T | null> {
  try {
    return await fetchJsonWithTimeout<T>(url, timeoutMs)
  } catch {
    return null
  }
}
