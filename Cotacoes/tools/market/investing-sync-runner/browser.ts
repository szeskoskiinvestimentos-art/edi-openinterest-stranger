import type { BrowserConfig } from '../lib/investing-sync/types.js'
import { env, envNumber } from '../lib/investing-sync/env.js'

export function investingBrowserConfig() {
  const v = (env('INVESTING_BROWSER', 'chrome') || 'chrome').toLowerCase()
  const browser: BrowserConfig['browser'] =
    v === 'chromium' ? 'chromium' : v === 'msedge' || v === 'edge' ? 'msedge' : 'chrome'
  const executablePath = env('INVESTING_CHROME_EXECUTABLE_PATH') || undefined
  const launchTimeoutMs = Math.max(5000, envNumber('INVESTING_BROWSER_LAUNCH_TIMEOUT_MS', 45000))
  const args = ['--disable-blink-features=AutomationControlled']
  return { browser, executablePath, launchTimeoutMs, args }
}

