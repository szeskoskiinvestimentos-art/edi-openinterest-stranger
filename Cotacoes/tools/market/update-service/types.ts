export type UpdateState =
  | {
      running: false
      last?: {
        startedAt: string
        finishedAt: string
        exitCode: number
        logPath: string
        reason: string
        mode?: string
        summary?: unknown
      }
    }
  | {
      running: true
      current: {
        startedAt: string
        logPath: string
        reason: string
        mode?: string
        pid?: number
        summary?: unknown
      }
      last?: {
        startedAt: string
        finishedAt: string
        exitCode: number
        logPath: string
        reason: string
        mode?: string
        summary?: unknown
      }
    }
