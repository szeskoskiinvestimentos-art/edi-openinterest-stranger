export async function tryConfirmPopupDownload(params: {
  page: import('playwright').Page
  saveDownload: (download: import('playwright').Download) => Promise<string>
}): Promise<string | null> {
  const waitForDownloadPopup = async () => {
    const downloadPopup = params.page.locator('#downloadPortfolio').first()
    try {
      await downloadPopup.waitFor({ state: 'visible', timeout: 5000 })
      return downloadPopup
    } catch {
      try {
        await params.page.waitForFunction(
          () => {
            const el = document.querySelector('#downloadPortfolio') as HTMLElement | null
            if (!el) return false
            const st = window.getComputedStyle(el)
            return st.display !== 'none' && st.visibility !== 'hidden' && el.getBoundingClientRect().height > 0
          },
          { timeout: 5000 },
        )
        return downloadPopup
      } catch {
        return null
      }
    }
  }

  const downloadPopup = await waitForDownloadPopup()
  if (!downloadPopup) return null
  const downloadPromise = params.page.waitForEvent('download', { timeout: 30000 }).catch(() => null)

  try {
    const downloadBtn = downloadPopup.locator('.js-save').first()
    await downloadBtn.click({ timeout: 6000, force: true })
  } catch {
    const clicked = await params.page.evaluate(() => {
      const root = document.querySelector('#downloadPortfolio')
      if (!root) return false
      const candidates = Array.from(root.querySelectorAll('a,button,span,div')) as HTMLElement[]
      const target = candidates.find(el => /fazer download|fazer o download|download/i.test(String(el.textContent || '')))
      if (!target) return false
      target.click()
      return true
    })
    if (!clicked) return null
  }

  const download = await downloadPromise
  if (!download) return null
  return await params.saveDownload(download)
}
