export type ExtractedTable = { headers: string[]; rows: string[][] }

export async function extractTablesFromPage(page: import('playwright').Page): Promise<ExtractedTable[]> {
  return await page.evaluate(() => {
    const tables = Array.from(document.querySelectorAll('table'))
    const out: { headers: string[]; rows: string[][] }[] = []

    for (let ti = 0; ti < tables.length; ti++) {
      const t = tables[ti] as HTMLTableElement

      const headers: string[] = []
      const headTh = t.querySelectorAll('thead th')
      if (headTh && headTh.length) {
        for (let i = 0; i < headTh.length; i++) {
          let v = String((headTh[i] as HTMLElement).innerText || '')
          v = v.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
          headers.push(v)
        }
      } else {
        const anyTh = t.querySelectorAll('tr th')
        for (let i = 0; i < anyTh.length; i++) {
          let v = String((anyTh[i] as HTMLElement).innerText || '')
          v = v.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
          headers.push(v)
        }
      }

      const rows: string[][] = []
      const bodyRows = t.querySelectorAll('tbody tr')
      const baseRows = bodyRows && bodyRows.length ? Array.from(bodyRows) : Array.from(t.querySelectorAll('tr'))

      for (let ri = 0; ri < baseRows.length; ri++) {
        const tr = baseRows[ri] as HTMLTableRowElement
        const cells = tr.querySelectorAll('td,th')
        const row: string[] = []
        let hasAny = false
        for (let ci = 0; ci < cells.length; ci++) {
          let v = String((cells[ci] as HTMLElement).innerText || '')
          v = v.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
          if (v) hasAny = true
          row.push(v)
        }
        if (hasAny) rows.push(row)
      }

      out.push({ headers, rows })
    }

    return out
  })
}

