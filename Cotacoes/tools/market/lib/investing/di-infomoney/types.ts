import type { InvestingBrowser } from '../browser.js'

export type InvestingBrowserConfig = {
  browser: InvestingBrowser
  executablePath?: string
  launchTimeoutMs: number
  args?: string[]
}

