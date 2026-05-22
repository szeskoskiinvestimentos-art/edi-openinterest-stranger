import { rename } from 'node:fs/promises'
import { chromium } from 'playwright'

export type InvestingBrowser = 'chrome' | 'msedge' | 'chromium'

function resolveChannel(browser: InvestingBrowser) {
  if (browser === 'chromium') return undefined
  if (browser === 'msedge') return 'msedge'
  return 'chrome'
}

function shouldUseChannel(executablePath?: string) {
  return !executablePath
}

export function buildChromiumLaunchOptions(params: {
  headless: boolean
  browser: InvestingBrowser
  executablePath?: string
  launchTimeoutMs: number
  args?: string[]
}) {
  const channel = resolveChannel(params.browser)
  const useChannel = shouldUseChannel(params.executablePath)
  return {
    headless: params.headless,
    acceptDownloads: true,
    timeout: params.launchTimeoutMs,
    ...(useChannel && channel ? { channel } : {}),
    ...(!useChannel && params.executablePath ? { executablePath: params.executablePath } : {}),
    args: Array.isArray(params.args) ? params.args : [],
  } as const
}

export async function launchPersistentContextWithRetry(params: {
  userDataDir: string
  headless: boolean
  browser: InvestingBrowser
  executablePath?: string
  launchTimeoutMs: number
  args?: string[]
  log?: (line: string) => void
  renameDir?: typeof rename
}) {
  const log = params.log || (() => void 0)
  const options = buildChromiumLaunchOptions({
    headless: params.headless,
    browser: params.browser,
    executablePath: params.executablePath,
    launchTimeoutMs: params.launchTimeoutMs,
    args: params.args,
  })

  log(`BROWSER • ${params.executablePath ? `exe=${params.executablePath}` : `channel=${resolveChannel(params.browser) || 'chromium'}`}`)
  try {
    return await chromium.launchPersistentContext(params.userDataDir, options)
  } catch (err) {
    void err
    const altDir = `${params.userDataDir}-alt`
    const doRename = params.renameDir || rename
    try {
      await doRename(params.userDataDir, `${params.userDataDir}.broken_${Date.now()}`)
    } catch (renameErr) {
      void renameErr
    }
    log(`RETRY • profile=${altDir}`)
    return await chromium.launchPersistentContext(altDir, options)
  }
}
