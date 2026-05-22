export function sanitizeNoNumbers(text: string) {
  const t = String(text || '')
    .replace(/[0-9][0-9.,:%]*/g, '—')
    .replace(/\s+/g, ' ')
    .trim()
  return t
}

export function hostnameOf(u: string) {
  try {
    return new URL(u).hostname
  } catch {
    return ''
  }
}

export function normalizeWebItemId(url: string, title: string) {
  const key = `${String(url || '').trim()}|${String(title || '').trim()}`
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return `web_${h}`
}
