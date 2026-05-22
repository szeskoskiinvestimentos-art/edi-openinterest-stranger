import path from 'node:path'
import { exportPdfA4FromIndex } from './pdf-export/export-one.js'
import { purgeOldPdfs } from './pdf-export/purge.js'

export { exportPdfA4FromIndex, purgeOldPdfs }

export async function exportDashboardsPdfBundle(params: {
  projectRoot: string
  resolveFromProject: (p: string) => string
  env: (key: string, fallback?: string) => string
  envBool: (key: string, fallback: boolean) => boolean
  log?: (line: string) => void
  warn?: (line: string) => void
}) {
  const log = params.log || (() => void 0)
  const warn = params.warn || (() => void 0)

  const outDir = params.resolveFromProject(
    params.env('EXPORT_PDF_OUT_DIR', path.resolve(params.projectRoot, 'dashboard', 'MERCADO', 'exports')),
  )

  if (params.envBool('EXPORT_DASHBOARD_PDF', true)) {
    const indexPath = path.resolve(params.projectRoot, 'dashboard', 'MERCADO', 'index.html')
    const prefix = params.env('EXPORT_PDF_FILENAME_PREFIX', 'MERCADO')
    await exportPdfA4FromIndex({ indexPath, outDir, prefix, label: 'dashboard PDF', mode: 'full', log, warn })
    try {
      await purgeOldPdfs(outDir, [prefix])
    } catch {
      void 0
    }
  }

  if (params.envBool('EXPORT_DASHBOARD_PDF_LITE', true)) {
    const indexPath = path.resolve(params.projectRoot, 'dashboard', 'MERCADO', 'index.html')
    const prefix = params.env('EXPORT_PDF_LITE_PREFIX', 'MERCADO_LITE')
    await exportPdfA4FromIndex({ indexPath, outDir, prefix, label: 'dashboard PDF (Lite)', mode: 'lite', log, warn })
    try {
      await purgeOldPdfs(outDir, [prefix])
    } catch {
      void 0
    }
  }

  if (params.envBool('EXPORT_WDO_WIN_DASHBOARDS_PDF_LITE', true)) {
    const optionsDashboardDir = params.resolveFromProject(
      params.env('OPTIONS_UNIFIED_DASHBOARD_DIR', path.resolve(params.projectRoot, '..', 'B3_System', 'dashboard_unificado')),
    )
    const wdoIndex = path.resolve(optionsDashboardDir, 'WDO', 'index.html')
    const winIndex = path.resolve(optionsDashboardDir, 'WIN', 'index.html')

    const wdoPrefix = params.env('EXPORT_PDF_WDO_V1_LITE_PREFIX', 'WDO_V1_LITE')
    const winPrefix = params.env('EXPORT_PDF_WIN_V1_LITE_PREFIX', 'WIN_V1_LITE')

    await exportPdfA4FromIndex({ indexPath: wdoIndex, outDir, prefix: wdoPrefix, label: 'dashboard WDO v1 (Lite)', mode: 'lite', log, warn })
    await exportPdfA4FromIndex({ indexPath: winIndex, outDir, prefix: winPrefix, label: 'dashboard WIN v1 (Lite)', mode: 'lite', log, warn })
    try {
      await purgeOldPdfs(outDir, [wdoPrefix, winPrefix])
    } catch {
      void 0
    }
  }
}
