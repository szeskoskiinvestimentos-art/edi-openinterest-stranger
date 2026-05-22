import type { CalendarWidgetRow } from '../calendar-widget.ts'

export function extractCalendarWidgetRowsFromDom(): CalendarWidgetRow[] {
  return (function () {
    const normalize = (raw: unknown) =>
      String(raw || '')
        .replace(/\u00a0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

    const textOf = (el: any) => {
      if (!el) return ''
      return normalize(el.innerText || el.textContent || '')
    }

    const rows = Array.from(document.querySelectorAll('tr.js-event-item, tr[data-event-datetime]'))
    const fallbackRows = Array.from(document.querySelectorAll('table tbody tr, table tr'))
    const out: any[] = []
    const list = rows.length ? rows : fallbackRows

    for (const tr of list) {
      const tds = Array.from(tr.querySelectorAll('td'))
      const timeCell = tr.querySelector('td.time') || tr.querySelector('td:nth-child(1)') || (tds.length ? tds[0] : null)
      const time = textOf(timeCell)

      const currencyCell = tr.querySelector('td.flagCur') || tr.querySelector('td.currency') || (tds.length > 1 ? tds[1] : null)
      const currency = textOf(currencyCell).replace(/\s+/g, '').toUpperCase()

      const impCell = tr.querySelector('td.sentiment') || tr.querySelector('td:nth-child(3)') || (tds.length > 2 ? tds[2] : null)
      const importance = impCell
        ? Math.max(
            0,
            Math.min(
              3,
              (impCell.querySelectorAll('i.grayFullBullishIcon, i.fullBullishIcon, i.bullishIcon').length ||
                impCell.querySelectorAll('span[class*="bull"]').length ||
                0),
            ),
          )
        : 0

      const eventCell = tr.querySelector('td.event') || tr.querySelector('td:nth-child(4)') || (tds.length > 3 ? tds[3] : null)
      const event = textOf(eventCell)

      const actualCell = tr.querySelector('td.act') || tr.querySelector('td.actual') || (tds.length > 4 ? tds[4] : null)
      const actual = textOf(actualCell)

      const forecastCell = tr.querySelector('td.fore') || tr.querySelector('td.forecast') || (tds.length > 5 ? tds[5] : null)
      const forecast = textOf(forecastCell)

      const previousCell = tr.querySelector('td.prev') || tr.querySelector('td.previous') || (tds.length > 6 ? tds[6] : null)
      const previous = textOf(previousCell)

      const isTimeLike = /^\d{1,2}:\d{2}$/.test(time) || /^\d+\s*min$/i.test(time)
      if (!isTimeLike || !event) continue

      out.push({ time, currency, importance, event, actual, forecast, previous })
    }

    return out as CalendarWidgetRow[]
  })()
}
