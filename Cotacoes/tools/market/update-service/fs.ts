import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, { encoding: 'utf-8' })
  return JSON.parse(raw) as T
}

export async function appendLog(logPath: string, chunk: string) {
  await mkdir(path.dirname(logPath), { recursive: true })
  await writeFile(logPath, chunk, { encoding: 'utf-8', flag: 'a' })
}

export async function fileExists(p: string) {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

