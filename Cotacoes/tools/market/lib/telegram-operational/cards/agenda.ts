import { escapeHtml } from '../html.js'
import { calendarSummaryLine, pickCalendarDayByCountry, type EconomicCalendarItem, type EconomicCalendarPayload } from '../calendar.js'

export function buildAgendaInfo(calendar: EconomicCalendarPayload | null) {
  const agendaDay = pickCalendarDayByCountry(calendar, 10)
  const agendaLine = calendarSummaryLine(agendaDay, 3)

  const agendaTodaySupplementHtml = (() => {
    const itemLi = (x: EconomicCalendarItem) => {
      const title = `<span class="pill">${escapeHtml(x.time)} • ${escapeHtml(x.impact)} • ${escapeHtml(x.currency)}</span> <span class="muted">${escapeHtml(x.event)}</span>`
      const wdo = `<div class="small muted" style="margin-top:4px;">WDO: ${escapeHtml(x.wdo || '—')}</div>`
      const win = `<div class="small muted">WIN: ${escapeHtml(x.win || '—')}</div>`
      return `<li>${title}${wdo}${win}</li>`
    }
    const list = (xs: EconomicCalendarItem[]) =>
      `<ul class="list small">${xs.length ? xs.map(itemLi).join('') : '<li><span class="muted">n/d</span></li>'}</ul>`
    return `<div class="grid">
      <div class="box">
        <div class="h">CALENDÁRIO ECONÔMICO (Investing • hoje)</div>
        <div class="cols">
          <div class="box">
            <div class="h" style="margin:0 0 8px 0;">Brasil (BRL)</div>
            ${list(agendaDay.BR)}
          </div>
          <div class="box">
            <div class="h" style="margin:0 0 8px 0;">EUA (USD)</div>
            ${list(agendaDay.EUA)}
          </div>
        </div>
      </div>
      <div class="box">
        <div class="h">China/HK (CNY/CNH)</div>
        ${list(agendaDay['CHINA/HK'])}
      </div>
    </div>`
  })()

  return { agendaDay, agendaLine, agendaTodaySupplementHtml }
}

