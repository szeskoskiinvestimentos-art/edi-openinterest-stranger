import { type ChildProcess } from 'node:child_process'
import express from 'express'
import type { UpdateState } from './types.ts'

export type UpdateServiceStores = {
  state: { get: () => UpdateState; set: (next: UpdateState) => void }
  child: { get: () => ChildProcess | null; set: (next: ChildProcess | null) => void }
  summary: { get: () => unknown; set: (next: unknown) => void }
  lastManualStartMs: { get: () => number | null; set: (next: number | null) => void }
  lastUpdateStartMs: { get: () => number | null; set: (next: number | null) => void }
  schedulePending: { get: () => boolean; set: (next: boolean) => void }
  lastTelegramOperationalSentMs: { get: () => number | null; set: (next: number | null) => void }
}

export type UpdateServiceShutdown = {
  request: () => void
  isRequested: () => boolean
  exitNowIfIdle: () => void
  setServer: (server: ReturnType<express.Express['listen']> | null) => void
}

export type UpdateServiceState = {
  stores: UpdateServiceStores
  shutdown: UpdateServiceShutdown
}

export function createUpdateServiceState(): UpdateServiceState {
  let state: UpdateState = { running: false }
  let lastManualStartMs: number | null = null
  let lastUpdateStartMs: number | null = null
  let currentSummary: unknown = null
  let schedulePending = false
  let currentChild: ChildProcess | null = null
  let lastTelegramOperationalSentMs: number | null = null
  let httpServer: ReturnType<express.Express['listen']> | null = null
  let shutdownRequested = false

  const stores: UpdateServiceStores = {
    state: {
      get: () => state,
      set: next => {
        state = next
      },
    },
    child: {
      get: () => currentChild,
      set: next => {
        currentChild = next
      },
    },
    summary: {
      get: () => currentSummary,
      set: next => {
        currentSummary = next
      },
    },
    lastManualStartMs: {
      get: () => lastManualStartMs,
      set: next => {
        lastManualStartMs = next
      },
    },
    lastUpdateStartMs: {
      get: () => lastUpdateStartMs,
      set: next => {
        lastUpdateStartMs = next
      },
    },
    schedulePending: {
      get: () => schedulePending,
      set: next => {
        schedulePending = next
      },
    },
    lastTelegramOperationalSentMs: {
      get: () => lastTelegramOperationalSentMs,
      set: next => {
        lastTelegramOperationalSentMs = next
      },
    },
  }

  const shutdown: UpdateServiceShutdown = {
    request: () => {
      shutdownRequested = true
    },
    isRequested: () => shutdownRequested,
    exitNowIfIdle: () => {
      if (state.running) return
      if (httpServer) httpServer.close(() => process.exit(0))
      setTimeout(() => process.exit(0), 2500).unref()
    },
    setServer: server => {
      httpServer = server
    },
  }

  return { stores, shutdown }
}
