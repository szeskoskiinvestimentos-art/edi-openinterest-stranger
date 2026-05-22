import { createStoredHeadlinesStore, parseCreatedAtMs, pruneStoredHeadlines } from '../lib/update-service/headlines-store.js'
import { createTtlCache } from '../lib/update-service/ttl-cache.js'

import type { RegisterNewsRoutesDeps } from './news-routes/types.js'

export function createNewsRoutesDeps(deps: {
  baseDir: string
  fileExists: (p: string) => Promise<boolean>
  readFile: (p: string, opts: { encoding: 'utf-8' }) => Promise<string>
  mkdir: (p: string, opts: { recursive: boolean }) => Promise<unknown>
  writeFile: (p: string, content: string, opts: { encoding: 'utf-8' }) => Promise<unknown>

  register: Omit<
    RegisterNewsRoutesDeps,
    'headlinesCache' | 'webNewsCache' | 'headlinesStore' | 'parseCreatedAtMs' | 'pruneStoredHeadlines'
  >
  headlinesStore: {
    enabled: boolean
    storeFile: string
    retentionDays: number
  }
}) {
  const headlinesCache = createTtlCache<unknown>()
  const webNewsCache = createTtlCache<unknown>()

  const headlinesStore = createStoredHeadlinesStore({
    baseDir: deps.baseDir,
    enabled: deps.headlinesStore.enabled,
    storeFile: deps.headlinesStore.storeFile,
    retentionDays: deps.headlinesStore.retentionDays,
    nowISO: deps.register.nowISO,
    fileExists: deps.fileExists,
    readFile: deps.readFile,
    mkdir: deps.mkdir,
    writeFile: deps.writeFile,
  })

  const out: RegisterNewsRoutesDeps = {
    ...deps.register,
    headlinesCache,
    webNewsCache,
    headlinesStore,
    parseCreatedAtMs,
    pruneStoredHeadlines,
  }
  return out
}
