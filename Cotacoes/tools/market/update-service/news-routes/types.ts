import type { Express } from 'express'

export type RegisterNewsRoutesDeps = {
  app: Express
  reloadDotenvIfChanged: () => Promise<void>
  env: (name: string, fallback?: string) => string | undefined
  envBool: (name: string, fallback: boolean) => boolean
  envNumber: (name: string, fallback: number) => number
  nowISO: () => string
  parseLimit: (params: { value: unknown; fallback: number; min: number; max: number }) => number
  normalizeDiscordChannelId: (raw: string) => string

  financialJuiceUrl: string
  newsMaxItems: number
  newsCacheSeconds: number
  newsHeadlinesRetentionDays: number
  newsHeadlinesStoreEnabled: boolean

  newsWebEnabled: boolean
  newsWebWindowHours: number
  newsWebMaxItems: number
  newsWebCacheSeconds: number
  newsWebRssUrls: string[]

  headlinesCache: { get: (nowMs: number, ttlMs: number) => unknown | null; set: (nowMs: number, value: unknown) => void }
  webNewsCache: { get: (nowMs: number, ttlMs: number) => unknown | null; set: (nowMs: number, value: unknown) => void }

  fetchRawWithTimeout: (params: {
    url: string
    timeoutMs: number
    method: 'GET' | 'POST'
    headers?: Record<string, string>
    body?: string
  }) => Promise<{ status: number; ok: boolean; text: string; headers: Record<string, string> }>
  fetchTextWithTimeout: (url: string, timeoutMs: number) => Promise<string>

  fetchDiscordMessages: (params: {
    channelId: string
    token: string
    limit: number
    timeoutMs: number
    fetchRawWithTimeout: (params: {
      url: string
      timeoutMs: number
      method: 'GET' | 'POST'
      headers?: Record<string, string>
      body?: string
    }) => Promise<{ status: number; ok: boolean; text: string; headers: Record<string, string> }>
  }) => Promise<unknown[]>
  buildStoredHeadlinesFromDiscordMessages: (raw: unknown, limit: number) => Array<{
    id: string
    createdAt: string | null
    original: string
    url: string | null
    author: { bot?: boolean; username?: string | null } | null
  }>
  headlinesStore: { load: (nowMs: number) => Promise<any[]>; save: (items: any[]) => Promise<void> }
  parseCreatedAtMs: (iso: string | null) => number | null
  pruneStoredHeadlines: (items: any[], nowMs: number, retentionDays: number) => any[]

  hostnameOf: (u: string) => string
  parseRssItems: (xml: string) => Array<{ title: string; link: string; pubDate: string | null; source: string | null }>
  sanitizeNoNumbers: (s: string) => string
  classifyWebNewsItem: (title: string, url: string) => { bucket: string; driver: string; impact: unknown; confidence: string }
  normalizeWebItemId: (url: string, title: string) => string
  summarizeWebNews: (items: any[]) => any
}
