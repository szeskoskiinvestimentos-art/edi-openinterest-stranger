export const PDF_LITE_STYLE = `
  * { box-shadow: none !important; text-shadow: none !important; }
  html, body { color: #000 !important; font-size: 11px !important; }
  body, body * { color: #000 !important; opacity: 1 !important; }
  a, a:visited { color: #000 !important; text-decoration: none !important; }
  html, body, .main, .section, .context-box, .table-container, nav, header, footer {
    background: #ffffff !important;
  }
  nav, header { display: none !important; }
  .section-glow, .quicknav-overlay { display: none !important; }
  .positive, .negative, .neutral {
    color: #000 !important;
    border-color: #000 !important;
    background: transparent !important;
  }
  .data-table th, .data-table td {
    border-color: #000 !important;
  }
  .data-table th, .data-table td { padding: 4px 6px !important; font-size: 10px !important; }
  .tm-card__list .tm-row .tm-row__pct,
  .tm-card__list .tm-row .tm-row__name,
  .tm-card__list .tm-row .tm-row__symbol {
    color: #000 !important;
  }
  canvas { filter: grayscale(100%) saturate(0%) !important; }
  svg { filter: grayscale(100%) saturate(0%) !important; }
  .calendar-widget__iframe { filter: grayscale(100%) saturate(0%) !important; }
  .metric-card, .context-box, .data-table, details, summary {
    border-color: #000 !important;
    background: #fff !important;
  }
  h1 { font-size: 16px !important; margin: 6px 0 !important; }
  h2 { font-size: 14px !important; margin: 6px 0 !important; }
  h3 { font-size: 12px !important; margin: 6px 0 !important; }
  p { margin: 4px 0 !important; }
  .context-box, .metric-card, details { padding: 8px !important; }
  .table-container { padding: 6px !important; }
`
