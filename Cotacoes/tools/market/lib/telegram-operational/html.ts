export function escapeHtml(s: string) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function htmlShell(title: string, subtitle: string, body: string, wrapWidth = 1080) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root{--bg:#0b0f14;--card:#0f1722;--muted:#9fb0c2;--text:#e9f1fb;--line:#223043;--accent:#53b1fd;--good:#22c55e;--bad:#ef4444;--mid:#eab308;}
    html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font-family:Segoe UI, Roboto, Arial, sans-serif;}
    .wrap{width:${Math.max(900, Math.min(2000, Math.floor(wrapWidth)))}px;margin:0 auto;padding:32px;}
    .card{background:linear-gradient(180deg, rgba(83,177,253,.08), rgba(83,177,253,0)) , var(--card);border:1px solid var(--line);border-radius:18px;padding:26px 26px 22px;}
    .top{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:18px;}
    .title{font-size:34px;font-weight:800;letter-spacing:.4px;line-height:1.1;}
    .subtitle{margin-top:6px;font-size:18px;color:var(--muted);}
    .stamp{font-size:14px;color:var(--muted);text-align:right;white-space:nowrap;}
    .grid{display:grid;grid-template-columns:1fr;gap:14px;}
    .box{border:1px solid var(--line);border-radius:14px;padding:14px 14px 12px;background:rgba(255,255,255,.02);}
    .h{font-size:16px;font-weight:800;letter-spacing:.25px;margin:0 0 10px 0;color:#d7e6f7;}
    table{width:100%;border-collapse:collapse;font-size:15px;}
    td{padding:7px 0;border-top:1px solid rgba(34,48,67,.55);vertical-align:top;}
    tr:first-child td{border-top:none;}
    .k{color:var(--muted);width:44%;}
    .v{font-weight:700;}
    .pill{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.02);font-size:13px;color:var(--muted);}
    .pillGood{border-color:rgba(34,197,94,.35);color:var(--good);background:rgba(34,197,94,.08);}
    .pillBad{border-color:rgba(239,68,68,.35);color:var(--bad);background:rgba(239,68,68,.08);}
    .pillMid{border-color:rgba(234,179,8,.35);color:var(--mid);background:rgba(234,179,8,.08);}
    .arrowUp{color:var(--good);font-weight:900;}
    .arrowDown{color:var(--bad);font-weight:900;}
    .arrowEq{color:var(--mid);font-weight:900;}
    .muted{color:var(--muted);}
    .small{font-size:13px;}
    .cols{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
    .list{margin:0;padding:0 0 0 16px;}
    .list li{margin:6px 0;}
    .mgrid{display:grid;grid-template-columns:repeat(5, 1fr);gap:12px;margin:2px 0 12px 0;}
    .mcard{border:1px solid rgba(34,48,67,.8);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);min-height:92px;display:flex;flex-direction:column;gap:6px;}
    .micon{font-size:16px;opacity:.9;line-height:1;}
    .mval{font-size:24px;font-weight:900;letter-spacing:.4px;line-height:1.1;}
    .mlabel{font-size:12px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;}
    .mchg{font-size:13px;color:var(--muted);line-height:1.2;}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="top">
        <div>
          <div class="title">${escapeHtml(title)}</div>
          <div class="subtitle">${escapeHtml(subtitle)}</div>
        </div>
        <div class="stamp">${escapeHtml(new Date().toISOString())}</div>
      </div>
      ${body}
    </div>
  </div>
</body>
</html>`
}

export function arrowClass(a: string) {
  if (a === '↑') return 'arrowUp'
  if (a === '↓') return 'arrowDown'
  if (a === '≈') return 'arrowEq'
  return 'muted'
}

export function lineRow(k: string, valueHtml: string) {
  return `<tr><td class="k">${escapeHtml(k)}</td><td class="v">${valueHtml}</td></tr>`
}

export function valueArrow(a: string, pct: string) {
  return `<span class="${arrowClass(a)}">${escapeHtml(a)}</span> <span class="muted">${escapeHtml(pct)}</span>`
}

export function top3FromSummary(xs: string[] | undefined | null) {
  const arr = Array.isArray(xs) ? xs.filter(Boolean) : []
  return arr.slice(0, 3)
}

export function stripMd(s: string) {
  return String(s || '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
