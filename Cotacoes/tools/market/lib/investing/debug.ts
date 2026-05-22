import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

function safeFileStamp(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

export async function dumpDebug(
  page: import('playwright').Page,
  debugDir: string,
  prefix: string,
  log?: (line: string) => void,
) {
  const out = log || (() => void 0)
  await mkdir(debugDir, { recursive: true })
  const stamp = safeFileStamp()
  const pngPath = path.join(debugDir, `${prefix}_${stamp}.png`)
  const htmlPath = path.join(debugDir, `${prefix}_${stamp}.html`)
  const txtPath = path.join(debugDir, `${prefix}_${stamp}.txt`)
  const closed = page.isClosed()
  let url = ''
  try {
    url = page.url()
  } catch {
    url = ''
  }
  let screenshotOk = false
  if (!closed) {
    try {
      await page.screenshot({ path: pngPath, fullPage: true })
      screenshotOk = true
    } catch {
      screenshotOk = false
    }
  }
  let html = ''
  if (!closed) {
    try {
      html = await page.content()
    } catch {
      html = ''
    }
  }
  await writeFile(htmlPath, html || '<html><body>debug_unavailable</body></html>', 'utf-8')
  await writeFile(txtPath, `url=${url}\nclosed=${closed}\nscreenshot=${screenshotOk}\n`, 'utf-8')
  if (screenshotOk) out(`DEBUG • ${pngPath}`)
  out(`DEBUG • ${htmlPath}`)
  out(`DEBUG • ${txtPath}`)
}
