import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { fileExists } from '../io.js'
import { PDF_LITE_STYLE } from './lite-style.js'
import { stampParts } from './stamp.js'

export async function exportPdfA4FromIndex(params: {
  indexPath: string
  outDir: string
  prefix: string
  label: string
  mode: 'full' | 'lite'
  log?: (line: string) => void
  warn?: (line: string) => void
}) {
  const log = params.log || (() => void 0)
  const warn = params.warn || (() => void 0)

  const exists = await fileExists(params.indexPath)
  if (!exists) return null

  await mkdir(params.outDir, { recursive: true })
  const { yyyy, mm, dd, hh, mi, ss } = stampParts(new Date())
  const pdfName = `${params.prefix}_${yyyy}${mm}${dd}_${hh}${mi}${ss}.pdf`
  const pdfPath = path.join(params.outDir, pdfName)
  const fileUrl = pathToFileURL(params.indexPath).toString()

  let browser: import('playwright').Browser | null = null
  try {
    const { chromium } = await import('playwright')
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto(fileUrl, { waitUntil: 'load', timeout: 60000 })
    await page.waitForTimeout(2500)
    try {
      if (params.mode === 'lite') {
        await page.addStyleTag({ content: PDF_LITE_STYLE })
      }
      await page.emulateMedia({ media: 'screen' })
    } catch {
      void 0
    }
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: params.mode === 'full',
      ...(params.mode === 'full'
        ? { margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' } }
        : { printBackground: false, scale: 0.96, margin: { top: '8mm', bottom: '8mm', left: '8mm', right: '8mm' } }),
    })
    log(`OK • ${params.label}: ${pdfPath}`)
    return pdfPath
  } catch (e) {
    warn(`WARN • Falha ao exportar PDF (${params.label}): ${String(e instanceof Error ? e.message : e)}`)
    return null
  } finally {
    if (browser) await browser.close()
  }
}
