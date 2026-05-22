export function stampParts(d = new Date()) {
  const yyyy = String(d.getFullYear())
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return { yyyy, mm, dd, hh, mi, ss }
}

export function parseStampFromName(name: string) {
  const m = name.match(/_(\d{8})_(\d{6})\.pdf$/)
  if (!m) return 0
  const d = m[1]
  const t = m[2]
  const y = Number(d.slice(0, 4))
  const mo = Number(d.slice(4, 6))
  const day = Number(d.slice(6, 8))
  const hh = Number(t.slice(0, 2))
  const mi = Number(t.slice(2, 4))
  const ss = Number(t.slice(4, 6))
  const dt = new Date(y, mo - 1, day, hh, mi, ss).getTime()
  return Number.isFinite(dt) ? dt : 0
}
