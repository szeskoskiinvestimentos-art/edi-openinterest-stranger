export type HtmlCalendarWidgetRow = {
  time: string
  currency: string
  importance: number
  event: string
  actual: string
  forecast: string
  previous: string
}

export function extractCalendarWidgetRowsFromHtml(html: string): HtmlCalendarWidgetRow[] {
  const out: HtmlCalendarWidgetRow[] = []
  const raw = String(html || '')
  if (!raw) return out

  const stripTags = (s: string) =>
    String(s || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&#160;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const pickTd = (row: string, cls: string) => {
    const rx = new RegExp(`<td[^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*>([\\s\\S]*?)<\\/td>`, 'i')
    const m = row.match(rx)
    return m ? stripTags(m[1]) : ''
  }

  const pickAttr = (row: string, attr: string) => {
    const rx = new RegExp(`${attr}="([^"]+)"`, 'i')
    const m = row.match(rx)
    return m ? String(m[1] || '').trim() : ''
  }

  const rows =
    raw.match(/<tr[^>]+id="eventRowId_\d+"[\s\S]*?<\/tr>/gi) ||
    raw.match(/<tr[^>]+event_timestamp="[^"]+"[\s\S]*?<\/tr>/gi) ||
    []

  for (const row of rows) {
    const time = pickTd(row, 'time') || pickAttr(row, 'evtstrttime')
    const isTimeLike = /^\d{1,2}:\d{2}$/.test(time) || /^\d+\s*min$/i.test(time)
    if (!isTimeLike) continue

    const currencyRaw = pickTd(row, 'flagCur')
    const currency =
      (currencyRaw.match(/\b[A-Z]{3}\b/g) || []).slice(-1)[0] ||
      currencyRaw.replace(/\s+/g, '').toUpperCase()

    const event = pickTd(row, 'event')
    if (!event) continue

    const actual = pickTd(row, 'act')
    const forecast = pickTd(row, 'fore')
    const previous = pickTd(row, 'prev')

    const impCellMatch = row.match(/<td[^>]*class="[^"]*\bsentiment\b[^"]*"[\s\S]*?<\/td>/i)
    const impCell = impCellMatch ? String(impCellMatch[0] || '') : ''
    const bulls =
      (impCell.match(/FullBullishIcon/gi) || []).length ||
      (impCell.match(/fullBullishIcon/gi) || []).length ||
      (impCell.match(/bull/gi) || []).length ||
      0
    const importance = Math.max(0, Math.min(3, bulls))

    out.push({ time, currency, importance, event, actual, forecast, previous })
  }

  return out
}

