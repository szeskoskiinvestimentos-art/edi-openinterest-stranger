import { rename } from 'node:fs/promises'
import { launchPersistentContextWithRetry, type InvestingBrowser } from './browser.js'
import { tryDismissBanners } from './page-helpers.js'

export type InvestingBrowserConfig = {
  browser: InvestingBrowser
  executablePath?: string
  launchTimeoutMs: number
  args?: string[]
}

export async function openForLogin(params: {
  userDataDir: string
  url: string
  browser: InvestingBrowserConfig
  log?: (line: string) => void
  print?: (text: string) => void
}) {
  const log = params.log || (() => void 0)
  const print = params.print || (text => process.stdout.write(text))

  const context = await launchPersistentContextWithRetry({
    userDataDir: params.userDataDir,
    headless: false,
    browser: params.browser.browser,
    executablePath: params.browser.executablePath,
    launchTimeoutMs: params.browser.launchTimeoutMs,
    args: params.browser.args,
    log,
    renameDir: rename,
  })
  const page = await context.newPage()
  await page.goto(params.url, { waitUntil: 'domcontentloaded' })
  await tryDismissBanners(page)
  print(
    [
      '',
      'LOGIN INVESTING:',
      '- Faça login manualmente no navegador aberto',
      '- Quando terminar, feche a janela do navegador para encerrar',
      '',
    ].join('\n'),
  )
  await context.waitForEvent('close')
}

export async function openInfoMoneyForLogin(params: {
  userDataDir: string
  browser: InvestingBrowserConfig
  log?: (line: string) => void
  print?: (text: string) => void
}) {
  const log = params.log || (() => void 0)
  const print = params.print || (text => process.stdout.write(text))

  const url = 'https://www.infomoney.com.br/ferramentas/juros-futuros-di/'
  const context = await launchPersistentContextWithRetry({
    userDataDir: params.userDataDir,
    headless: false,
    browser: params.browser.browser,
    executablePath: params.browser.executablePath,
    launchTimeoutMs: params.browser.launchTimeoutMs,
    args: params.browser.args,
    log,
    renameDir: rename,
  })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await tryDismissBanners(page)
  print(
    [
      '',
      'INFO MONEY (DI):',
      '- A página é pública (normalmente não exige login)',
      '- Se aparecer cookie/captcha, resolva manualmente no navegador aberto',
      '- Quando terminar, feche a janela do navegador para encerrar',
      '',
    ].join('\n'),
  )
  await context.waitForEvent('close')
}
